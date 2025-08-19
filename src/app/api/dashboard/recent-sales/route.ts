import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let vendasRecentes: any[] = [];

    try {
      const vendasRecentesQuery = `
        SELECT 
          v.id,
          CASE 
            WHEN v.tipo_comprador = 'ALUNO' THEN ca.nome
            WHEN v.tipo_comprador = 'FUNCIONARIO_ESCOLA' THEN f.nome
            ELSE 'Cliente Avulso'
          END as cliente_nome,
          v.valor_liquido,
          DATE_FORMAT(v.created_at, '%H:%i') as hora_venda,
          (SELECT COUNT(*) FROM cant_venda_item vi WHERE vi.venda_id = v.id) as total_itens,
          v.tipo_comprador,
          v.comprador_aluno_ra,
          v.comprador_funcionario_id
        FROM cant_venda v
        LEFT JOIN cadastro_alunos ca ON ca.ra = v.comprador_aluno_ra AND v.tipo_comprador = 'ALUNO'
        LEFT JOIN funcionarios f ON f.codigo = v.comprador_funcionario_id AND v.tipo_comprador = 'FUNCIONARIO_ESCOLA'
        WHERE DATE(v.created_at) = CURDATE()
        ORDER BY v.created_at DESC
        LIMIT 10
      `;

      vendasRecentes = (await query(vendasRecentesQuery)) as any[];
    } catch (error) {
      console.log('Tabelas de venda ainda não existem ou sem dados:', error);
      vendasRecentes = [];
    }

    const vendas = vendasRecentes.map((venda) => ({
      id: venda.id,
      student: venda.cliente_nome || 'Cliente não identificado',
      amount: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(venda.valor_liquido),
      time: venda.hora_venda,
      items: `${venda.total_itens} ${venda.total_itens === 1 ? 'item' : 'itens'}`,
      clienteType: venda.tipo_comprador,
      clienteRa: venda.comprador_aluno_ra || venda.comprador_funcionario_id,
    }));

    return NextResponse.json(vendas);
  } catch (error) {
    console.error('Erro ao buscar vendas recentes:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
