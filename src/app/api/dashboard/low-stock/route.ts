import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let produtos: any[] = [];

    try {
      const estoqueQuery = `
        SELECT 
          p.nome,
          vs.saldo as estoque_atual,
          10 as estoque_minimo,
          CASE 
            WHEN vs.saldo <= 5 THEN 'critical'
            WHEN vs.saldo <= 10 THEN 'warning'
            ELSE 'normal'
          END as status
        FROM cant_view_estoque_saldo vs
        JOIN cant_produtos p ON p.id = vs.produto_id
        WHERE vs.saldo <= 10 
        AND p.ativo = 1
        ORDER BY 
          CASE 
            WHEN vs.saldo <= 5 THEN 1
            ELSE 2
          END,
          vs.saldo ASC
        LIMIT 10
      `;

      produtos = (await query(estoqueQuery)) as any[];
    } catch (error) {
      console.log('View de estoque ainda não existe ou sem dados:', error);
      produtos = [];
    }

    const estoqueFormatado = produtos.map((produto) => ({
      name: produto.nome,
      stock: produto.estoque_atual,
      min: produto.estoque_minimo,
      status: produto.status,
    }));

    return NextResponse.json(estoqueFormatado);
  } catch (error) {
    console.error('Erro ao buscar estoque baixo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
