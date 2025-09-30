import { NextResponse } from 'next/server';
import { QueryRow, query } from '../../../../../lib/db';

type AlunoResumoRow = QueryRow<{
  ra: number;
  nome: string;
  turma: string | null;
  serie: string | null;
  curso_nome: string | null;
  saldo_atual: number | null;
  limite_credito: number | null;
  conta_ativa: number | null;
}>;

type ConsumoPeriodoRow = QueryRow<{
  periodo: string;
  data_inicio: string;
  data_fim: string;
  total_vendas: number;
  quantidade_itens: number;
  valor_total_periodo: number;
}>;

type VendaDetalheRow = QueryRow<{
  id: number;
  dt_venda: string;
  valor_total: number;
  itens_str: string | null;
}>;

type MovimentacaoFinanceiraRow = QueryRow<{
  id: number;
  tipo_movimentacao: 'CREDITO' | 'DEBITO' | 'ESTORNO';
  valor: number;
  saldo_anterior: number;
  saldo_posterior: number;
  descricao: string;
  dt_movimentacao: string;
  id_venda: number | null;
}>;

interface ConsumoPeriodo {
  periodo: string;
  data_inicio: string;
  data_fim: string;
  total_vendas: number;
  quantidade_itens: number;
  vendas: Array<{
    id: number;
    dt_venda: string;
    valor_total: number;
    itens: Array<{
      produto_nome: string;
      quantidade: number;
      preco_unitario: number;
      valor_total: number;
    }>;
  }>;
}

interface MovimentacaoFinanceira {
  id: number;
  tipo_movimentacao: 'CREDITO' | 'DEBITO' | 'ESTORNO';
  valor: number;
  saldo_anterior: number;
  saldo_posterior: number;
  descricao: string;
  dt_movimentacao: string;
  id_venda?: number;
}

