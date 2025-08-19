import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('cantina_session')?.value;
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Dashboard geral
    const [dashboard] = await query(`SELECT * FROM cant_view_dashboard_financeiro`);

    // Contas que vencem hoje
    const contasPagarHoje = await query(`
      SELECT id, descricao, fornecedor, valor_pendente, data_vencimento
      FROM cant_view_conta_pagar_resumo 
      WHERE data_vencimento = CURDATE() AND status = 'PENDENTE'
      ORDER BY valor_pendente DESC
      LIMIT 10
    `);

    const contasReceberHoje = await query(`
      SELECT id, descricao, cliente, valor_pendente, data_vencimento
      FROM cant_view_conta_receber_resumo 
      WHERE data_vencimento = CURDATE() AND status = 'PENDENTE'
      ORDER BY valor_pendente DESC
      LIMIT 10
    `);

    // Contas atrasadas
    const contasPagarAtrasadas = await query(`
      SELECT id, descricao, fornecedor, valor_pendente, data_vencimento, dias_atraso
      FROM cant_view_conta_pagar_resumo 
      WHERE status = 'ATRASADO' OR (status = 'PENDENTE' AND data_vencimento < CURDATE())
      ORDER BY dias_atraso DESC, valor_pendente DESC
      LIMIT 10
    `);

    const contasReceberAtrasadas = await query(`
      SELECT id, descricao, cliente, valor_pendente, data_vencimento, dias_atraso
      FROM cant_view_conta_receber_resumo 
      WHERE status = 'ATRASADO' OR (status = 'PENDENTE' AND data_vencimento < CURDATE())
      ORDER BY dias_atraso DESC, valor_pendente DESC
      LIMIT 10
    `);

    // Resumo por categoria (últimos 30 dias)
    const resumoPorCategoria = await query(`
      SELECT 
        cf.nome as categoria,
        cf.tipo,
        SUM(CASE 
          WHEN cf.tipo = 'DESPESA' THEN cp.valor_pago 
          ELSE 0 
        END) as total_pago,
        SUM(CASE 
          WHEN cf.tipo = 'RECEITA' THEN cr.valor_recebido 
          ELSE 0 
        END) as total_recebido
      FROM cant_categoria_financeira cf
      LEFT JOIN cant_conta_pagar cp ON cf.id = cp.categoria_id 
        AND cp.data_pagamento >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      LEFT JOIN cant_conta_receber cr ON cf.id = cr.categoria_id 
        AND cr.data_recebimento >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      WHERE cf.ativo = 1
      GROUP BY cf.id, cf.nome, cf.tipo
      HAVING total_pago > 0 OR total_recebido > 0
      ORDER BY cf.tipo, (total_pago + total_recebido) DESC
    `);

    // Fluxo de caixa próximos 30 dias
    const fluxoCaixa = await query(`
      SELECT 
        data_vencimento as data,
        SUM(CASE WHEN tipo = 'pagar' THEN valor_pendente ELSE 0 END) as saidas,
        SUM(CASE WHEN tipo = 'receber' THEN valor_pendente ELSE 0 END) as entradas
      FROM (
        SELECT data_vencimento, valor_pendente, 'pagar' as tipo
        FROM cant_view_conta_pagar_resumo
        WHERE status = 'PENDENTE' 
        AND data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        UNION ALL
        SELECT data_vencimento, valor_pendente, 'receber' as tipo  
        FROM cant_view_conta_receber_resumo
        WHERE status = 'PENDENTE'
        AND data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ) t
      GROUP BY data_vencimento
      ORDER BY data_vencimento
    `);

    return NextResponse.json({
      dashboard: dashboard || {
        contas_pagar_pendentes: 0,
        contas_receber_pendentes: 0,
        contas_pagar_atrasadas: 0,
        contas_receber_atrasadas: 0,
        valor_total_pagar: 0,
        valor_total_receber: 0,
        valor_atrasado_pagar: 0,
        valor_atrasado_receber: 0,
      },
      contas_pagar_hoje: contasPagarHoje,
      contas_receber_hoje: contasReceberHoje,
      contas_pagar_atrasadas: contasPagarAtrasadas,
      contas_receber_atrasadas: contasReceberAtrasadas,
      resumo_por_categoria: resumoPorCategoria,
      fluxo_caixa: fluxoCaixa,
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard financeiro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
