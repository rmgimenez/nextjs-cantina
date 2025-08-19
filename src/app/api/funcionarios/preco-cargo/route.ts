import { COOKIE_NAME, hasAnyRole, ROLE_ADMIN, verifySessionToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

async function getSession(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifySessionToken(token);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !hasAnyRole(session, [ROLE_ADMIN])) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    const rows = await query<any[]>(
      'SELECT id, cargo, descricao, valor_refeicao, ativo FROM cant_preco_cargo ORDER BY cargo LIMIT 200'
    );
    return NextResponse.json({ ok: true, precos: rows });
  } catch (err) {
    console.error('GET /api/funcionarios/preco-cargo error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !hasAnyRole(session, [ROLE_ADMIN])) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    const body = await req.json();
    const { cargo, descricao, valor } = body || {};
    if (!cargo || valor == null) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }
    await query(
      'INSERT INTO cant_preco_cargo (cargo, descricao, valor_refeicao, ativo) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE descricao=VALUES(descricao), valor_refeicao=VALUES(valor_refeicao), ativo=1',
      [cargo, descricao || cargo, valor]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/funcionarios/preco-cargo error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !hasAnyRole(session, [ROLE_ADMIN])) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    const body = await req.json();
    const { id, cargo, descricao, valor, ativo } = body || {};
    if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
    await query(
      'UPDATE cant_preco_cargo SET cargo=?, descricao=?, valor_refeicao=?, ativo=? WHERE id=?',
      [cargo, descricao, valor, ativo ? 1 : 0, id]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/funcionarios/preco-cargo error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
