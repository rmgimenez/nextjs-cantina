import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { query } from "@/lib/db";

async function ensureAdmin(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const payload = (await verifySessionToken(token)) as any;
    if (payload?.tipo === "ADMIN") return payload;
    return null;
  } catch {
    return null;
  }
}

// Lista faturas: /api/relatorios/funcionarios/faturas?ano=2025&mes=8
export async function GET(req: NextRequest) {
  const admin = await ensureAdmin(req);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const { searchParams } = new URL(req.url);
    const ano = Number(searchParams.get("ano")) || new Date().getFullYear();
    const mes = Number(searchParams.get("mes")) || new Date().getMonth() + 1;
    const funcionarioId = searchParams.get("funcionarioId");
    const params: any[] = [ano, mes];
    let filtroFuncionario = "";
    if (funcionarioId) {
      filtroFuncionario = " AND f.funcionario_id = ?";
      params.push(funcionarioId);
    }
    const rows = await query<any>(
      `SELECT f.id, f.funcionario_id, func.nome as funcionario_nome, f.mes, f.ano, f.valor_total, f.status, f.data_geracao
         FROM cant_funcionario_fatura f
         JOIN funcionarios func ON func.codigo = f.funcionario_id
        WHERE f.ano = ? AND f.mes = ? ${filtroFuncionario}
        ORDER BY func.nome`,
      params
    );
    return NextResponse.json({ ok: true, ano, mes, faturas: rows });
  } catch (err) {
    console.error("GET /api/relatorios/funcionarios/faturas error", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// Gera faturas do mês informado (ou mês anterior por padrão)
export async function POST(req: NextRequest) {
  const admin = await ensureAdmin(req);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const body = await req.json().catch(() => ({}));
    let { ano, mes } = body || {};
    if (!ano || !mes) {
      const now = new Date();
      now.setMonth(now.getMonth() - 1); // mês anterior como padrão
      ano = now.getFullYear();
      mes = now.getMonth() + 1;
    }
    await query("CALL cant_sp_gera_faturas_funcionarios(?, ?)", [ano, mes]);
    return NextResponse.json({ ok: true, ano, mes });
  } catch (err) {
    console.error("POST /api/relatorios/funcionarios/faturas error", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
