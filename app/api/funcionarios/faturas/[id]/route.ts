import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../lib/auth';
import pool, { query } from '../../../../../lib/db';

function parseDate(value: unknown) {
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date: Date | null) {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}

async function carregarFatura(id: number) {
  const faturas = (await query(
    `SELECT f.*, func.nome AS funcionario_nome, func.cargo,
            COALESCE((SELECT SUM(valor_pago) FROM cant_pagamentos_funcionarios pg WHERE pg.id_fatura = f.id), 0) AS total_pago
     FROM cant_faturas_funcionarios f
     LEFT JOIN funcionarios func ON func.codigo = f.codigo_funcionario
     WHERE f.id = ?`,
    [id]
  )) as any[];
  const fatura = Array.isArray(faturas) ? faturas[0] : null;
  if (!fatura) return null;

  const itens = await query(
    `SELECT vf.id, vf.id_venda, vf.valor_original, vf.valor_aplicado, vf.desconto_aplicado, vf.mes_referencia,
            vf.pago, vf.dt_lancamento, v.dt_venda, v.usuario, u.nome AS usuario_nome
     FROM cant_vendas_funcionarios vf
     INNER JOIN cant_vendas v ON v.id = vf.id_venda
     LEFT JOIN cant_usuarios_cantina u ON u.id = v.usuario
     WHERE vf.id_fatura = ?
     ORDER BY v.dt_venda ASC`,
    [id]
  );

  const pagamentos = await query(
    `SELECT pg.*, u.nome AS usuario_nome
     FROM cant_pagamentos_funcionarios pg
     LEFT JOIN cant_usuarios_cantina u ON u.id = pg.usuario
     WHERE pg.id_fatura = ?
     ORDER BY pg.dt_pagamento DESC`,
    [id]
  );

  const totalPago = Number(fatura.total_pago ?? 0);
  const valorTotal = Number(fatura.valor_total ?? 0);

  return {
    ...fatura,
    itens,
    pagamentos,
    saldo_aberto: Number((valorTotal - totalPago).toFixed(2)),
  };
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
    }

    const fatura = await carregarFatura(id);
    if (!fatura) {
      return NextResponse.json({ error: 'Fatura não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: fatura });
  } catch (error) {
    console.error('Erro ao consultar fatura de funcionário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const conn = await pool.getConnection();
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
    }

    const body = await req.json();
    const status = body?.status ? body.status.toString().trim().toUpperCase() : undefined;
    const possuiDtVencimento = Object.prototype.hasOwnProperty.call(body || {}, 'dt_vencimento');
    const dt_vencimento = possuiDtVencimento ? parseDate(body?.dt_vencimento) : undefined;
    const observacoes =
      body?.observacoes !== undefined ? (body.observacoes || '').toString().trim() : undefined;

    if (status && !['GERADA', 'ENVIADA', 'PAGA', 'VENCIDA', 'PARCIAL'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    await conn.beginTransaction();

    const [existentes] = await conn.query(
      `SELECT * FROM cant_faturas_funcionarios WHERE id = ? LIMIT 1 FOR UPDATE`,
      [id]
    );
    const atual = Array.isArray(existentes) ? (existentes as any[])[0] : null;
    if (!atual) {
      await conn.rollback();
      return NextResponse.json({ error: 'Fatura não encontrada' }, { status: 404 });
    }

    const campos: string[] = [];
    const valores: (string | number | null)[] = [];

    if (status) {
      campos.push('status = ?');
      valores.push(status);
      if (status === 'PAGA') {
        campos.push('dt_pagamento = NOW()');
      }
      if (status === 'ENVIADA') {
        campos.push('dt_envio_email = NOW()');
      }
    }
    if (dt_vencimento !== undefined) {
      campos.push('dt_vencimento = ?');
      valores.push(dt_vencimento ? formatDate(dt_vencimento) : null);
    }
    if (observacoes !== undefined) {
      campos.push('observacoes = ?');
      valores.push(observacoes || null);
    }

    if (campos.length === 0) {
      await conn.rollback();
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
    }

    await conn.query(`UPDATE cant_faturas_funcionarios SET ${campos.join(', ')} WHERE id = ?`, [
      ...valores,
      id,
    ]);

    if (status === 'PAGA') {
      await conn.query(
        `UPDATE cant_vendas_funcionarios SET pago = 1, dt_pagamento = NOW() WHERE id_fatura = ?`,
        [id]
      );
    }

    await conn.commit();

    const fatura = await carregarFatura(id);
    return NextResponse.json({ success: true, data: fatura });
  } catch (error) {
    try {
      await conn.rollback();
    } catch {}
    console.error('Erro ao atualizar fatura de funcionário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  } finally {
    conn.release();
  }
}
