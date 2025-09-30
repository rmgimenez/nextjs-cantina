import type { RowDataPacket } from 'mysql2/promise';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../../lib/auth';
import pool, { QueryRow, query } from '../../../../../../lib/db';

type FaturaResumoRow = QueryRow<{
  id: number;
  codigo_funcionario: number | null;
  valor_total: number | string;
  status: string;
  total_pago: number | string;
}>;

type PagamentoDetalheRow = QueryRow<{
  id: number;
  id_fatura: number;
  valor_pago: number | string;
  forma_pagamento: string;
  dt_pagamento: string;
  observacoes: string | null;
  usuario: number;
  usuario_nome: string | null;
}>;

function parseValor(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(
    typeof value === 'string' ? value.replace(/\./g, '').replace(',', '.') : value
  );
  return Number.isFinite(num) ? Number(num.toFixed(2)) : null;
}

async function carregarResumoFatura(id: number) {
  const rows = await query<FaturaResumoRow[]>(
    `SELECT f.*, COALESCE((SELECT SUM(valor_pago) FROM cant_pagamentos_funcionarios pg WHERE pg.id_fatura = f.id), 0) AS total_pago
     FROM cant_faturas_funcionarios f
     WHERE f.id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

const FORMAS = ['DINHEIRO', 'CARTAO', 'TRANSFERENCIA', 'DESCONTO_FOLHA'];

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const conn = await pool.getConnection();
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
    }

    const body = await req.json();
    const valor_pago = parseValor(body?.valor_pago);
    const forma_pagamento = body?.forma_pagamento
      ? body.forma_pagamento.toString().trim().toUpperCase()
      : null;
    const observacoes = body?.observacoes ? body.observacoes.toString().trim() : null;

    if (valor_pago === null || valor_pago <= 0) {
      return NextResponse.json({ error: 'Valor do pagamento inválido' }, { status: 400 });
    }
    if (!forma_pagamento || !FORMAS.includes(forma_pagamento)) {
      return NextResponse.json({ error: 'Forma de pagamento inválida' }, { status: 400 });
    }

    await conn.beginTransaction();

    const [faturaRows] = await conn.query<
      (RowDataPacket & {
        valor_total: number | string;
        status: string;
        codigo_funcionario: number | null;
      })[]
    >(`SELECT * FROM cant_faturas_funcionarios WHERE id = ? FOR UPDATE`, [id]);
    const fatura = faturaRows[0] ?? null;
    if (!fatura) {
      await conn.rollback();
      return NextResponse.json({ error: 'Fatura não encontrada' }, { status: 404 });
    }

    await conn.query(
      `INSERT INTO cant_pagamentos_funcionarios
       (id_fatura, valor_pago, forma_pagamento, dt_pagamento, observacoes, usuario)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [id, valor_pago, forma_pagamento, observacoes, user.id]
    );

    const [totalPagoRows] = await conn.query<(RowDataPacket & { total_pago: number | string })[]>(
      `SELECT COALESCE(SUM(valor_pago), 0) AS total_pago FROM cant_pagamentos_funcionarios WHERE id_fatura = ?`,
      [id]
    );
    const totalPago = Number(totalPagoRows[0]?.total_pago ?? 0);
    const valorFatura = Number(fatura.valor_total);
    const saldoRestante = Number((valorFatura - totalPago).toFixed(2));

    let novoStatus = fatura.status as string;
    if (saldoRestante <= 0.009) {
      novoStatus = 'PAGA';
    } else if (totalPago > 0) {
      novoStatus = 'PARCIAL';
    } else {
      novoStatus = 'GERADA';
    }

    await conn.query(
      `UPDATE cant_faturas_funcionarios
       SET status = ?,
           dt_pagamento = CASE WHEN ? = 'PAGA' THEN NOW() ELSE dt_pagamento END
       WHERE id = ?`,
      [novoStatus, novoStatus, id]
    );

    await conn.query(
      `UPDATE cant_vendas_funcionarios
       SET pago = CASE WHEN ? = 'PAGA' THEN 1 ELSE 0 END
       WHERE id_fatura = ?`,
      [novoStatus, id]
    );

    if (fatura.codigo_funcionario) {
      await conn.query(
        `UPDATE cant_contas_funcionarios SET dt_alteracao = NOW() WHERE codigo_funcionario = ?`,
        [fatura.codigo_funcionario]
      );
    }

    await conn.commit();

    const resumo = await carregarResumoFatura(id);
    return NextResponse.json({
      success: true,
      data: {
        status: novoStatus,
        total_pago: Number(totalPago.toFixed(2)),
        saldo_restante: saldoRestante < 0 ? 0 : saldoRestante,
        fatura: resumo,
      },
    });
  } catch (error) {
    try {
      await conn.rollback();
    } catch {}
    console.error('Erro ao registrar pagamento de fatura:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
    }

    const pagamentos = await query<PagamentoDetalheRow[]>(
      `SELECT pg.*, u.nome AS usuario_nome
       FROM cant_pagamentos_funcionarios pg
       LEFT JOIN cant_usuarios_cantina u ON u.id = pg.usuario
       WHERE pg.id_fatura = ?
       ORDER BY pg.dt_pagamento DESC`,
      [id]
    );

    return NextResponse.json({ success: true, data: pagamentos });
  } catch (error) {
    console.error('Erro ao listar pagamentos de fatura:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
