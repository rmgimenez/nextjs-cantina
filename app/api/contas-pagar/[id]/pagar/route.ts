import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";

interface PagamentoRequest {
  valor_pago: number;
  dt_pagamento: string;
  forma_pagamento: "DINHEIRO" | "CARTAO" | "TRANSFERENCIA" | "CHEQUE" | "PIX";
  observacoes?: string;
}

// PATCH - Registrar pagamento de conta a pagar
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: PagamentoRequest = await req.json();

    const { valor_pago, dt_pagamento, forma_pagamento, observacoes } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Validações
    if (!valor_pago || valor_pago <= 0) {
      return NextResponse.json(
        { error: "Valor pago deve ser maior que zero" },
        { status: 400 }
      );
    }

    if (!dt_pagamento) {
      return NextResponse.json(
        { error: "Data de pagamento é obrigatória" },
        { status: 400 }
      );
    }

    if (!forma_pagamento) {
      return NextResponse.json(
        { error: "Forma de pagamento é obrigatória" },
        { status: 400 }
      );
    }

    // Validar data de pagamento
    const dataPagamento = new Date(dt_pagamento);
    if (isNaN(dataPagamento.getTime())) {
      return NextResponse.json(
        { error: "Data de pagamento inválida" },
        { status: 400 }
      );
    }

    // Verificar se conta existe
    const conta = (await query("SELECT * FROM cant_contas_pagar WHERE id = ?", [
      id,
    ])) as Array<{
      id: number;
      valor: number;
      valor_pago: number;
      status: string;
    }>;

    if (!conta || conta.length === 0) {
      return NextResponse.json(
        { error: "Conta a pagar não encontrada" },
        { status: 404 }
      );
    }

    const contaAtual = conta[0];

    // Verificar se a conta já foi totalmente paga
    if (contaAtual.status === "PAGO") {
      return NextResponse.json(
        { error: "Esta conta já foi totalmente paga" },
        { status: 400 }
      );
    }

    // Calcular novo valor pago e status
    const valorPagoAtual = contaAtual.valor_pago || 0;
    const novoValorPago = valorPagoAtual + valor_pago;
    const valorTotal = contaAtual.valor;

    let novoStatus: string;
    if (novoValorPago >= valorTotal) {
      novoStatus = "PAGO";
    } else if (novoValorPago > 0) {
      novoStatus = "PARCIAL";
    } else {
      novoStatus = contaAtual.status;
    }

    // Iniciar transação
    await query("START TRANSACTION");

    try {
      // Atualizar conta a pagar
      await query(
        `UPDATE cant_contas_pagar
         SET valor_pago = ?, dt_pagamento = ?, status = ?
         WHERE id = ?`,
        [novoValorPago, dt_pagamento, novoStatus, id]
      );

      // Registrar o pagamento na tabela de movimentações (se necessário)
      // Por enquanto, vamos manter simples e só atualizar a conta

      await query("COMMIT");

      // Buscar dados atualizados
      const contaAtualizada = await query(
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
        message: "Pagamento registrado com sucesso",
        data: contaAtualizada[0],
      });
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Erro ao registrar pagamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
