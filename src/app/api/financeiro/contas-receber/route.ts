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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const situacao = searchParams.get('situacao');
    const categoria_id = searchParams.get('categoria_id');
    const cliente = searchParams.get('cliente');
    const data_inicio = searchParams.get('data_inicio');
    const data_fim = searchParams.get('data_fim');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereConditions: string[] = [];
    const params: any[] = [];

    if (status && ['PENDENTE', 'RECEBIDO', 'ATRASADO', 'CANCELADO'].includes(status)) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    if (situacao) {
      switch (situacao) {
        case 'vence_hoje':
          whereConditions.push('data_vencimento = CURDATE() AND status = "PENDENTE"');
          break;
        case 'vence_semana':
          whereConditions.push(
            'data_vencimento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) AND status = "PENDENTE"'
          );
          break;
        case 'atrasado':
          whereConditions.push(
            '(status = "ATRASADO" OR (status = "PENDENTE" AND data_vencimento < CURDATE()))'
          );
          break;
      }
    }

    if (categoria_id) {
      whereConditions.push('categoria_id = ?');
      params.push(categoria_id);
    }

    if (cliente) {
      whereConditions.push('cliente LIKE ?');
      params.push(`%${cliente}%`);
    }

    if (data_inicio) {
      whereConditions.push('data_vencimento >= ?');
      params.push(data_inicio);
    }

    if (data_fim) {
      whereConditions.push('data_vencimento <= ?');
      params.push(data_fim);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // Query principal
    const sql = `
      SELECT * FROM cant_view_conta_receber_resumo
      ${whereClause}
      ORDER BY data_vencimento DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    // Query para contar total
    const countSql = `
      SELECT COUNT(*) as total FROM cant_view_conta_receber_resumo
      ${whereClause}
    `;
    const countParams = params.slice(0, -2); // Remove limit e offset

    const [contas, totalResult] = await Promise.all([
      query(sql, params),
      query(countSql, countParams),
    ]);

    const total = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      contas,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar contas a receber:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('cantina_session')?.value;
    const user = verifyToken(token);

    if (!user || !['ADMIN', 'ESTOQUISTA'].includes(user.tipo)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const {
      categoria_id,
      descricao,
      cliente,
      numero_documento,
      valor_original,
      data_emissao,
      data_vencimento,
      observacoes,
      parcelas,
      data_primeira_parcela,
    } = body;

    if (!descricao || !valor_original || !data_emissao || !data_vencimento) {
      return NextResponse.json({ error: 'Dados obrigatórios não informados' }, { status: 400 });
    }

    // Insere a conta a receber
    const result = await query(
      `
      INSERT INTO cant_conta_receber (
        categoria_id, descricao, cliente, numero_documento, valor_original, 
        data_emissao, data_vencimento, observacoes, usuario_cadastro_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        categoria_id || null,
        descricao,
        cliente || null,
        numero_documento || null,
        valor_original,
        data_emissao,
        data_vencimento,
        observacoes || null,
        user.id,
      ]
    );

    const contaId = result.insertId;

    // Se especificou parcelas, gera as parcelas
    if (parcelas && parcelas > 1 && data_primeira_parcela) {
      await query(
        `
        CALL cant_sp_gerar_parcelas_conta_receber(?, ?, ?)
      `,
        [contaId, parcelas, data_primeira_parcela]
      );
    }

    return NextResponse.json(
      {
        id: contaId,
        message: 'Conta a receber criada com sucesso',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar conta a receber:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
