import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo");
    const diasAtraso = searchParams.get("dias_atraso");

    // Query para contas a pagar vencidas
    let queryPagar = `
      SELECT
        cp.id,
        'PAGAR' as tipo,
        f.nome as nome_cliente_fornecedor,
        cp.descricao,
        cp.valor,
        cp.dt_vencimento,
        DATEDIFF(CURDATE(), cp.dt_vencimento) as dias_atraso,
        cp.categoria,
        cp.numero_documento,
        cp.status
      FROM cant_contas_pagar cp
      INNER JOIN cant_fornecedores f ON cp.id_fornecedor = f.id
      WHERE cp.status IN ('PENDENTE', 'VENCIDO')
      AND cp.dt_vencimento < CURDATE()
    `;

    // Query para contas a receber vencidas
    let queryReceber = `
      SELECT
        cr.id,
        'RECEBER' as tipo,
        CASE
          WHEN cr.tipo_cliente = 'FUNCIONARIO' THEN f.nome
          WHEN cr.tipo_cliente = 'ALUNO' THEN a.nome
          ELSE cr.nome_terceiro
        END as nome_cliente_fornecedor,
        cr.descricao,
        cr.valor,
        cr.dt_vencimento,
        DATEDIFF(CURDATE(), cr.dt_vencimento) as dias_atraso,
        cr.categoria,
        cr.numero_documento,
        cr.status
      FROM cant_contas_receber cr
      LEFT JOIN funcionarios f ON cr.tipo_cliente = 'FUNCIONARIO' AND cr.codigo_funcionario = f.codigo
      LEFT JOIN alunos a ON cr.tipo_cliente = 'ALUNO' AND cr.ra_aluno = a.ra
      WHERE cr.status IN ('PENDENTE', 'VENCIDO')
      AND cr.dt_vencimento < CURDATE()
    `;

    // Aplicar filtros
    const params: number[] = [];

    if (tipo) {
      if (tipo === "PAGAR") {
        queryReceber = "";
      } else if (tipo === "RECEBER") {
        queryPagar = "";
      }
    }

    if (diasAtraso) {
      const dias = parseInt(diasAtraso);
      if (dias === 91) {
        // Mais de 90 dias
        if (queryPagar)
          queryPagar += " AND DATEDIFF(CURDATE(), cp.dt_vencimento) > 90";
        if (queryReceber)
          queryReceber += " AND DATEDIFF(CURDATE(), cr.dt_vencimento) > 90";
      } else {
        // Até X dias
        if (queryPagar)
          queryPagar += " AND DATEDIFF(CURDATE(), cp.dt_vencimento) <= ?";
        if (queryReceber)
          queryReceber += " AND DATEDIFF(CURDATE(), cr.dt_vencimento) <= ?";
        params.push(dias);
      }
    }

    // Executar queries
    let contasInadimplentes: Array<{
      id: number;
      tipo: string;
      nome_cliente_fornecedor: string;
      descricao: string;
      valor: number;
      dt_vencimento: string;
      dias_atraso: number;
      categoria: string;
      numero_documento: string;
      status: string;
    }> = [];

    if (queryPagar) {
      const contasPagar = (await query(queryPagar, params)) as Array<{
        id: number;
        tipo: string;
        nome_cliente_fornecedor: string;
        descricao: string;
        valor: string;
        dt_vencimento: string;
        dias_atraso: number;
        categoria: string;
        numero_documento: string;
        status: string;
      }>;
      contasInadimplentes = [
        ...contasInadimplentes,
        ...contasPagar.map((cp) => ({
          ...cp,
          valor: parseFloat(cp.valor),
        })),
      ];
    }

    if (queryReceber) {
      const contasReceber = (await query(queryReceber, params)) as Array<{
        id: number;
        tipo: string;
        nome_cliente_fornecedor: string;
        descricao: string;
        valor: string;
        dt_vencimento: string;
        dias_atraso: number;
        categoria: string;
        numero_documento: string;
        status: string;
      }>;
      contasInadimplentes = [
        ...contasInadimplentes,
        ...contasReceber.map((cr) => ({
          ...cr,
          valor: parseFloat(cr.valor),
        })),
      ];
    }

    // Ordenar por dias de atraso (maior primeiro)
    contasInadimplentes.sort((a, b) => b.dias_atraso - a.dias_atraso);

    return NextResponse.json({
      success: true,
      data: contasInadimplentes,
    });
  } catch (error) {
    console.error("Erro ao gerar relatório de inadimplência:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