// GET /api/alunos/historico/[ra]?periodo=dia|semana|mes&limit=30
export async function GET(req: Request, { params }: { params: Promise<{ ra: string }> }) {
  try {
    const { ra } = await params;
    if (!ra || isNaN(Number(ra))) {
      return NextResponse.json({ error: 'RA inválido' }, { status: 400 });
    }

    const url = new URL(req.url);
    const periodo = url.searchParams.get('periodo') || 'mes'; // dia, semana, mes
    const limit = Math.min(Number(url.searchParams.get('limit') || 12), 50);

    const raNum = Number(ra);

    // 1. Buscar dados básicos do aluno e conta
    const alunoQuery = `
      SELECT
        a.ra,
        a.nome,
        a.turma,
        a.serie,
        a.curso_nome,
        ca.saldo_atual,
        ca.limite_credito,
        ca.ativo as conta_ativa
      FROM alunos a
      LEFT JOIN cant_contas_alunos ca ON a.ra = ca.ra_aluno
      WHERE a.ra = ? AND a.status = 'MAT'
    `;

    const alunoRows = await query<AlunoResumoRow[]>(alunoQuery, [raNum]);
    if (!alunoRows || alunoRows.length === 0) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
    }

    const aluno = alunoRows[0];

    // 2. Buscar consumo agrupado por período
    let groupByClause = '';
    let dateFormat = '';

    switch (periodo) {
      case 'dia':
        groupByClause = 'DATE(v.dt_venda)';
        dateFormat = 'DATE(v.dt_venda)';
        break;
      case 'semana':
        groupByClause = 'YEARWEEK(v.dt_venda, 1)';
        dateFormat = "CONCAT(YEAR(v.dt_venda), '-W', LPAD(WEEK(v.dt_venda, 1), 2, '0'))";
        break;
      case 'mes':
      default:
        groupByClause = "DATE_FORMAT(v.dt_venda, '%Y-%m')";
        dateFormat = "DATE_FORMAT(v.dt_venda, '%Y-%m')";
        break;
    }

    const consumoQuery = `
      SELECT
        ${dateFormat} as periodo,
        MIN(DATE(v.dt_venda)) as data_inicio,
        MAX(DATE(v.dt_venda)) as data_fim,
        COUNT(DISTINCT v.id) as total_vendas,
        SUM(vi.quantidade) as quantidade_itens,
        SUM(vi.valor_total) as valor_total_periodo
      FROM cant_vendas v
      INNER JOIN cant_vendas_itens vi ON v.id = vi.id_venda
      WHERE v.ra_aluno = ? AND v.status = 'CONCLUIDA'
      GROUP BY ${groupByClause}
      ORDER BY data_inicio DESC
      LIMIT ?
    `;

    const consumoRows = await query<ConsumoPeriodoRow[]>(consumoQuery, [raNum, limit]);

    // 3. Para cada período, buscar as vendas detalhadas
    const consumoDetalhado: ConsumoPeriodo[] = [];

    for (const periodoRow of consumoRows) {
      const vendasQuery = `
        SELECT
          v.id,
          v.dt_venda,
          v.valor_total,
          GROUP_CONCAT(
            CONCAT(
              p.nome, '|',
              vi.quantidade, '|',
              vi.preco_unitario, '|',
              vi.valor_total
            )
            SEPARATOR ';;'
          ) as itens_str
        FROM cant_vendas v
        INNER JOIN cant_vendas_itens vi ON v.id = vi.id_venda
        INNER JOIN cant_produtos p ON vi.id_produto = p.id
        WHERE v.ra_aluno = ? AND v.status = 'CONCLUIDA'
          AND DATE(v.dt_venda) BETWEEN ? AND ?
        GROUP BY v.id, v.dt_venda, v.valor_total
        ORDER BY v.dt_venda DESC
      `;

      const vendasRows = await query<VendaDetalheRow[]>(vendasQuery, [
        raNum,
        periodoRow.data_inicio,
        periodoRow.data_fim,
      ]);

      const vendas = vendasRows.map((venda) => ({
        id: venda.id,
        dt_venda: venda.dt_venda,
        valor_total: Number(venda.valor_total),
        itens: venda.itens_str
          ? venda.itens_str.split(';;').map((item: string) => {
              const [produto_nome, quantidade, preco_unitario, valor_total] = item.split('|');
              return {
                produto_nome,
                quantidade: Number(quantidade),
                preco_unitario: Number(preco_unitario),
                valor_total: Number(valor_total),
              };
            })
          : [],
      }));

      consumoDetalhado.push({
        periodo: periodoRow.periodo,
        data_inicio: periodoRow.data_inicio,
        data_fim: periodoRow.data_fim,
        total_vendas: periodoRow.total_vendas,
        quantidade_itens: periodoRow.quantidade_itens,
        vendas,
      });
    }

    // 4. Buscar movimentações financeiras
    const movimentacoesQuery = `
      SELECT
        m.id,
        m.tipo_movimentacao,
        m.valor,
        m.saldo_anterior,
        m.saldo_posterior,
        m.descricao,
        m.dt_movimentacao,
        m.id_venda
      FROM cant_movimentacoes_alunos m
      INNER JOIN cant_contas_alunos ca ON m.id_conta_aluno = ca.id
      WHERE ca.ra_aluno = ?
      ORDER BY m.dt_movimentacao DESC
      LIMIT ?
    `;

    const movimentacoesRows = await query<MovimentacaoFinanceiraRow[]>(movimentacoesQuery, [
      raNum,
      limit * 10,
    ]); // Mais movimentações que períodos

    const movimentacoes: MovimentacaoFinanceira[] = movimentacoesRows.map((mov) => ({
      id: mov.id,
      tipo_movimentacao: mov.tipo_movimentacao,
      valor: Number(mov.valor),
      saldo_anterior: Number(mov.saldo_anterior),
      saldo_posterior: Number(mov.saldo_posterior),
      descricao: mov.descricao,
      dt_movimentacao: mov.dt_movimentacao,
      id_venda: mov.id_venda ?? undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        aluno,
        consumo_por_periodo: consumoDetalhado,
        movimentacoes_financeiras: movimentacoes,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar histórico do aluno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
