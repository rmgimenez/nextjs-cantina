import {
  COOKIE_NAME,
  hasAnyRole,
  ROLE_ADMIN,
  ROLE_ATENDENTE,
  verifySessionToken,
} from "@/lib/auth";
import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

async function getSession(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifySessionToken(token);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !hasAnyRole(session, [ROLE_ADMIN, ROLE_ATENDENTE])) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const ra = parseInt(searchParams.get("ra") || "");
    if (!ra)
      return NextResponse.json({ error: "ra_required" }, { status: 400 });
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);
    const rows = await query<any[]>(
      `SELECT id, tipo, valor, origem, referencia, observacao, created_at
       FROM cant_aluno_saldo_mov WHERE aluno_ra=? ORDER BY id DESC LIMIT ${limit}`,
      [ra]
    );
    return NextResponse.json({ ok: true, movimentos: rows });
  } catch (e) {
    console.error("GET /api/alunos/saldo/mov", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
