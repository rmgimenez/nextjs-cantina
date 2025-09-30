import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import pool, { QueryRow, query } from '../../../../lib/db';

type PendenteRow = RowDataPacket & {
  codigo_funcionario: number;
  quantidade_itens: number;
  valor_total: number;
};

type FaturaRow = QueryRow<{
  id: number;
  codigo_funcionario: number;
  mes_referencia: string;
  valor_total: number | string;
  quantidade_itens: number;
  status: string;
  dt_vencimento: string;
  dt_pagamento: Date | string | null;
  dt_envio_email: Date | string | null;
  funcionario_nome: string | null;
  cargo: string | null;
}>;

type TotaisRow = RowDataPacket & {
  quantidade_itens: number;
  valor_total: number;
};

type PagamentoTotalRow = RowDataPacket & {
  total_pago: number;
};

function parseDate(value: unknown) {
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date: Date | null) {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

function roundCurrency(value: unknown) {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100) / 100;
}

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const url = new URL(req.url);
    const mes = (url.searchParams.get('mes') || '').trim();
    const status = (url.searchParams.get('status') || '').trim();
    const codigo = url.searchParams.get('codigo_funcionario');
    const search = (url.searchParams.get('search') || '').trim();

    let sql = `
      SELECT f.*, func.nome AS funcionario_nome, func.cargo,
             COALESCE((SELECT SUM(valor_pago) FROM cant_pagamentos_funcionarios pg WHERE pg.id_fatura = f.id), 0) AS total_pago
      FROM cant_faturas_funcionarios f
      LEFT JOIN funcionarios func ON func.codigo = f.codigo_funcionario
      WHERE 1 = 1
    `;
    const params: (string | number)[] = [];

    if (mes) {
      sql += ` AND f.mes_referencia = ?`;
      params.push(mes);
    }
    if (status) {
      sql += ` AND f.status = ?`;
      params.push(status);
    }
    if (codigo) {
      const cod = Number(codigo);
      if (Number.isFinite(cod) && cod > 0) {
        sql += ` AND f.codigo_funcionario = ?`;
        params.push(cod);
      }
    }
    if (search) {
      sql += ` AND (func.nome LIKE ? OR func.cargo LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY f.mes_referencia DESC, func.nome ASC`;

    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Erro ao listar faturas de funcionários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const conn = await pool.getConnection();
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const mes_referencia = (body?.mes_referencia || '').toString().trim();
    const codigo_funcionario = body?.codigo_funcionario ? Number(body.codigo_funcionario) : null;
    const dt_vencimento_informada = parseDate(body?.dt_vencimento);

    if (!mes_referencia || !/^\d{4}-\d{2}$/.test(mes_referencia)) {
      return NextResponse.json(
        { error: 'Mês de referência inválido (formato YYYY-MM)' },
        { status: 400 }
      );
    }

    if (
      codigo_funcionario !== null &&
      (!Number.isFinite(codigo_funcionario) || codigo_funcionario <= 0)
    ) {
      return NextResponse.json({ error: 'Código de funcionário inválido' }, { status: 400 });
    }

    const dt_vencimento_padrao = (() => {
      if (dt_vencimento_informada) return dt_vencimento_informada;
      const [ano, mes] = mes_referencia.split('-').map(Number);
      const lastDay = new Date(ano, mes, 0);
      return lastDay;
    })();

    await conn.beginTransaction();

    const pendentesQuery = `
      SELECT codigo_funcionario,
             COUNT(*) AS quantidade_itens,
             SUM(valor_aplicado) AS valor_total
      FROM cant_vendas_funcionarios
      WHERE mes_referencia = ?
        AND pago = 0
        AND id_fatura IS NULL
        ${codigo_funcionario ? 'AND codigo_funcionario = ?' : ''}
      GROUP BY codigo_funcionario
    `;
    const params = codigo_funcionario ? [mes_referencia, codigo_funcionario] : [mes_referencia];
    const [pendentesRows] = await conn.query<PendenteRow[]>(pendentesQuery, params);
    const pendentes = pendentesRows;

    if (pendentes.length === 0) {
      await conn.rollback();
      return NextResponse.json({ error: 'Nenhuma venda pendente para fatura' }, { status: 400 });
    }

    const faturasProcessadas = new Set<number>();
    const faturasCriadas: number[] = [];

    for (const pendente of pendentes) {
      const codigo = Number(pendente.codigo_funcionario);
      if (!Number.isFinite(codigo)) continue;

      const [existentes] = await conn.query<RowDataPacket[]>(
        `SELECT * FROM cant_faturas_funcionarios WHERE codigo_funcionario = ? AND mes_referencia = ? LIMIT 1 FOR UPDATE`,
        [codigo, mes_referencia]
      );

      const atual = existentes[0] ?? null;

      let idFatura: number;
      if (!atual) {
        const [insertResult] = await conn.query<ResultSetHeader>(
          `INSERT INTO cant_faturas_funcionarios
           (codigo_funcionario, mes_referencia, valor_total, quantidade_itens, status, dt_vencimento, dt_criacao, id_usuario_geracao)
           VALUES (?, ?, ?, ?, 'GERADA', ?, NOW(), ?)`,
          [
            codigo,
            mes_referencia,
            roundCurrency(pendente.valor_total ?? 0),
            Number(pendente.quantidade_itens || 0),
            formatDate(dt_vencimento_padrao),
            user.id,
          ]
        );
        idFatura = Number(insertResult.insertId);
        faturasCriadas.push(idFatura);
      } else {
        idFatura = Number(atual.id);
      }

      await conn.query(
        `UPDATE cant_vendas_funcionarios
         SET id_fatura = ?
         WHERE codigo_funcionario = ? AND mes_referencia = ? AND id_fatura IS NULL`,
        [idFatura, codigo, mes_referencia]
      );

      const [totaisRows] = await conn.query<TotaisRow[]>(
        `SELECT COUNT(*) AS quantidade_itens,
                COALESCE(SUM(valor_aplicado), 0) AS valor_total
         FROM cant_vendas_funcionarios
         WHERE id_fatura = ?`,
        [idFatura]
      );
      const totais = totaisRows[0] ?? null;
      const quantidadeItens = Number(totais?.quantidade_itens ?? 0);
      const valorTotal = roundCurrency(totais?.valor_total ?? 0);

      const statusAtual = atual
        ? String((atual as { status?: string }).status || 'GERADA').toUpperCase()
        : 'GERADA';
      let novoStatus = statusAtual;
      let dtPagamento: Date | null = (atual?.dt_pagamento as Date | null) ?? null;

      if (statusAtual === 'PAGA') {
        const [pagamentosRows] = await conn.query<PagamentoTotalRow[]>(
          `SELECT COALESCE(SUM(valor_pago), 0) AS total_pago
           FROM cant_pagamentos_funcionarios
           WHERE id_fatura = ?`,
          [idFatura]
        );
        const totalPago = roundCurrency(pagamentosRows[0]?.total_pago ?? 0);

        if (totalPago + 0.009 < valorTotal) {
          novoStatus = totalPago > 0 ? 'PARCIAL' : 'GERADA';
          dtPagamento = null;
        }
      }

      const camposUpdate = ['valor_total = ?', 'quantidade_itens = ?', 'dt_pagamento = ?'];
      const valoresUpdate: (number | string | null | Date)[] = [
        valorTotal,
        quantidadeItens,
        dtPagamento,
      ];

      if (novoStatus !== statusAtual) {
        camposUpdate.push('status = ?');
        valoresUpdate.push(novoStatus);
      }

      await conn.query(
        `UPDATE cant_faturas_funcionarios SET ${camposUpdate.join(', ')} WHERE id = ?`,
        [...valoresUpdate, idFatura]
      );

      await conn.query(
        `UPDATE cant_contas_funcionarios SET dt_alteracao = NOW() WHERE codigo_funcionario = ?`,
        [codigo]
      );

      faturasProcessadas.add(idFatura);
    }

    if (faturasProcessadas.size === 0) {
      await conn.rollback();
      return NextResponse.json(
        { error: 'Nenhuma fatura pôde ser processada para os funcionários selecionados' },
        { status: 409 }
      );
    }

    await conn.commit();

    const idsFaturas = Array.from(faturasProcessadas);
    const placeholders = idsFaturas.map(() => '?').join(',');
    const faturas = await query<FaturaRow[]>(
      `SELECT f.*, func.nome AS funcionario_nome, func.cargo
       FROM cant_faturas_funcionarios f
       LEFT JOIN funcionarios func ON func.codigo = f.codigo_funcionario
       WHERE f.id IN (${placeholders})`,
      idsFaturas
    );

    return NextResponse.json({
      success: true,
      data: faturas,
      meta: {
        novas: faturasCriadas.length,
        atualizadas: idsFaturas.filter((id) => !faturasCriadas.includes(id)).length,
      },
    });
  } catch (error) {
    try {
      await conn.rollback();
    } catch {}
    console.error('Erro ao gerar faturas de funcionários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  } finally {
    conn.release();
  }
}
