import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let contasPagar = { total: 0, vencendo: 0, atrasadas: 0, valor_total: 0 };
    let contasReceber = { total: 0, vencendo: 0, atrasadas: 0, valor_total: 0 };
    let saldoCaixa = { valor: 0 };
    let receitaDiaria = { valor: 0 };

    try {
      // Contas a pagar
      const contasPagarQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND status = 'PENDENTE' THEN 1 ELSE 0 END) as vencendo,
          SUM(CASE WHEN data_vencimento < CURDATE() AND status = 'PENDENTE' THEN 1 ELSE 0 END) as atrasadas,
          SUM(CASE WHEN status = 'PENDENTE' THEN (valor_original + valor_juros - valor_desconto - valor_pago) ELSE 0 END) as valor_total
        FROM cant_conta_pagar
        WHERE status != 'CANCELADO'
      `;

      [contasPagar] = (await query(contasPagarQuery)) as any[];
    } catch (error) {
      console.log('Tabela cant_conta_pagar ainda não existe');
    }

    try {
      // Contas a receber
      const contasReceberQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND status = 'PENDENTE' THEN 1 ELSE 0 END) as vencendo,
          SUM(CASE WHEN data_vencimento < CURDATE() AND status = 'PENDENTE' THEN 1 ELSE 0 END) as atrasadas,
          SUM(CASE WHEN status = 'PENDENTE' THEN (valor_original + valor_juros - valor_desconto - valor_recebido) ELSE 0 END) as valor_total
        FROM cant_conta_receber
        WHERE status != 'CANCELADO'
      `;

      [contasReceber] = (await query(contasReceberQuery)) as any[];
    } catch (error) {
      console.log('Tabela cant_conta_receber ainda não existe');
    }

    try {
      // Saldo do caixa atual
      const saldoCaixaQuery = `
        SELECT 
          COALESCE(valor_inicial + 
            COALESCE((SELECT SUM(valor) FROM cant_caixa_mov WHERE caixa_id = c.id AND tipo IN ('VENDA', 'REFORCO')), 0) -
            COALESCE((SELECT SUM(valor) FROM cant_caixa_mov WHERE caixa_id = c.id AND tipo = 'SANGRIA'), 0), 0) as valor
        FROM cant_caixa c
        WHERE status = 'ABERTO'
        ORDER BY data_abertura DESC
        LIMIT 1
      `;

      const resultSaldo = (await query(saldoCaixaQuery)) as any[];
      if (resultSaldo.length > 0) {
        saldoCaixa = resultSaldo[0];
      }
    } catch (error) {
      console.log('Tabela cant_caixa ainda não existe');
    }

    try {
      // Receita do dia
      const receitaDiariaQuery = `
        SELECT COALESCE(SUM(valor_liquido), 0) as valor
        FROM cant_venda
        WHERE DATE(created_at) = CURDATE()
      `;

      [receitaDiaria] = (await query(receitaDiariaQuery)) as any[];
    } catch (error) {
      console.log('Tabela cant_venda ainda não existe');
    }

    return NextResponse.json({
      contasPagar: {
        total: Number(contasPagar.total || 0),
        vencendo: Number(contasPagar.vencendo || 0),
        atrasadas: Number(contasPagar.atrasadas || 0),
        valorTotal: Number(contasPagar.valor_total || 0),
      },
      contasReceber: {
        total: Number(contasReceber.total || 0),
        vencendo: Number(contasReceber.vencendo || 0),
        atrasadas: Number(contasReceber.atrasadas || 0),
        valorTotal: Number(contasReceber.valor_total || 0),
      },
      saldoCaixa: Number(saldoCaixa.valor || 0),
      receitaDiaria: Number(receitaDiaria.valor || 0),
    });
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
