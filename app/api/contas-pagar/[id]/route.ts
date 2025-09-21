import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

// GET - Buscar conta a pagar específica
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
      `SELECT cp.*, f.nome as fornecedor_nome, f.razao_social as fornecedor_razao_social,
              uc.nome as criado_por_nome
       FROM cant_contas_pagar cp
       INNER JOIN cant_fornecedores f ON cp.id_fornecedor = f.id
       LEFT JOIN cant_usuarios_cantina uc ON cp.criado_por = uc.id
       WHERE cp.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Conta a pagar não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Erro ao buscar conta a pagar:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar conta a pagar
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      id_fornecedor,
      descricao,
      valor,
      dt_vencimento,
      categoria,
      numero_documento,
      observacoes,
    } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se conta existe
    const existingConta = (await query(
      "SELECT * FROM cant_contas_pagar WHERE id = ?",
      [id]
    )) as Array<{
      id: number;
      status: string;
      dt_vencimento: string;
    }>;

    if (!existingConta || existingConta.length === 0) {
      return NextResponse.json(
        { error: "Conta a pagar não encontrada" },
        { status: 404 }
      );
    }

    // Validações
    if (!id_fornecedor || !descricao || !valor || !dt_vencimento) {
      return NextResponse.json(
        {
          error:
            "Fornecedor, descrição, valor e data de vencimento são obrigatórios",
        },
        { status: 400 }
      );
    }

    if (valor <= 0) {
      return NextResponse.json(
        { error: "Valor deve ser maior que zero" },
        { status: 400 }
      );
    }

    // Validar data de vencimento
    const dataVencimento = new Date(dt_vencimento);
    if (isNaN(dataVencimento.getTime())) {
      return NextResponse.json(
        { error: "Data de vencimento inválida" },
        { status: 400 }
      );
    }

    // Verificar se fornecedor existe e está ativo
    const fornecedorExists = await query(
      "SELECT id FROM cant_fornecedores WHERE id = ? AND ativo = 1",
      [id_fornecedor]
    );

    if (!fornecedorExists || fornecedorExists.length === 0) {
      return NextResponse.json(
        { error: "Fornecedor não encontrado ou inativo" },
        { status: 400 }
      );
    }

    // Determinar status baseado na data de vencimento e se já foi paga
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let status = existingConta[0].status;

    // Se não foi paga ainda, atualizar status baseado na data
    if (status !== "PAGO" && status !== "PARCIAL") {
      status = dataVencimento < hoje ? "VENCIDO" : "PENDENTE";
    }

    // Atualizar conta a pagar
    await query(
      `UPDATE cant_contas_pagar
       SET id_fornecedor = ?, descricao = ?, valor = ?, dt_vencimento = ?, status = ?, categoria = ?, numero_documento = ?, observacoes = ?
       WHERE id = ?`,
      [
        id_fornecedor,
        descricao.trim(),
        valor,
        dt_vencimento,
        status,
        categoria?.trim() || null,
        numero_documento?.trim() || null,
        observacoes?.trim() || null,
        id,
      ]
    );

    // Buscar dados atualizados
    const updatedConta = await query(
      `SELECT cp.*, f.nome as fornecedor_nome, f.razao_social as fornecedor_razao_social,
              uc.nome as criado_por_nome
       FROM cant_contas_pagar cp
       INNER JOIN cant_fornecedores f ON cp.id_fornecedor = f.id
       LEFT JOIN cant_usuarios_cantina uc ON cp.criado_por = uc.id
       WHERE cp.id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Conta a pagar atualizada com sucesso",
      data: updatedConta[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar conta a pagar:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir conta a pagar
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar se conta existe
    const existingConta = (await query(
      "SELECT * FROM cant_contas_pagar WHERE id = ?",
      [id]
    )) as Array<{
      id: number;
      status: string;
      dt_vencimento: string;
    }>;

    if (!existingConta || existingConta.length === 0) {
      return NextResponse.json(
        { error: "Conta a pagar não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se a conta já foi paga
    if (
      existingConta[0].status === "PAGO" ||
      existingConta[0].status === "PARCIAL"
    ) {
      return NextResponse.json(
        {
          error:
            "Não é possível excluir uma conta que já foi paga ou parcialmente paga.",
        },
        { status: 400 }
      );
    }

    // Excluir conta a pagar
    await query("DELETE FROM cant_contas_pagar WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Conta a pagar excluída com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir conta a pagar:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
