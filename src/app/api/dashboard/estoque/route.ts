import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let estoqueInfo = {
      produtosCriticos: 0,
      produtosBaixo: 0,
      totalProdutos: 0,
      valorEstoque: 0,
      movimentacoesHoje: 0,
    };

    try {
      // Produtos com estoque crítico
      const estoqueCriticoQuery = `
        SELECT 
          COUNT(*) as produtos_criticos,
          COUNT(CASE WHEN es.saldo <= COALESCE(p.estoque_minimo, 0) AND es.saldo > 0 THEN 1 END) as produtos_baixo,
          COUNT(*) as total_produtos,
          SUM(es.saldo * p.preco_unitario) as valor_estoque
        FROM cant_view_estoque_saldo es
        JOIN cant_produtos p ON p.id = es.produto_id
        WHERE p.ativo = 1
      `;

      [estoqueInfo] = (await query(estoqueCriticoQuery)) as any[];

      // Conta produtos críticos (estoque zero)
      const criticosQuery = `
        SELECT COUNT(*) as criticos
        FROM cant_view_estoque_saldo es
        JOIN cant_produtos p ON p.id = es.produto_id
        WHERE p.ativo = 1 AND es.saldo <= 0
      `;

      const [criticos] = (await query(criticosQuery)) as any[];
      estoqueInfo.produtosCriticos = Number(criticos.criticos || 0);

      // Conta produtos com baixo estoque
      const baixoQuery = `
        SELECT COUNT(*) as baixo
        FROM cant_view_estoque_saldo es
        JOIN cant_produtos p ON p.id = es.produto_id
        WHERE p.ativo = 1 AND es.saldo > 0 AND es.saldo <= COALESCE(p.estoque_minimo, 0)
      `;

      const [baixo] = (await query(baixoQuery)) as any[];
      estoqueInfo.produtosBaixo = Number(baixo.baixo || 0);
    } catch (error) {
      console.log('Erro ao buscar dados de estoque:', error);
    }

    try {
      // Movimentações de hoje
      const movimentacoesQuery = `
        SELECT COUNT(*) as movimentacoes_hoje
        FROM cant_estoque_mov
        WHERE DATE(created_at) = CURDATE()
      `;

      const [movimentacoes] = (await query(movimentacoesQuery)) as any[];
      estoqueInfo.movimentacoesHoje = Number(movimentacoes.movimentacoes_hoje || 0);
    } catch (error) {
      console.log('Erro ao buscar movimentações de hoje');
    }

    try {
      // Total de produtos ativos
      const totalProdutosQuery = `
        SELECT COUNT(*) as total
        FROM cant_produtos
        WHERE ativo = 1
      `;

      const [totalProdutos] = (await query(totalProdutosQuery)) as any[];
      estoqueInfo.totalProdutos = Number(totalProdutos.total || 0);
    } catch (error) {
      console.log('Erro ao buscar total de produtos');
    }

    try {
      // Valor total do estoque
      const valorEstoqueQuery = `
        SELECT COALESCE(SUM(es.saldo * p.preco_unitario), 0) as valor
        FROM cant_view_estoque_saldo es
        JOIN cant_produtos p ON p.id = es.produto_id
        WHERE p.ativo = 1 AND es.saldo > 0
      `;

      const [valorEstoque] = (await query(valorEstoqueQuery)) as any[];
      estoqueInfo.valorEstoque = Number(valorEstoque.valor || 0);
    } catch (error) {
      console.log('Erro ao calcular valor do estoque');
    }

    return NextResponse.json({
      produtosCriticos: estoqueInfo.produtosCriticos,
      produtosBaixo: estoqueInfo.produtosBaixo,
      totalProdutos: estoqueInfo.totalProdutos,
      valorEstoque: estoqueInfo.valorEstoque,
      movimentacoesHoje: estoqueInfo.movimentacoesHoje,
    });
  } catch (error) {
    console.error('Erro ao buscar dados de estoque:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
