import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "../../../lib/auth";
import { query } from "../../../lib/db";

async function ensureAdmin(req: NextRequest) {
  // Verifica token e role (simples)
  const token =
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return false;
  const payload = await verifySessionToken(token);
  if (!payload) return false;
  return (payload as any).tipo === "ADMIN";
}

export async function GET(req: NextRequest) {
  if (!(await ensureAdmin(req)))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const rows = await query<any[]>(
      "SELECT id, usuario, nome, tipo, ativo, ultimo_login, created_at FROM cant_usuarios ORDER BY usuario LIMIT 100"
    );
    return NextResponse.json({ ok: true, usuarios: rows });
  } catch (err: any) {
    console.error("GET /api/usuarios error", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await ensureAdmin(req)))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const { usuario, nome, tipo, senha } = body || {};

    if (!usuario || !nome || !tipo || !senha) {
      return NextResponse.json(
        { error: "Campos obrigatórios: usuário, nome, tipo e senha" },
        { status: 400 }
      );
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    if (!["ADMIN", "ATENDENTE", "ESTOQUISTA"].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo de usuário inválido" },
        { status: 400 }
      );
    }

    // Verificar se usuário já existe
    const existing = await query<any[]>(
      "SELECT id FROM cant_usuarios WHERE usuario = ?",
      [usuario]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Nome de usuário já existe" },
        { status: 409 }
      );
    }

    // cria com senha hash via script existente (server-side bcryptjs)
    const bcrypt = (await import("bcryptjs")).default;
    const senhaHash = await bcrypt.hash(senha, 10);

    const res = await query<any>(
      "INSERT INTO cant_usuarios (usuario, nome, tipo, senha_hash, ativo) VALUES (?, ?, ?, ?, 1)",
      [usuario, nome, tipo, senhaHash]
    );
    return NextResponse.json({ ok: true, insertId: (res as any).insertId });
  } catch (err: any) {
    console.error("POST /api/usuarios error", err);
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Nome de usuário já existe" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!(await ensureAdmin(req)))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const { id, nome, tipo, ativo } = body || {};
    if (!id)
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

    if (!nome || !tipo) {
      return NextResponse.json(
        { error: "Nome e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    if (!["ADMIN", "ATENDENTE", "ESTOQUISTA"].includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo de usuário inválido" },
        { status: 400 }
      );
    }

    await query(
      "UPDATE cant_usuarios SET nome = ?, tipo = ?, ativo = ? WHERE id = ?",
      [nome, tipo, ativo ? 1 : 0, id]
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("PUT /api/usuarios error", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await ensureAdmin(req)))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id)
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

    // Buscar o usuário atual para fazer toggle do status
    const usuario = await query<any[]>(
      "SELECT ativo FROM cant_usuarios WHERE id = ?",
      [id]
    );
    if (usuario.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const novoStatus = usuario[0].ativo ? 0 : 1;
    await query("UPDATE cant_usuarios SET ativo = ? WHERE id = ?", [
      novoStatus,
      id,
    ]);
    return NextResponse.json({ ok: true, novoStatus });
  } catch (err: any) {
    console.error("DELETE /api/usuarios error", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await ensureAdmin(req)))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    const { id } = body || {};
    if (!id)
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

    // Verificar se usuário existe
    const usuario = await query<any[]>(
      "SELECT id FROM cant_usuarios WHERE id = ?",
      [id]
    );
    if (usuario.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const bcrypt = (await import("bcryptjs")).default;
    const newPass = "senha123";
    const hash = await bcrypt.hash(newPass, 10);

    await query("UPDATE cant_usuarios SET senha_hash = ? WHERE id = ?", [
      hash,
      id,
    ]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("PATCH /api/usuarios error", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
