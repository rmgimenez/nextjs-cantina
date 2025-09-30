import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../lib/auth';
import { query } from '../../../../../lib/db';

function parseDecimal(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(
    typeof value === 'string' ? value.replace(/\./g, '').replace(',', '.') : value
  );
  return Number.isFinite(num) ? Number(num.toFixed(2)) : null;
}

export async function GET(_req: Request, context: { params: { codigo: string } }) {
  try {
    const codigo = Number(context.params?.codigo);
    if (!Number.isFinite(codigo) || codigo <= 0) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
    }

    const rows = await query(
      `SELECT v.*, cf.observacoes
       FROM vw_cant_contas_funcionarios v
       LEFT JOIN cant_contas_funcionarios cf ON cf.codigo_funcionario = v.codigo_funcionario
       WHERE v.codigo_funcionario = ? LIMIT 1`,
      [codigo]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Erro ao buscar conta de funcionário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: { codigo: string } }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const codigo = Number(context.params?.codigo);
    if (!Number.isFinite(codigo) || codigo <= 0) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
    }

    const body = await req.json();
    const limite_credito = parseDecimal(body?.limite_credito);
    const alerta_credito = parseDecimal(body?.alerta_credito);
    const possuiObservacoes = Object.prototype.hasOwnProperty.call(body || {}, 'observacoes');
    const observacoes = possuiObservacoes
      ? (body?.observacoes || '').toString().trim() || null
      : undefined;
    const ativo = body?.ativo === undefined ? undefined : Number(body.ativo) ? 1 : 0;

    const existente = await query(
      `SELECT id FROM cant_contas_funcionarios WHERE codigo_funcionario = ? LIMIT 1`,
      [codigo]
    );
    if (!existente || existente.length === 0) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    const campos: string[] = [];
    const valores: (number | string | null)[] = [];

    if (limite_credito !== null) {
      campos.push('limite_credito = ?');
      valores.push(limite_credito);
    } else if (body?.limite_credito === null) {
      campos.push('limite_credito = NULL');
    }

    if (alerta_credito !== null) {
      campos.push('alerta_credito = ?');
      valores.push(alerta_credito);
    } else if (body?.alerta_credito === null) {
      campos.push('alerta_credito = NULL');
    }

    if (possuiObservacoes) {
      campos.push('observacoes = ?');
      valores.push(observacoes ?? null);
    }

    if (ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(ativo);
    }

    campos.push('dt_alteracao = NOW()');

    await query(
      `UPDATE cant_contas_funcionarios SET ${campos.join(', ')} WHERE codigo_funcionario = ?`,
      [...valores, codigo]
    );

    const rows = await query(
      `SELECT v.*, cf.observacoes
       FROM vw_cant_contas_funcionarios v
       LEFT JOIN cant_contas_funcionarios cf ON cf.codigo_funcionario = v.codigo_funcionario
       WHERE v.codigo_funcionario = ? LIMIT 1`,
      [codigo]
    );

    return NextResponse.json({ success: true, data: rows ? rows[0] : null });
  } catch (error) {
    console.error('Erro ao atualizar conta de funcionário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
