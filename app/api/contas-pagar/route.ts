import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status');
    const fornecedor = url.searchParams.get('fornecedor');
    const dt_inicio = url.searchParams.get('dt_inicio');
    const dt_fim = url.searchParams.get('dt_fim');

    let sql = `
      SELECT cp.*, f.nome as fornecedor_nome, f.razao_social as fornecedor_razao_social,
             uc.nome as criado_por_nome
      FROM cant_contas_pagar cp
      INNER JOIN cant_fornecedores f ON cp.id_fornecedor = f.id
      LEFT JOIN cant_usuarios_cantina uc ON cp.criado_por = uc.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (search) {
      sql += ` AND (cp.descricao LIKE ? OR cp.numero_documento LIKE ? OR f.nome LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += ` AND cp.status = ?`;
      params.push(status);
    }

    if (fornecedor) {
      sql += ` AND cp.id_fornecedor = ?`;
      params.push(fornecedor);
    }

    if (dt_inicio) {
      sql += ` AND cp.dt_vencimento >= ?`;
      params.push(dt_inicio);
    }

    if (dt_fim) {
      sql += ` AND cp.dt_vencimento <= ?`;
      params.push(dt_fim);
    }

    sql += ` ORDER BY cp.dt_vencimento ASC, cp.status ASC`;

    const rows = await query(sql, params);

    // Converter valores numéricos de string para number
    type Row = Record<string, unknown> & {
      valor?: string | number | null;
      valor_pago?: string | number | null;
    };
    const processedRows = (rows as Row[]).map((row) => ({
      ...row,
      valor: Number(row.valor ?? 0),
      valor_pago: Number(row.valor_pago ?? 0),
    }));

    return NextResponse.json({
      success: true,
      data: processedRows,
    });
  } catch (error) {
    console.error('Erro ao listar contas a pagar:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova conta a pagar
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id_fornecedor,
      descricao,
      valor,
      dt_vencimento,
      categoria,
      numero_documento,
      observacoes,
    } = body;

    // Validações
    if (!id_fornecedor || !descricao || !valor || !dt_vencimento) {
      return NextResponse.json(
        {
          error: 'Fornecedor, descrição, valor e data de vencimento são obrigatórios',
        },
        { status: 400 }
      );
    }

    if (valor <= 0) {
      return NextResponse.json({ error: 'Valor deve ser maior que zero' }, { status: 400 });
    }

    // Validar data de vencimento
    const dataVencimento = new Date(dt_vencimento);
    if (isNaN(dataVencimento.getTime())) {
      return NextResponse.json({ error: 'Data de vencimento inválida' }, { status: 400 });
    }

    // Verificar se fornecedor existe e está ativo
    const fornecedorExists = await query(
      'SELECT id FROM cant_fornecedores WHERE id = ? AND ativo = 1',
      [id_fornecedor]
    );

    if (!fornecedorExists || fornecedorExists.length === 0) {
      return NextResponse.json({ error: 'Fornecedor não encontrado ou inativo' }, { status: 400 });
    }

    // Determinar status inicial baseado na data de vencimento
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const status = dataVencimento < hoje ? 'VENCIDO' : 'PENDENTE';

    // Inserir conta a pagar
    await query(
      `INSERT INTO cant_contas_pagar
       (id_fornecedor, descricao, valor, dt_vencimento, status, categoria, numero_documento, observacoes, criado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id_fornecedor,
        descricao.trim(),
        valor,
        dt_vencimento,
        status,
        categoria?.trim() || null,
        numero_documento?.trim() || null,
        observacoes?.trim() || null,
      ]
    );

    // Buscar dados da conta criada
    const newConta = await query(
      `SELECT cp.*, f.nome as fornecedor_nome, f.razao_social as fornecedor_razao_social,
              uc.nome as criado_por_nome
       FROM cant_contas_pagar cp
       INNER JOIN cant_fornecedores f ON cp.id_fornecedor = f.id
       LEFT JOIN cant_usuarios_cantina uc ON cp.criado_por = uc.id
       WHERE cp.id = LAST_INSERT_ID()`,
      []
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Conta a pagar criada com sucesso',
        data: newConta[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar conta a pagar:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
