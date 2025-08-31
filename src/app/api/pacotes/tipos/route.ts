import {
  COOKIE_NAME,
  verifySessionToken,
  hasAnyRole,
  ROLE_ADMIN,
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

export async function GET(req: NextRequest) {
  try {
    const session = await auth(req);
    if (!session)
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    const tipos = await query<any[]>(
      "SELECT id, codigo, descricao, dias_validade, max_usos_dia, preco, ativo, created_at FROM cant_pacote_tipo ORDER BY descricao"
    );
    return NextResponse.json({ ok: true, tipos });
  } catch (e) {
    console.error("GET /api/pacotes/tipos", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth(req);
    if (!session || !hasAnyRole(session, [ROLE_ADMIN])) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { codigo, descricao, diasValidade, maxUsosDia, preco } = body;
    if (!codigo || !descricao || !diasValidade || !preco) {
      return NextResponse.json({ error: "invalid_params" }, { status: 400 });
    }
    await query(
      "INSERT INTO cant_pacote_tipo (codigo, descricao, dias_validade, max_usos_dia, preco, ativo) VALUES (?,?,?,?,?,1)",
      [codigo, descricao, diasValidade, maxUsosDia || null, preco]
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("POST /api/pacotes/tipos", e);
    return NextResponse.json(
      { error: "server_error", message: e?.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth(req);
    if (!session || !hasAnyRole(session, [ROLE_ADMIN])) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { id, descricao, diasValidade, maxUsosDia, preco, ativo } = body;
    if (!id)
      return NextResponse.json({ error: "id_required" }, { status: 400 });
    await query(
      `UPDATE cant_pacote_tipo SET 
        descricao = COALESCE(?, descricao),
        dias_validade = COALESCE(?, dias_validade),
        max_usos_dia = ?,
        preco = COALESCE(?, preco),
        ativo = COALESCE(?, ativo)
      WHERE id=?`,
      [
        descricao || null,
        diasValidade || null,
        maxUsosDia || null,
        preco || null,
        ativo,
        id,
      ]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/pacotes/tipos", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
