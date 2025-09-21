import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function GET(req: NextRequest) {
  try {
    // Resumo geral
    const resumoQuery = `
      SELECT
        (SELECT COALESCE(SUM(valor), 0) FROM cant_contas_receber WHERE status IN ('PENDENTE', 'PARCIAL')) as total_receber,
        (SELECT COALESCE(SUM(valor), 0) FROM cant_contas_pagar WHERE status IN ('PENDENTE', 'PARCIAL')) as total_pagar,
        (SELECT COALESCE(SUM(valor), 0) FROM cant_contas_receber WHERE status IN ('PENDENTE', 'VENCIDO', 'PARCIAL') AND dt_vencimento < CURDATE()) as inadimplencia_receber,
        (SELECT COALESCE(SUM(valor), 0) FROM cant_contas_pagar WHERE status IN ('PENDENTE', 'VENCIDO', 'PARCIAL') AND dt_vencimento < CURDATE()) as inadimplencia_pagar
    `;

    const resumoResult = await query(resumoQuery);
    const resumo = resumoResult[0] as {
      total_receber: string;
      total_pagar: string;
      inadimplencia_receber: string;
      inadimplencia_pagar: string;
    };

    // Contas por status - Receber
    const statusReceberQuery = `
      SELECT
        status,
        COALESCE(SUM(valor), 0) as total
      FROM cant_contas_receber
      GROUP BY status
    `;

    const statusReceberResult = await query(statusReceberQuery);
    const porStatusReceber: Record<string, number> = {
      PENDENTE: 0,
      RECEBIDO: 0,
      VENCIDO: 0,
      PARCIAL: 0,
    };
    statusReceberResult.forEach((row: unknown) => {
      const typedRow = row as { status: string; total: string };
      porStatusReceber[typedRow.status] = parseFloat(typedRow.total);
    });

    // Contas por status - Pagar
    const statusPagarQuery = `
      SELECT
        status,
        COALESCE(SUM(valor), 0) as total
      FROM cant_contas_pagar
      GROUP BY status
    `;

    const statusPagarResult = await query(statusPagarQuery);
    const porStatusPagar: Record<string, number> = {
      PENDENTE: 0,
      PAGO: 0,
      VENCIDO: 0,
      PARCIAL: 0,
    };
    statusPagarResult.forEach((row: unknown) => {
      const typedRow = row as { status: string; total: string };
      porStatusPagar[typedRow.status] = parseFloat(typedRow.total);
    });

    // Últimas transações (últimas 10)
    const ultimasTransacoesQuery = `
      (SELECT
        'RECEBER' as tipo,
        cr.descricao,
        cr.valor,
        COALESCE(cr.dt_recebimento, cr.dt_criacao) as dt_operacao,
        cr.status
      FROM cant_contas_receber cr
      WHERE cr.status IN ('RECEBIDO', 'PAGO')
      ORDER BY COALESCE(cr.dt_recebimento, cr.dt_criacao) DESC
      LIMIT 5)
      UNION ALL
      (SELECT
        'PAGAR' as tipo,
        cp.descricao,
        cp.valor,
        COALESCE(cp.dt_pagamento, cp.dt_criacao) as dt_operacao,
        cp.status
      FROM cant_contas_pagar cp
      WHERE cp.status IN ('PAGO')
      ORDER BY COALESCE(cp.dt_pagamento, cp.dt_criacao) DESC
      LIMIT 5)
      ORDER BY dt_operacao DESC
      LIMIT 10
    `;

    const ultimasTransacoesResult = await query(ultimasTransacoesQuery);

    // Fluxo mensal (últimos 6 meses)
    const fluxoMensalQuery = `
      SELECT
        DATE_FORMAT(dt_operacao, '%Y-%m') as mes,
        SUM(CASE WHEN tipo = 'RECEBER' THEN valor ELSE 0 END) as receber,
        SUM(CASE WHEN tipo = 'PAGAR' THEN valor ELSE 0 END) as pagar,
        SUM(CASE WHEN tipo = 'RECEBER' THEN valor ELSE -valor END) as saldo
      FROM (
        (SELECT 'RECEBER' as tipo, valor, COALESCE(dt_recebimento, dt_criacao) as dt_operacao
         FROM cant_contas_receber
         WHERE status IN ('RECEBIDO', 'PAGO'))
        UNION ALL
        (SELECT 'PAGAR' as tipo, valor, COALESCE(dt_pagamento, dt_criacao) as dt_operacao
         FROM cant_contas_pagar
         WHERE status = 'PAGO')
      ) as transacoes
      WHERE dt_operacao >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(dt_operacao, '%Y-%m')
      ORDER BY mes DESC
    `;

    const fluxoMensalResult = await query(fluxoMensalQuery);

    // Formatar nomes dos meses
    const mesesMap: { [key: string]: string } = {
      "01": "Jan",
      "02": "Fev",
      "03": "Mar",
      "04": "Abr",
      "05": "Mai",
      "06": "Jun",
      "07": "Jul",
      "08": "Ago",
      "09": "Set",
      "10": "Out",
      "11": "Nov",
      "12": "Dez",
    };

    const fluxoMensal = fluxoMensalResult.map((row: unknown) => {
      const typedRow = row as {
        mes: string;
        receber: string;
        pagar: string;
        saldo: string;
      };
      return {
        mes: (() => {
          const [ano, mes] = typedRow.mes.split("-");
          return `${mesesMap[mes]}/${ano.slice(2)}`;
        })(),
        receber: parseFloat(typedRow.receber),
        pagar: parseFloat(typedRow.pagar),
        saldo: parseFloat(typedRow.saldo),
      };
    });

    const dashboardData = {
      resumo: {
        totalReceber: parseFloat(resumo.total_receber),
        totalPagar: parseFloat(resumo.total_pagar),
        saldoLiquido:
          parseFloat(resumo.total_receber) - parseFloat(resumo.total_pagar),
        inadimplencia:
          parseFloat(resumo.inadimplencia_receber) +
          parseFloat(resumo.inadimplencia_pagar),
      },
      porStatus: {
        receber: porStatusReceber,
        pagar: porStatusPagar,
      },
      ultimasTransacoes: ultimasTransacoesResult.map((row: unknown) => {
        const typedRow = row as {
          tipo: string;
          descricao: string;
          valor: string;
          dt_operacao: string;
          status: string;
        };
        return {
          tipo: typedRow.tipo,
          descricao: typedRow.descricao,
          valor: parseFloat(typedRow.valor),
          dt_operacao: typedRow.dt_operacao,
          status: typedRow.status,
        };
      }),
      fluxoMensal,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard financeiro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
