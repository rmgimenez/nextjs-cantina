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
    let sql = `SELECT em.id, em.produto_id, p.nome AS produto_nome, em.tipo_mov, em.quantidade, em.custo_unitario, em.referencia, em.observacao, em.created_at
               FROM cant_estoque_mov em
               JOIN cant_produtos p ON p.id = em.produto_id
               WHERE 1=1`;
    const params: any[] = [];
    if (produtoId) {
      sql += ' AND em.produto_id = ?';
      params.push(produtoId);
    }
    sql += ' ORDER BY em.id DESC LIMIT 200';
    const rows = await query(sql, params);
    return NextResponse.json({ ok: true, movimentacoes: rows });
  } catch (e) {
    console.error('GET /api/estoque/movimentacoes', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await ensureAuth(req);
    if (!user || !['ADMIN', 'ESTOQUISTA'].includes(user.tipo))
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    const { produtoId, tipoMov, quantidade, custoUnitario, referencia, observacao } =
      await req.json();
    if (!produtoId || !tipoMov || !quantidade)
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    const allowed = ['ENTRADA', 'SAIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO'];
    if (!allowed.includes(tipoMov))
      return NextResponse.json({ error: 'tipo_invalido' }, { status: 400 });
    await query(
      'INSERT INTO cant_estoque_mov (produto_id, tipo_mov, quantidade, custo_unitario, referencia, observacao, usuario_id) VALUES (?,?,?,?,?,?,?)',
      [
        produtoId,
        tipoMov,
        quantidade,
        custoUnitario ?? null,
        referencia || null,
        observacao || null,
        user.id,
      ]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('POST /api/estoque/movimentacoes', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
