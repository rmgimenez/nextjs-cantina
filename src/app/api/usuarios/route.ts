import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, verifySessionToken } from '../../../lib/auth';
import { query } from '../../../lib/db';

async function ensureAdmin(req: NextRequest) {
  // Verifica token e role (simples)
  const token =
    req.cookies.get(COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const payload = await verifySessionToken(token);
  if (!payload) return false;
  return (payload as any).tipo === 'ADMIN';
}

export async function GET(req: NextRequest) {
  if (!(await ensureAdmin(req))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const rows = await query<any[]>(
      'SELECT id, usuario, nome, tipo, ativo FROM cant_usuarios ORDER BY usuario LIMIT 100'
    );
    return NextResponse.json({ ok: true, usuarios: rows });
  } catch (err: any) {
    console.error('GET /api/usuarios error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await ensureAdmin(req))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const body = await req.json();
    const { usuario, nome, tipo, senha } = body || {};
    if (!usuario || !nome || !tipo || !senha)
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

    // cria com senha hash via script existente (server-side bcryptjs)
    const bcrypt = (await import('bcryptjs')).default;
    const senhaHash = await bcrypt.hash(senha, 10);

    const res = await query<any>(
      'INSERT INTO cant_usuarios (usuario, nome, tipo, senha_hash, ativo) VALUES (?, ?, ?, ?, 1)',
      [usuario, nome, tipo, senhaHash]
    );
    return NextResponse.json({ ok: true, insertId: (res as any).insertId });
  } catch (err: any) {
    console.error('POST /api/usuarios error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await ensureAdmin(req))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const body = await req.json();
    const { id, nome, tipo, ativo } = body || {};
    if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
    await query('UPDATE cant_usuarios SET nome = ?, tipo = ?, ativo = ? WHERE id = ?', [
      nome,
      tipo,
      ativo ? 1 : 0,
      id,
    ]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('PUT /api/usuarios error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await ensureAdmin(req))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
    // Soft delete: desativa
    await query('UPDATE cant_usuarios SET ativo = 0 WHERE id = ?', [id]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('DELETE /api/usuarios error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
