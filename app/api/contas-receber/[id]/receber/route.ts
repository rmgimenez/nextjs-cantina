import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";

interface RecebimentoRequest {
  valor_recebido: number;
  dt_recebimento: string;
  forma_pagamento: "DINHEIRO" | "CARTAO" | "TRANSFERENCIA" | "CHEQUE" | "PIX";
  observacoes?: string;
}

// PATCH - Registrar recebimento de conta a receber
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: RecebimentoRequest = await req.json();

    const { valor_recebido, dt_recebimento, forma_pagamento, observacoes } =
      body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Validações
    if (!valor_recebido || valor_recebido <= 0) {
      return NextResponse.json(
        { error: "Valor recebido deve ser maior que zero" },
        { status: 400 }
      );
    }

    if (!dt_recebimento) {
      return NextResponse.json(
        { error: "Data de recebimento é obrigatória" },
        { status: 400 }
      );
    }

    if (!forma_pagamento) {
      return NextResponse.json(
        { error: "Forma de pagamento é obrigatória" },
        { status: 400 }
      );
    }

    // Validar data de recebimento
    const dataRecebimento = new Date(dt_recebimento);
    if (isNaN(dataRecebimento.getTime())) {
      return NextResponse.json(
        { error: "Data de recebimento inválida" },
        { status: 400 }
      );
    }

    // Verificar se conta existe
    const conta = (await query(
      "SELECT * FROM cant_contas_receber WHERE id = ?",
      [id]
    )) as Array<{
      id: number;
      valor: number;
      valor_recebido: number;
      status: string;
    }>;

    if (!conta || conta.length === 0) {
      return NextResponse.json(
        { error: "Conta a receber não encontrada" },
        { status: 404 }
      );
    }

    const contaAtual = conta[0];

    // Verificar se a conta já foi totalmente recebida
    if (contaAtual.status === "RECEBIDO") {
      return NextResponse.json(
        { error: "Esta conta já foi totalmente recebida" },
        { status: 400 }
      );
    }

    // Calcular novo valor recebido e status
    const valorRecebidoAtual = contaAtual.valor_recebido || 0;
    const novoValorRecebido = valorRecebidoAtual + valor_recebido;
    const valorTotal = contaAtual.valor;

    let novoStatus: string;
    if (novoValorRecebido >= valorTotal) {
      novoStatus = "RECEBIDO";
    } else if (novoValorRecebido > 0) {
      novoStatus = "PARCIAL";
    } else {
      novoStatus = contaAtual.status;
    }

    // Iniciar transação
    await query("START TRANSACTION");

    try {
      // Atualizar conta a receber
      await query(
        `UPDATE cant_contas_receber
         SET valor_recebido = ?, dt_recebimento = ?, status = ?
         WHERE id = ?`,
        [novoValorRecebido, dt_recebimento, novoStatus, id]
      );

      // Registrar o recebimento na tabela de movimentações (se necessário)
      // Por enquanto, vamos manter simples e só atualizar a conta

      await query("COMMIT");

      // Buscar dados atualizados
      const contaAtualizada = await query(
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
        message: "Recebimento registrado com sucesso",
        data: contaAtualizada[0],
      });
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Erro ao registrar recebimento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
