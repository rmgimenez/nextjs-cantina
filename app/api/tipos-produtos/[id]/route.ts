import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

// GET - Buscar tipo de produto específico
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const rows = await query(
      `SELECT tp.*, uc.nome as criado_por_nome
       FROM cant_tipos_produtos tp
       LEFT JOIN cant_usuarios_cantina uc ON tp.criado_por = uc.id
       WHERE tp.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Tipo de produto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Erro ao buscar tipo de produto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar tipo de produto
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nome, descricao, ativo } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se tipo existe
    const existingTipo = await query(
      "SELECT * FROM cant_tipos_produtos WHERE id = ?",
      [id]
    );

    if (!existingTipo || existingTipo.length === 0) {
      return NextResponse.json(
        { error: "Tipo de produto não encontrado" },
        { status: 404 }
      );
    }

    // Validações
    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se nome já existe (exceto para o próprio tipo)
    const existingNome = await query(
      "SELECT id FROM cant_tipos_produtos WHERE nome = ? AND id != ? AND ativo = 1",
      [nome.trim(), id]
    );

    if (existingNome && existingNome.length > 0) {
      return NextResponse.json(
        { error: "Já existe um tipo de produto ativo com este nome" },
        { status: 400 }
      );
    }

    // Atualizar tipo de produto
    await query(
      `UPDATE cant_tipos_produtos
       SET nome = ?, descricao = ?, ativo = ?
       WHERE id = ?`,
      [nome.trim(), descricao?.trim() || null, ativo ? 1 : 0, id]
    );

    // Buscar dados atualizados
    const updatedTipo = await query(
      `SELECT tp.*, uc.nome as criado_por_nome
       FROM cant_tipos_produtos tp
       LEFT JOIN cant_usuarios_cantina uc ON tp.criado_por = uc.id
       WHERE tp.id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Tipo de produto atualizado com sucesso",
      data: updatedTipo[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar tipo de produto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir tipo de produto (soft delete - desativar)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se tipo existe
    const existingTipo = await query(
      "SELECT * FROM cant_tipos_produtos WHERE id = ?",
      [id]
    );

    if (!existingTipo || existingTipo.length === 0) {
      return NextResponse.json(
        { error: "Tipo de produto não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se existem produtos vinculados a este tipo
    const produtosVinculados = (await query(
      "SELECT COUNT(*) as count FROM cant_produtos WHERE id_tipo = ? AND ativo = 1",
      [id]
    )) as { count: number }[];

    if (produtosVinculados && produtosVinculados.length > 0) {
      const count = Number(produtosVinculados[0].count) || 0;
      if (count > 0) {
        return NextResponse.json(
          {
            error:
              "Não é possível excluir este tipo pois existem produtos vinculados a ele. Desative-o ao invés de excluir.",
          },
          { status: 400 }
        );
      }
    }

    // Desativar tipo de produto (soft delete)
    await query("UPDATE cant_tipos_produtos SET ativo = 0 WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Tipo de produto desativado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir tipo de produto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
