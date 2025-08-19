import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let produtos: any[] = [];

    try {
      const produtosMaisVendidosQuery = `
        SELECT 
          p.nome,
          COALESCE(SUM(vi.quantidade), 0) as quantidade_vendida
        FROM cant_produtos p
        LEFT JOIN cant_venda_item vi ON vi.produto_id = p.id
        LEFT JOIN cant_venda v ON v.id = vi.venda_id AND DATE(v.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        WHERE p.ativo = 1
        GROUP BY p.id, p.nome
        HAVING quantidade_vendida > 0
        ORDER BY quantidade_vendida DESC
        LIMIT 5
      `;

      produtos = (await query(produtosMaisVendidosQuery)) as any[];
    } catch (error) {
      console.log('Tabelas de produtos/vendas ainda não existem ou sem dados:', error);
      produtos = [];
    }

    // Encontrar o máximo para calcular percentuais
    const maxVendas = produtos.length > 0 ? produtos[0].quantidade_vendida : 1;

    const produtosFormatados = produtos.map((produto) => ({
      name: produto.nome,
      sales: produto.quantidade_vendida,
      percentage: Math.round((produto.quantidade_vendida / maxVendas) * 100),
    }));

    return NextResponse.json(produtosFormatados);
  } catch (error) {
    console.error('Erro ao buscar produtos mais vendidos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
