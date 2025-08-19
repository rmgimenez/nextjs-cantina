import { COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

async function ensureAuth(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifySessionToken(token);
  return payload as any;
}

export async function GET(req: NextRequest) {
  try {
    await ensureAuth(req);
    const search = new URL(req.url).searchParams.get('q');
    let sql = 'SELECT id, descricao, codigo, exige_peso, ativo, created_at FROM cant_produto_tipo';
    const params: any[] = [];
    if (search) {
      sql += ' WHERE descricao LIKE ? OR codigo LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY descricao LIMIT 200';
    const rows = await query(sql, params);
    return NextResponse.json({ ok: true, tipos: rows });
  } catch (e) {
    console.error('GET /api/produtos/tipos', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await ensureAuth(req);
    if (!user || !['ADMIN', 'ESTOQUISTA'].includes(user.tipo))
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    const { descricao, codigo, exigePeso } = await req.json();
    if (!descricao || !codigo)
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    const result: any = await query(
      'INSERT INTO cant_produto_tipo (descricao, codigo, exige_peso, ativo) VALUES (?, ?, ?, 1)',
      [descricao, codigo, exigePeso ? 1 : 0]
    );
    return NextResponse.json({ ok: true, id: result.insertId });
  } catch (e) {
    console.error('POST /api/produtos/tipos', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await ensureAuth(req);
    if (!user || !['ADMIN', 'ESTOQUISTA'].includes(user.tipo))
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    const { id, descricao, exige_peso, ativo } = await req.json();
    if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
    await query(
      'UPDATE cant_produto_tipo SET descricao = COALESCE(?, descricao), exige_peso = COALESCE(?, exige_peso), ativo = COALESCE(?, ativo) WHERE id = ?',
      [descricao, exige_peso, typeof ativo === 'number' ? ativo : ativo ? 1 : 0, id]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PUT /api/produtos/tipos', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await ensureAuth(req);
    if (!user || !['ADMIN', 'ESTOQUISTA'].includes(user.tipo))
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
    await query('UPDATE cant_produto_tipo SET ativo = 0 WHERE id = ?', [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/produtos/tipos', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
