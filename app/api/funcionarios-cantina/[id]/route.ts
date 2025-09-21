import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import bcrypt from "bcryptjs";

interface FuncionarioCantina {
  id: number;
  nome: string;
  usuario: string;
  senha: string;
  email: string;
  telefone: string;
  id_perfil: number;
  ativo: number;
  dt_criacao: string;
  dt_alteracao: string;
  criado_por: number;
}

// GET - Buscar funcionário específico
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
      `SELECT fc.*, pa.nome as perfil_nome
       FROM cant_usuarios_cantina fc
       INNER JOIN cant_perfis_acesso pa ON fc.id_perfil = pa.id
       WHERE fc.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar funcionário
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nome, usuario, email, telefone, id_perfil, senha, ativo } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se funcionário existe
    const existingFuncionario = await query(
      "SELECT * FROM cant_usuarios_cantina WHERE id = ?",
      [id]
    );

    if (!existingFuncionario || existingFuncionario.length === 0) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    // Validações
    if (!nome || !usuario || !id_perfil) {
      return NextResponse.json(
        { error: "Nome, usuário e perfil são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se usuário já existe (exceto para o próprio funcionário)
    const existingUser = await query(
      "SELECT id FROM cant_usuarios_cantina WHERE usuario = ? AND id != ?",
      [usuario, id]
    );

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
    }

    // Verificar se perfil existe
    const perfilExists = await query(
      "SELECT id FROM cant_perfis_acesso WHERE id = ? AND ativo = 1",
      [id_perfil]
    );

    if (!perfilExists || perfilExists.length === 0) {
      return NextResponse.json(
        { error: "Perfil de acesso inválido" },
        { status: 400 }
      );
    }

    // Preparar dados para atualização
    let updateFields =
      "nome = ?, usuario = ?, email = ?, telefone = ?, id_perfil = ?, ativo = ?";
    const updateParams = [
      nome,
      usuario,
      email || null,
      telefone || null,
      id_perfil,
      ativo ? 1 : 0,
    ];

    // Se senha foi fornecida, validar e incluir na atualização
    if (senha) {
      if (senha.length < 6) {
        return NextResponse.json(
          { error: "A senha deve ter pelo menos 6 caracteres" },
          { status: 400 }
        );
      }
      const hashedPassword = await bcrypt.hash(senha, 12);
      updateFields += ", senha = ?";
      updateParams.push(hashedPassword);
    }

    updateParams.push(id);

    // Atualizar funcionário
    await query(
      `UPDATE cant_usuarios_cantina SET ${updateFields} WHERE id = ?`,
      updateParams
    );

    // Buscar dados atualizados
    const updatedFuncionario = await query(
      `SELECT fc.*, pa.nome as perfil_nome
       FROM cant_usuarios_cantina fc
       INNER JOIN cant_perfis_acesso pa ON fc.id_perfil = pa.id
       WHERE fc.id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Funcionário atualizado com sucesso",
      data: updatedFuncionario[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar funcionário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir funcionário (soft delete - desativar)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se funcionário existe
    const existingFuncionario = await query(
      "SELECT * FROM cant_usuarios_cantina WHERE id = ?",
      [id]
    );

    if (!existingFuncionario || existingFuncionario.length === 0) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    // Não permitir excluir o usuário administrador padrão (ID 1)
    if (id === "1") {
      return NextResponse.json(
        { error: "Não é possível excluir o usuário administrador padrão" },
        { status: 400 }
      );
    }

    // Desativar funcionário (soft delete)
    await query("UPDATE cant_usuarios_cantina SET ativo = 0 WHERE id = ?", [
      id,
    ]);

    return NextResponse.json({
      success: true,
      message: "Funcionário desativado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir funcionário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
