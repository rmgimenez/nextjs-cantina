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
    const pacoteAlunoId = parseInt(body.pacoteAlunoId);
    const vendaId = body.vendaId ? parseInt(body.vendaId) : null;
    if (!pacoteAlunoId)
      return NextResponse.json({ error: "invalid_params" }, { status: 400 });

    const [pacote] = await query<any[]>(
      `SELECT pa.id, pa.aluno_ra, pa.usos_restantes, pa.data_inicio, pa.data_fim, pa.status, pt.max_usos_dia
         FROM cant_pacote_aluno pa
         JOIN cant_pacote_tipo pt ON pt.id = pa.pacote_tipo_id
        WHERE pa.id = ? LIMIT 1`,
      [pacoteAlunoId]
    );
    if (!pacote)
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (pacote.status !== "ATIVO")
      return NextResponse.json({ error: "pacote_inativo" }, { status: 400 });
    const today = new Date();
    if (
      today < new Date(pacote.data_inicio) ||
      today > new Date(pacote.data_fim)
    )
      return NextResponse.json({ error: "fora_validade" }, { status: 400 });
    if (pacote.usos_restantes <= 0)
      return NextResponse.json(
        { error: "sem_usos_restantes" },
        { status: 400 }
      );
    if (pacote.max_usos_dia) {
      const [{ qt }] = await query<any[]>(
        "SELECT COUNT(*) qt FROM cant_pacote_utilizacao WHERE pacote_aluno_id=? AND DATE(data_utilizacao)=CURDATE()",
        [pacoteAlunoId]
      );
      if (qt >= pacote.max_usos_dia)
        return NextResponse.json(
          { error: "limite_diario_alcancado" },
          { status: 400 }
        );
    }
    await query(
      "INSERT INTO cant_pacote_utilizacao (pacote_aluno_id, venda_id) VALUES (?,?)",
      [pacoteAlunoId, vendaId]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/pacotes/utilizar", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
