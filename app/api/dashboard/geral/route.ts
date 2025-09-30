import { NextResponse } from 'next/server';
import { QueryRow, query } from '../../../../lib/db';

type ValorQuantidadeRow = QueryRow<{ total: string | number | null; qtd?: string | number | null }>;
type ContagemRow = QueryRow<{ total: string | number | null }>;
type UltimaVendaRow = QueryRow<{
  id: number;
  valor_total: number | string;
  dt_venda: string;
  tipo_cliente: 'ALUNO' | 'FUNCIONARIO' | 'GERAL';
  nome_cliente: string | null;
}>;
type EstoqueAlertaRow = QueryRow<{
  id: number;
  produto_nome: string;
  tipo_produto: string;
  quantidade_atual: number | string;
  quantidade_minima: number | string;
  status_estoque: 'CRITICO' | 'BAIXO' | 'OK';
}>;

// GET /api/dashboard/geral - métricas do dashboard inicial
export async function GET() {
  try {
    // Vendas do dia (total e quantidade)
    const vendasHojeRows = await query<ValorQuantidadeRow[]>(
      `SELECT COALESCE(SUM(valor_total), 0) AS total, COUNT(*) AS qtd
       FROM cant_vendas
       WHERE DATE(dt_venda) = CURDATE() AND status = 'CONCLUIDA'`
    );
    const vendasHoje = vendasHojeRows[0];

    // Produtos ativos em estoque (contagem de produtos cadastrados ativos)
    const produtosAtivosRows = await query<ContagemRow[]>(
      `SELECT COUNT(*) AS total
       FROM cant_produtos p
       WHERE p.ativo = 1`
    );
    const produtosAtivos = produtosAtivosRows[0]?.total ?? 0;

    // Alunos com contas ativas
    const alunosAtivosRows = await query<ContagemRow[]>(
      `SELECT COUNT(*) AS total FROM cant_contas_alunos WHERE ativo = 1`
    );
    const alunosAtivos = alunosAtivosRows[0]?.total ?? 0;

    // Alertas de estoque (BAIXO/CRITICO)
    const alertasRows = await query<ContagemRow[]>(
      `SELECT COUNT(*) AS total
       FROM vw_cant_estoque_alertas
       WHERE produto_ativo = 1 AND status_estoque IN ('BAIXO','CRITICO')`
    );
    const alertas = alertasRows[0]?.total ?? 0;

    // Últimas vendas (limite 5) - tenta identificar cliente
    const ultimasVendas = await query<UltimaVendaRow[]>(
      `SELECT v.id, v.valor_total, v.dt_venda, v.tipo_cliente,
              v.ra_aluno, v.codigo_funcionario,
              CASE 
                WHEN v.tipo_cliente = 'ALUNO' THEN (SELECT a.nome FROM alunos a WHERE a.ra = v.ra_aluno)
                WHEN v.tipo_cliente = 'FUNCIONARIO' THEN (SELECT f.nome FROM funcionarios f WHERE f.codigo = v.codigo_funcionario)
                ELSE 'Cliente Geral'
              END AS nome_cliente
       FROM cant_vendas v
       WHERE v.status = 'CONCLUIDA'
       ORDER BY v.dt_venda DESC
       LIMIT 5`
    );

    // Produtos com estoque baixo (top 5)
    const estoqueBaixo = await query<EstoqueAlertaRow[]>(
      `SELECT id, produto_nome, tipo_produto, quantidade_atual, quantidade_minima, status_estoque
       FROM vw_cant_estoque_alertas
       WHERE produto_ativo = 1 AND status_estoque IN ('BAIXO','CRITICO')
       ORDER BY (status_estoque = 'CRITICO') DESC, (quantidade_atual - quantidade_minima) ASC
       LIMIT 5`
    );

    const data = {
      vendasHoje: {
        total: Number(vendasHoje.total || 0),
        quantidade: Number(vendasHoje.qtd || 0),
      },
      produtosAtivos: Number(produtosAtivos || 0),
      alunosAtivos: Number(alunosAtivos || 0),
      alertasEstoque: Number(alertas || 0),
      ultimasVendas: ultimasVendas.map((v) => ({
        id: v.id,
        valor_total: Number(v.valor_total),
        dt_venda: v.dt_venda,
        tipo_cliente: v.tipo_cliente,
        nome_cliente: v.nome_cliente || 'N/A',
      })),
      estoqueBaixo: estoqueBaixo.map((item) => ({
        ...item,
        quantidade_atual: Number(item.quantidade_atual),
        quantidade_minima: Number(item.quantidade_minima),
      })),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro no dashboard geral:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
