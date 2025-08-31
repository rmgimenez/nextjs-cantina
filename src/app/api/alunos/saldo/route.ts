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

    const saldoRows = await query<any[]>(
      "SELECT saldo_atual FROM cant_view_aluno_saldo WHERE aluno_ra = ? LIMIT 1",
      [ra]
    );
    const saldo = saldoRows.length ? parseFloat(saldoRows[0].saldo_atual) : 0;

    const ultMov = await query<any[]>(
      "SELECT id, tipo, valor, origem, referencia, observacao, created_at FROM cant_aluno_saldo_mov WHERE aluno_ra=? ORDER BY id DESC LIMIT 5",
      [ra]
    );

    return NextResponse.json({ ok: true, ra, saldo, ultimos: ultMov });
  } catch (e) {
    console.error("GET /api/alunos/saldo", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !hasAnyRole(session, [ROLE_ADMIN, ROLE_ATENDENTE])) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const ra = parseInt(body.ra);
    const valor = parseFloat(body.valor);
    const observacao: string | null =
      body.observacao?.toString().slice(0, 255) || null;
    if (!ra || !valor || valor <= 0) {
      return NextResponse.json({ error: "invalid_params" }, { status: 400 });
    }
    await query("CALL cant_sp_credita_saldo_aluno(?, ?, ?)", [
      ra,
      valor,
      observacao,
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/alunos/saldo", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
