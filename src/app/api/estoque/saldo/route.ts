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
    const produtoId = url.searchParams.get('produtoId');

    let sql = `SELECT p.id AS produto_id,
                      p.nome,
                      COALESCE(vs.saldo,0) AS estoque_atual,
                      p.estoque_minimo,
                      CASE WHEN COALESCE(vs.saldo,0) <= COALESCE(p.estoque_minimo,0) THEN 'low' ELSE 'ok' END AS status
               FROM cant_produtos p
               LEFT JOIN cant_view_estoque_saldo vs ON vs.produto_id = p.id
               WHERE p.ativo = 1`;

    const params: any[] = [];
    if (produtoId) {
      sql += ' AND p.id = ?';
      params.push(produtoId);
    }

    sql += ' ORDER BY estoque_atual ASC, p.nome LIMIT 500';

    const rows = await query(sql, params);
    return NextResponse.json({ ok: true, saldo: rows });
  } catch (e) {
    console.error('GET /api/estoque/saldo', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
