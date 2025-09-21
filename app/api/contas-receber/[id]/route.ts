import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

// GET - Buscar conta a receber específica
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
      `SELECT cr.*,
              CASE
                WHEN cr.tipo_cliente = 'ALUNO' THEN a.nome
                WHEN cr.tipo_cliente = 'FUNCIONARIO' THEN f.nome
                ELSE cr.nome_terceiro
              END as nome_cliente,
              uc.nome as criado_por_nome
       FROM cant_contas_receber cr
       LEFT JOIN alunos a ON cr.ra_aluno = a.ra AND cr.tipo_cliente = 'ALUNO'
       LEFT JOIN funcionarios f ON cr.codigo_funcionario = f.codigo AND cr.tipo_cliente = 'FUNCIONARIO'
       LEFT JOIN cant_usuarios_cantina uc ON cr.criado_por = uc.id
       WHERE cr.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Conta a receber não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Erro ao buscar conta a receber:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar conta a receber
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      tipo_cliente,
      codigo_funcionario,
      ra_aluno,
      nome_terceiro,
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
      "SELECT * FROM cant_contas_receber WHERE id = ?",
      [id]
    )) as Array<{
      id: number;
      status: string;
      dt_vencimento: string;
    }>;

    if (!existingConta || existingConta.length === 0) {
      return NextResponse.json(
        { error: "Conta a receber não encontrada" },
        { status: 404 }
      );
    }

    // Validações
    if (!tipo_cliente || !descricao || !valor || !dt_vencimento) {
      return NextResponse.json(
        {
          error:
            "Tipo de cliente, descrição, valor e data de vencimento são obrigatórios",
        },
        { status: 400 }
      );
    }

    if (!["FUNCIONARIO", "ALUNO", "TERCEIRO"].includes(tipo_cliente)) {
      return NextResponse.json(
        { error: "Tipo de cliente deve ser FUNCIONARIO, ALUNO ou TERCEIRO" },
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

    // Validações específicas por tipo de cliente
    if (tipo_cliente === "FUNCIONARIO" && !codigo_funcionario) {
      return NextResponse.json(
        {
          error:
            "Código do funcionário é obrigatório para contas de funcionários",
        },
        { status: 400 }
      );
    }

    if (tipo_cliente === "ALUNO" && !ra_aluno) {
      return NextResponse.json(
        { error: "RA do aluno é obrigatório para contas de alunos" },
        { status: 400 }
      );
    }

    if (tipo_cliente === "TERCEIRO" && !nome_terceiro) {
      return NextResponse.json(
        { error: "Nome do terceiro é obrigatório para contas de terceiros" },
        { status: 400 }
      );
    }

    // Verificar se funcionário existe (se aplicável)
    if (tipo_cliente === "FUNCIONARIO") {
      const funcionarioExists = await query(
        "SELECT codigo FROM funcionarios WHERE codigo = ?",
        [codigo_funcionario]
      );

      if (!funcionarioExists || funcionarioExists.length === 0) {
        return NextResponse.json(
          { error: "Funcionário não encontrado" },
          { status: 400 }
        );
      }
    }

    // Verificar se aluno existe (se aplicável)
    if (tipo_cliente === "ALUNO") {
      const alunoExists = await query("SELECT ra FROM alunos WHERE ra = ?", [
        ra_aluno,
      ]);

      if (!alunoExists || alunoExists.length === 0) {
        return NextResponse.json(
          { error: "Aluno não encontrado" },
          { status: 400 }
        );
      }
    }

    // Determinar status baseado na data de vencimento e se já foi recebida
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let status = existingConta[0].status;

    // Se não foi recebida ainda, atualizar status baseado na data
    if (status !== "RECEBIDO" && status !== "PARCIAL") {
      status = dataVencimento < hoje ? "VENCIDO" : "PENDENTE";
    }

    // Atualizar conta a receber
    await query(
      `UPDATE cant_contas_receber
       SET tipo_cliente = ?, codigo_funcionario = ?, ra_aluno = ?, nome_terceiro = ?, descricao = ?, valor = ?, dt_vencimento = ?, status = ?, categoria = ?, numero_documento = ?, observacoes = ?
       WHERE id = ?`,
      [
        tipo_cliente,
        tipo_cliente === "FUNCIONARIO" ? codigo_funcionario : null,
        tipo_cliente === "ALUNO" ? ra_aluno : null,
        tipo_cliente === "TERCEIRO" ? nome_terceiro.trim() : null,
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
      `SELECT cr.*,
              CASE
                WHEN cr.tipo_cliente = 'ALUNO' THEN a.nome
                WHEN cr.tipo_cliente = 'FUNCIONARIO' THEN f.nome
                ELSE cr.nome_terceiro
              END as nome_cliente,
              uc.nome as criado_por_nome
       FROM cant_contas_receber cr
       LEFT JOIN alunos a ON cr.ra_aluno = a.ra AND cr.tipo_cliente = 'ALUNO'
       LEFT JOIN funcionarios f ON cr.codigo_funcionario = f.codigo AND cr.tipo_cliente = 'FUNCIONARIO'
       LEFT JOIN cant_usuarios_cantina uc ON cr.criado_por = uc.id
       WHERE cr.id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Conta a receber atualizada com sucesso",
      data: updatedConta[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar conta a receber:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir conta a receber
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
      "SELECT * FROM cant_contas_receber WHERE id = ?",
      [id]
    )) as Array<{
      id: number;
      status: string;
      dt_vencimento: string;
    }>;

    if (!existingConta || existingConta.length === 0) {
      return NextResponse.json(
        { error: "Conta a receber não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se a conta já foi recebida
    if (
      existingConta[0].status === "RECEBIDO" ||
      existingConta[0].status === "PARCIAL"
    ) {
      return NextResponse.json(
        {
          error:
            "Não é possível excluir uma conta que já foi recebida ou parcialmente recebida.",
        },
        { status: 400 }
      );
    }

    // Excluir conta a receber
    await query("DELETE FROM cant_contas_receber WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Conta a receber excluída com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir conta a receber:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
