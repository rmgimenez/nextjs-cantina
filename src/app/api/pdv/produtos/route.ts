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
    if (!user || !['ADMIN', 'ATENDENTE', 'ESTOQUISTA'].includes(user.tipo)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get('q');
    const categoria = url.searchParams.get('categoria');
    const apenasComEstoque = url.searchParams.get('estoque') === 'true';

    let sql = `
      SELECT 
        p.id,
        p.nome,
        p.descricao,
        p.preco_unitario,
        p.codigo_barra,
        p.estoque_minimo,
        t.descricao AS categoria,
        t.codigo AS categoria_codigo,
        t.exige_peso,
        COALESCE(vs.saldo, 0) AS estoque_atual
      FROM cant_produtos p
      JOIN cant_produto_tipo t ON t.id = p.tipo_id
      LEFT JOIN cant_view_estoque_saldo vs ON vs.produto_id = p.id
      WHERE p.ativo = 1
    `;

    const params: any[] = [];

    if (search) {
      sql += ' AND (p.nome LIKE ? OR p.codigo_barra LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (categoria) {
      sql += ' AND t.codigo = ?';
      params.push(categoria);
    }

    if (apenasComEstoque) {
      sql += ' AND COALESCE(vs.saldo, 0) > 0';
    }

    sql += ' ORDER BY p.nome LIMIT 50';

    const produtos = await query(sql, params);

    return NextResponse.json({
      ok: true,
      produtos: produtos.map((p: any) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        preco: parseFloat(p.preco_unitario),
        categoria: p.categoria,
        categoriaCode: p.categoria_codigo,
        codigoBarra: p.codigo_barra,
        estoque: parseFloat(p.estoque_atual),
        estoqueMinimo: parseFloat(p.estoque_minimo || 0),
        exigePeso: Boolean(p.exige_peso),
      })),
    });
  } catch (error) {
    console.error('GET /api/pdv/produtos', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
