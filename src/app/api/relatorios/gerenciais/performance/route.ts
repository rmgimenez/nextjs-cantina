import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { query } from "@/lib/db";

async function ensureAdmin(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const p = (await verifySessionToken(token)) as any;
    return p?.tipo === "ADMIN" ? p : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const admin = await ensureAdmin(req);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const { searchParams } = new URL(req.url);
    const inicio = searchParams.get("inicio");
    const fim = searchParams.get("fim");
    const defaultInicio = new Date();
    defaultInicio.setDate(defaultInicio.getDate() - 30);
    const inicioParam = inicio || defaultInicio.toISOString().slice(0, 10);
    const fimParam = fim || new Date().toISOString().slice(0, 10);
    const params = [inicioParam + " 00:00:00", fimParam + " 23:59:59"];
    const perf = await query<any>(
      `SELECT u.id, u.nome, COUNT(DISTINCT v.id) AS vendas, SUM(v.valor_liquido) AS total
         FROM cant_venda v
         JOIN cant_usuarios u ON u.id = v.usuario_id
        WHERE v.created_at BETWEEN ? AND ?
        GROUP BY u.id, u.nome
        ORDER BY total DESC`,
      params
    );
    const totalGeral = perf.reduce(
      (a: number, r: any) => a + Number(r.total || 0),
      0
    );
    return NextResponse.json({
      ok: true,
      periodo: { inicio: inicioParam, fim: fimParam },
      totalGeral,
      performance: perf,
    });
  } catch (err) {
    console.error("GET /api/relatorios/gerenciais/performance error", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
