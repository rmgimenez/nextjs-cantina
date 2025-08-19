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
    const user = await ensureAuth(req);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const url = new URL(req.url);
    const search = url.searchParams.get('q');
    const tipo = url.searchParams.get('tipo');
    let sql = `SELECT p.id,p.nome,p.descricao,p.preco_unitario,p.codigo_barra,p.estoque_minimo,p.ativo,
                      t.descricao AS tipo_descricao,t.codigo AS tipo_codigo,t.exige_peso,
                      COALESCE(vs.saldo,0) AS estoque_atual
               FROM cant_produtos p
               JOIN cant_produto_tipo t ON t.id = p.tipo_id
               LEFT JOIN cant_view_estoque_saldo vs ON vs.produto_id = p.id
               WHERE 1=1`;
    const params: any[] = [];
    if (search) {
      sql += ' AND (p.nome LIKE ? OR p.codigo_barra LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (tipo) {
      sql += ' AND t.codigo = ?';
      params.push(tipo);
    }
    sql += ' ORDER BY p.nome LIMIT 300';
    const rows = await query(sql, params);
    return NextResponse.json({ ok: true, produtos: rows });
  } catch (e) {
    console.error('GET /api/produtos', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await ensureAuth(req);
    if (!user || !['ADMIN', 'ESTOQUISTA'].includes(user.tipo))
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    const { tipoId, nome, descricao, precoUnitario, codigoBarra, estoqueMinimo } = await req.json();
    if (!tipoId || !nome || precoUnitario === undefined)
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    const result: any = await query(
      'INSERT INTO cant_produtos (tipo_id, nome, descricao, preco_unitario, codigo_barra, estoque_minimo, ativo) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [tipoId, nome, descricao, precoUnitario, codigoBarra || null, estoqueMinimo ?? 0]
    );
    return NextResponse.json({ ok: true, id: result.insertId });
  } catch (e) {
    console.error('POST /api/produtos', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await ensureAuth(req);
    if (!user || !['ADMIN', 'ESTOQUISTA'].includes(user.tipo))
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    const { id, nome, descricao, preco_unitario, codigo_barra, estoque_minimo, ativo, tipo_id } =
      await req.json();
    if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
    await query(
      `UPDATE cant_produtos SET 
         nome = COALESCE(?, nome),
         descricao = COALESCE(?, descricao),
         preco_unitario = COALESCE(?, preco_unitario),
         codigo_barra = COALESCE(?, codigo_barra),
         estoque_minimo = COALESCE(?, estoque_minimo),
         ativo = COALESCE(?, ativo),
         tipo_id = COALESCE(?, tipo_id)
       WHERE id = ?`,
      [
        nome,
        descricao,
        preco_unitario,
        codigo_barra,
        estoque_minimo,
        typeof ativo === 'number' ? ativo : ativo ? 1 : 0,
        tipo_id,
        id,
      ]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PUT /api/produtos', e);
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
    await query('UPDATE cant_produtos SET ativo = 0 WHERE id = ?', [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/produtos', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
