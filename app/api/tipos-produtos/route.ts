import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

// GET - Listar tipos de produtos
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const ativo = url.searchParams.get("ativo");

    let sql = `
      SELECT tp.*, uc.nome as criado_por_nome
      FROM cant_tipos_produtos tp
      LEFT JOIN cant_usuarios_cantina uc ON tp.criado_por = uc.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (search) {
      sql += ` AND (tp.nome LIKE ? OR tp.descricao LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (ativo !== null) {
      sql += ` AND tp.ativo = ?`;
      params.push(ativo);
    }

    sql += ` ORDER BY tp.nome ASC`;

    const rows = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Erro ao listar tipos de produtos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo tipo de produto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, descricao } = body;

    // Validações
    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se tipo já existe
    const existingTipo = await query(
      "SELECT id FROM cant_tipos_produtos WHERE nome = ? AND ativo = 1",
      [nome.trim()]
    );

    if (existingTipo && existingTipo.length > 0) {
      return NextResponse.json(
        { error: "Já existe um tipo de produto com este nome" },
        { status: 400 }
      );
    }

    // Inserir tipo de produto
    await query(
      `INSERT INTO cant_tipos_produtos
       (nome, descricao, ativo, criado_por)
       VALUES (?, ?, 1, 1)`,
      [nome.trim(), descricao?.trim() || null]
    );

    // Buscar dados do tipo criado
    const newTipo = await query(
      `SELECT tp.*, uc.nome as criado_por_nome
       FROM cant_tipos_produtos tp
       LEFT JOIN cant_usuarios_cantina uc ON tp.criado_por = uc.id
       WHERE tp.id = LAST_INSERT_ID()`,
      []
    );

    return NextResponse.json(
      {
        success: true,
        message: "Tipo de produto criado com sucesso",
        data: newTipo[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar tipo de produto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
