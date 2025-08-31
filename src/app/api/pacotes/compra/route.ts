import {
  COOKIE_NAME,
  hasAnyRole,
  ROLE_ADMIN,
  ROLE_ATENDENTE,
  verifySessionToken,
} from "@/lib/auth";
import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

async function auth(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifySessionToken(token);
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth(req);
    if (!session || !hasAnyRole(session, [ROLE_ADMIN, ROLE_ATENDENTE])) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const ra = parseInt(body.ra);
    const pacoteTipoId = parseInt(body.pacoteTipoId);
    const dataInicio =
      body.dataInicio || new Date().toISOString().substring(0, 10);
    if (!ra || !pacoteTipoId) {
      return NextResponse.json({ error: "invalid_params" }, { status: 400 });
    }
    await query("CALL cant_sp_compra_pacote(?,?,?,?)", [
      ra,
      pacoteTipoId,
      dataInicio,
      session.id,
    ]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("POST /api/pacotes/compra", e);
    return NextResponse.json(
      { error: "server_error", message: e?.message },
      { status: 500 }
    );
  }
}
