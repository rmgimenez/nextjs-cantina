import {
  COOKIE_NAME,
  hasAnyRole,
  ROLE_ADMIN,
  ROLE_ATENDENTE,
  verifySessionToken,
} from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

async function ensureAuth(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

// GET /api/funcionarios/conta?funcionarioId=123&mes=9&ano=2025
export async function GET(req: NextRequest) {
  const user = await ensureAuth(req);
  if (!user || !hasAnyRole(user, [ROLE_ADMIN, ROLE_ATENDENTE]))
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const funcionarioId = searchParams.get('funcionarioId');
    const mes = Number(searchParams.get('mes') || new Date().getMonth() + 1);
    const ano = Number(searchParams.get('ano') || new Date().getFullYear());

    if (!funcionarioId) return NextResponse.json({ ok: true, lancamentos: [] });

    const lancamentos = await query<any[]>(
      `SELECT l.id, l.funcionario_id, l.venda_id, l.mes, l.ano, l.valor, l.created_at
         FROM cant_funcionario_conta_lanc l
        WHERE l.funcionario_id = ? AND l.mes = ? AND l.ano = ?
        ORDER BY l.created_at DESC`,
      [funcionarioId, mes, ano]
    );

    // total
    const total = lancamentos.reduce((acc, r) => acc + Number(r.valor || 0), 0);

    return NextResponse.json({ ok: true, lancamentos, total });
  } catch (err) {
    console.error('GET /api/funcionarios/conta error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// POST /api/funcionarios/conta  { funcionarioId, mes, ano, valor, vendaId (opcional) }
export async function POST(req: NextRequest) {
  const user = await ensureAuth(req);
  if (!user || !hasAnyRole(user, [ROLE_ADMIN, ROLE_ATENDENTE]))
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const body = await req.json();
    const { funcionarioId, mes, ano, valor, vendaId } = body || {};
    if (!funcionarioId || !mes || !ano || valor == null)
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

    await query(
      'INSERT INTO cant_funcionario_conta_lanc (funcionario_id, venda_id, mes, ano, valor, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [funcionarioId, vendaId || null, mes, ano, valor]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/funcionarios/conta error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
