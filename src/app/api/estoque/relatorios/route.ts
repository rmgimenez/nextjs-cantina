import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

async function ensureAuth(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const payload = await verifySessionToken(token);
  return payload as any;
}

// GET /api/estoque/relatorios?diasTop=30&limiteMov=100
// Retorna agregados para relatórios de estoque (produtos em falta, baixo estoque, movimentações e ranking)
export async function GET(req: NextRequest) {
  try {
    const user = await ensureAuth(req);
    if (!user)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const diasTop = Number(url.searchParams.get("diasTop")) || 30;
    const limiteMov = Math.min(
      Number(url.searchParams.get("limiteMov")) || 100,
      500
    );

    const produtosSaldo: any[] = await query(
      `SELECT p.id, p.nome, COALESCE(vs.saldo,0) AS saldo, p.estoque_minimo, p.preco_unitario
       FROM cant_produtos p
       LEFT JOIN cant_view_estoque_saldo vs ON vs.produto_id = p.id
       WHERE p.ativo = 1
       ORDER BY p.nome`
    );

    const outOfStock = produtosSaldo.filter((p) => Number(p.saldo) === 0);
    const lowStock = produtosSaldo.filter(
      (p) =>
        Number(p.saldo) > 0 && Number(p.saldo) <= Number(p.estoque_minimo || 0)
    );

    const movimentacoesRecentes: any[] = await query(
      `SELECT em.id, em.produto_id, p.nome AS produto_nome, em.tipo_mov, em.quantidade, em.referencia, em.observacao, em.created_at
         FROM cant_estoque_mov em
         JOIN cant_produtos p ON p.id = em.produto_id
         ORDER BY em.id DESC
         LIMIT ?`,
      [limiteMov]
    );

    const produtosMaisVendidos: any[] = await query(
      `SELECT p.id, p.nome, SUM(vi.quantidade) AS quantidade, SUM(vi.valor_total) AS valor_total
         FROM cant_venda_item vi
         JOIN cant_venda v ON v.id = vi.venda_id AND v.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         JOIN cant_produtos p ON p.id = vi.produto_id
         GROUP BY p.id, p.nome
         HAVING quantidade > 0
         ORDER BY quantidade DESC
         LIMIT 50`,
      [diasTop]
    );

    return NextResponse.json({
      ok: true,
      periodoTop: { dias: diasTop },
      resumo: {
        totalProdutos: produtosSaldo.length,
        outOfStock: outOfStock.length,
        lowStock: lowStock.length,
      },
      outOfStock,
      lowStock,
      movimentacoesRecentes,
      produtosMaisVendidos,
    });
  } catch (e) {
    console.error("GET /api/estoque/relatorios", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
