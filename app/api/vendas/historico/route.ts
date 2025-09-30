import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';
import { NextRequest, NextResponse } from 'next/server';

interface VendaHistorico extends RowDataPacket {
  id: number;
  tipo_cliente: 'ALUNO' | 'FUNCIONARIO' | 'GERAL';
  nome_cliente: string;
  ra_aluno: number | null;
  codigo_funcionario: number | null;
  valor_total: number;
  forma_pagamento: 'SALDO' | 'DINHEIRO' | 'CARTAO' | 'CONTA_FUNCIONARIO';
  status: 'CONCLUIDA' | 'CANCELADA' | 'ESTORNADA';
  dt_venda: string;
  usuario_nome: string;
  quantidade_itens: number;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dtInicio = searchParams.get('dt_inicio');
    const dtFim = searchParams.get('dt_fim');
    const tipoCliente = searchParams.get('tipo_cliente');
    const raAluno = searchParams.get('ra_aluno');
    const codigoFuncionario = searchParams.get('codigo_funcionario');
    const formaPagamento = searchParams.get('forma_pagamento');
    const status = searchParams.get('status') || 'CONCLUIDA';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Construir a query dinamicamente
    const whereConditions: string[] = [];
    const queryParams: (string | number)[] = [];

    if (status) {
      whereConditions.push('v.status = ?');
      queryParams.push(status);
    }

    if (dtInicio) {
      whereConditions.push('DATE(v.dt_venda) >= ?');
      queryParams.push(dtInicio);
    }

    if (dtFim) {
      whereConditions.push('DATE(v.dt_venda) <= ?');
      queryParams.push(dtFim);
    }

    if (tipoCliente) {
      whereConditions.push('v.tipo_cliente = ?');
      queryParams.push(tipoCliente);
    }

    if (raAluno) {
      whereConditions.push('v.ra_aluno = ?');
      queryParams.push(raAluno);
    }

    if (codigoFuncionario) {
      whereConditions.push('v.codigo_funcionario = ?');
      queryParams.push(codigoFuncionario);
    }

    if (formaPagamento) {
      whereConditions.push('v.forma_pagamento = ?');
      queryParams.push(formaPagamento);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM cant_vendas v
      ${whereClause}
    `;
    const countResult = await query<RowDataPacket[]>(countQuery, queryParams);
    const total = countResult[0].total;

    // Query principal
    const mainQuery = `
      SELECT 
        v.id,
        v.tipo_cliente,
        CASE 
          WHEN v.tipo_cliente = 'ALUNO' THEN a.nome
          WHEN v.tipo_cliente = 'FUNCIONARIO' THEN f.nome
          ELSE 'Cliente Geral'
        END AS nome_cliente,
        v.ra_aluno,
        v.codigo_funcionario,
        v.valor_total,
        v.forma_pagamento,
        v.status,
        v.dt_venda,
        u.nome AS usuario_nome,
        (SELECT COUNT(*) FROM cant_vendas_itens vi WHERE vi.id_venda = v.id) AS quantidade_itens
      FROM cant_vendas v
      LEFT JOIN alunos a ON v.ra_aluno = a.ra
      LEFT JOIN funcionarios f ON v.codigo_funcionario = f.codigo
      LEFT JOIN cant_usuarios_cantina u ON v.usuario = u.id
      ${whereClause}
      ORDER BY v.dt_venda DESC
      LIMIT ? OFFSET ?
    `;

    const vendas = await query<VendaHistorico[]>(mainQuery, [...queryParams, limit, offset]);

    return NextResponse.json({
      success: true,
      data: {
        vendas,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de vendas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar histórico de vendas' },
      { status: 500 }
    );
  }
}
