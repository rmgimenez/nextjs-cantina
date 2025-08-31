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
    const diarios = await query<any>(
      `SELECT DATE(created_at) AS data, COUNT(*) AS vendas, SUM(valor_liquido) AS total
         FROM cant_venda
        WHERE created_at BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)`,
      params
    );
    const sumario = diarios.reduce(
      (acc: any, d: any) => {
        acc.vendas += Number(d.vendas);
        acc.total += Number(d.total || 0);
        return acc;
      },
      { vendas: 0, total: 0 }
    );
    return NextResponse.json({
      ok: true,
      periodo: { inicio: inicioParam, fim: fimParam },
      sumario,
      diarios,
    });
  } catch (err) {
    console.error("GET /api/relatorios/gerenciais/vendas error", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
