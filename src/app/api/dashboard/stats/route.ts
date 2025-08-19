import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let vendasHoje = { vendas_hoje: 0, transacoes_hoje: 0 };
    let vendasOntem = { vendas_ontem: 0, transacoes_ontem: 0 };
    let alunosHoje = { alunos_hoje: 0 };
    let alunosOntem = { alunos_ontem: 0 };
    let produtosFalta = { produtos_falta: 0 };
    let produtosFaltaOntem = { produtos_falta_ontem: 0 };

    try {
      // Vendas de hoje
      const vendasHojeQuery = `
        SELECT 
          COALESCE(SUM(valor_liquido), 0) as vendas_hoje,
          COUNT(*) as transacoes_hoje
        FROM cant_venda 
        WHERE DATE(created_at) = CURDATE()
      `;

      [vendasHoje] = (await query(vendasHojeQuery)) as any[];
    } catch (error) {
      console.log('Tabela cant_venda ainda não existe');
    }

    try {
      // Vendas de ontem para comparação
      const vendasOntemQuery = `
        SELECT 
          COALESCE(SUM(valor_liquido), 0) as vendas_ontem,
          COUNT(*) as transacoes_ontem
        FROM cant_venda 
        WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      `;

      [vendasOntem] = (await query(vendasOntemQuery)) as any[];
    } catch (error) {
      console.log('Erro ao buscar vendas de ontem');
    }

    try {
      // Alunos únicos atendidos hoje
      const alunosHojeQuery = `
        SELECT COUNT(DISTINCT comprador_aluno_ra) as alunos_hoje
        FROM cant_venda 
        WHERE DATE(created_at) = CURDATE() 
        AND tipo_comprador = 'ALUNO'
        AND comprador_aluno_ra IS NOT NULL
      `;

      [alunosHoje] = (await query(alunosHojeQuery)) as any[];
    } catch (error) {
      console.log('Erro ao buscar alunos de hoje');
    }

    try {
      // Alunos únicos atendidos ontem
      const alunosOntemQuery = `
        SELECT COUNT(DISTINCT comprador_aluno_ra) as alunos_ontem
        FROM cant_venda 
        WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        AND tipo_comprador = 'ALUNO'
        AND comprador_aluno_ra IS NOT NULL
      `;

      [alunosOntem] = (await query(alunosOntemQuery)) as any[];
    } catch (error) {
      console.log('Erro ao buscar alunos de ontem');
    }

    try {
      // Produtos em falta (estoque baixo) - precisa ser ajustado pois não há campo estoque_minimo
      const produtosFaltaQuery = `
        SELECT COUNT(*) as produtos_falta
        FROM cant_view_estoque_saldo vs
        JOIN cant_produtos p ON p.id = vs.produto_id
        WHERE vs.saldo <= 10 AND p.ativo = 1
      `;

      [produtosFalta] = (await query(produtosFaltaQuery)) as any[];
    } catch (error) {
      console.log('View de estoque ainda não existe');
    }

    try {
      // Produtos em falta ontem (aproximação)
      const produtosFaltaOntemQuery = `
        SELECT COUNT(*) as produtos_falta_ontem
        FROM cant_view_estoque_saldo vs
        JOIN cant_produtos p ON p.id = vs.produto_id
        WHERE vs.saldo <= 11 AND p.ativo = 1
      `;

      [produtosFaltaOntem] = (await query(produtosFaltaOntemQuery)) as any[];
    } catch (error) {
      console.log('View de estoque ainda não existe');
    }

    // Calcular variações percentuais
    const calcularVariacao = (atual: number, anterior: number) => {
      if (anterior === 0) return atual > 0 ? '+100%' : '0%';
      const variacao = ((atual - anterior) / anterior) * 100;
      return `${variacao >= 0 ? '+' : ''}${variacao.toFixed(1)}%`;
    };

    const determinarTipo = (atual: number, anterior: number) => {
      if (atual > anterior) return 'positive';
      if (atual < anterior) return 'negative';
      return 'neutral';
    };

    const stats = [
      {
        title: 'Vendas Hoje',
        value: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(vendasHoje.vendas_hoje),
        change: `${calcularVariacao(vendasHoje.vendas_hoje, vendasOntem.vendas_ontem)} vs ontem`,
        changeType: determinarTipo(vendasHoje.vendas_hoje, vendasOntem.vendas_ontem),
      },
      {
        title: 'Transações',
        value: vendasHoje.transacoes_hoje.toString(),
        change: `${calcularVariacao(
          vendasHoje.transacoes_hoje,
          vendasOntem.transacoes_ontem
        )} vs ontem`,
        changeType: determinarTipo(vendasHoje.transacoes_hoje, vendasOntem.transacoes_ontem),
      },
      {
        title: 'Alunos Atendidos',
        value: alunosHoje.alunos_hoje.toString(),
        change: `${calcularVariacao(alunosHoje.alunos_hoje, alunosOntem.alunos_ontem)} vs ontem`,
        changeType: determinarTipo(alunosHoje.alunos_hoje, alunosOntem.alunos_ontem),
      },
      {
        title: 'Produtos em Falta',
        value: produtosFalta.produtos_falta.toString(),
        change: `${
          produtosFalta.produtos_falta - produtosFaltaOntem.produtos_falta_ontem >= 0 ? '+' : ''
        }${produtosFalta.produtos_falta - produtosFaltaOntem.produtos_falta_ontem} vs ontem`,
        changeType:
          produtosFalta.produtos_falta <= produtosFaltaOntem.produtos_falta_ontem
            ? 'positive'
            : 'negative',
      },
    ];

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
