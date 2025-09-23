import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

interface ContaReceber {
  id: number;
  tipo_cliente: 'FUNCIONARIO' | 'ALUNO' | 'TERCEIRO';
  codigo_funcionario: number;
  ra_aluno: number;
  nome_terceiro: string;
  descricao: string;
  valor: number;
  dt_vencimento: string;
  dt_recebimento: string;
  valor_recebido: number;
  status: 'PENDENTE' | 'RECEBIDO' | 'VENCIDO' | 'PARCIAL';
  categoria: string;
  numero_documento: string;
  observacoes: string;
  dt_criacao: string;
  criado_por: number;
}

// GET - Listar contas a receber
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status');
    const tipo_cliente = url.searchParams.get('tipo_cliente');
    const dt_inicio = url.searchParams.get('dt_inicio');
    const dt_fim = url.searchParams.get('dt_fim');

    let sql = `
      SELECT cr.*,
             CASE
               WHEN cr.tipo_cliente = 'ALUNO' THEN a.nome
               WHEN cr.tipo_cliente = 'FUNCIONARIO' THEN f.nome
               ELSE cr.nome_terceiro
             END as nome_cliente,
             uc.nome as criado_por_nome
      FROM cant_contas_receber cr
      LEFT JOIN alunos a ON cr.ra_aluno = a.ra AND cr.tipo_cliente = 'ALUNO'
      LEFT JOIN funcionarios f ON cr.codigo_funcionario = f.codigo AND cr.tipo_cliente = 'FUNCIONARIO'
      LEFT JOIN cant_usuarios_cantina uc ON cr.criado_por = uc.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (search) {
      sql += ` AND (cr.descricao LIKE ? OR cr.numero_documento LIKE ? OR
                    CASE
                      WHEN cr.tipo_cliente = 'ALUNO' THEN a.nome
                      WHEN cr.tipo_cliente = 'FUNCIONARIO' THEN f.nome
                      ELSE cr.nome_terceiro
                    END LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += ` AND cr.status = ?`;
      params.push(status);
    }

    if (tipo_cliente) {
      sql += ` AND cr.tipo_cliente = ?`;
      params.push(tipo_cliente);
    }

    if (dt_inicio) {
      sql += ` AND cr.dt_vencimento >= ?`;
      params.push(dt_inicio);
    }

    if (dt_fim) {
      sql += ` AND cr.dt_vencimento <= ?`;
      params.push(dt_fim);
    }

    sql += ` ORDER BY cr.dt_vencimento ASC, cr.status ASC`;

    const rows = await query(sql, params);

    // Converter valores numéricos de string para number
    type Row = Record<string, unknown> & {
      valor?: string | number | null;
      valor_recebido?: string | number | null;
    };
    const processedRows = (rows as Row[]).map((row) => ({
      ...row,
      valor: Number(row.valor ?? 0),
      valor_recebido: Number(row.valor_recebido ?? 0),
    }));

    return NextResponse.json({
      success: true,
      data: processedRows,
    });
  } catch (error) {
    console.error('Erro ao listar contas a receber:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova conta a receber
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tipo_cliente,
      codigo_funcionario,
      ra_aluno,
      nome_terceiro,
      descricao,
      valor,
      dt_vencimento,
      categoria,
      numero_documento,
      observacoes,
    } = body;

    // Validações
    if (!tipo_cliente || !descricao || !valor || !dt_vencimento) {
      return NextResponse.json(
        {
          error: 'Tipo de cliente, descrição, valor e data de vencimento são obrigatórios',
        },
        { status: 400 }
      );
    }

    if (!['FUNCIONARIO', 'ALUNO', 'TERCEIRO'].includes(tipo_cliente)) {
      return NextResponse.json(
        { error: 'Tipo de cliente deve ser FUNCIONARIO, ALUNO ou TERCEIRO' },
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

    // Validações específicas por tipo de cliente
    if (tipo_cliente === 'FUNCIONARIO' && !codigo_funcionario) {
      return NextResponse.json(
        {
          error: 'Código do funcionário é obrigatório para contas de funcionários',
        },
        { status: 400 }
      );
    }

    if (tipo_cliente === 'ALUNO' && !ra_aluno) {
      return NextResponse.json(
        { error: 'RA do aluno é obrigatório para contas de alunos' },
        { status: 400 }
      );
    }

    if (tipo_cliente === 'TERCEIRO' && !nome_terceiro) {
      return NextResponse.json(
        { error: 'Nome do terceiro é obrigatório para contas de terceiros' },
        { status: 400 }
      );
    }

    // Verificar se funcionário existe (se aplicável)
    if (tipo_cliente === 'FUNCIONARIO') {
      const funcionarioExists = await query('SELECT codigo FROM funcionarios WHERE codigo = ?', [
        codigo_funcionario,
      ]);

      if (!funcionarioExists || funcionarioExists.length === 0) {
        return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 400 });
      }
    }

    // Verificar se aluno existe (se aplicável)
    if (tipo_cliente === 'ALUNO') {
      const alunoExists = await query('SELECT ra FROM alunos WHERE ra = ?', [ra_aluno]);

      if (!alunoExists || alunoExists.length === 0) {
        return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 400 });
      }
    }

    // Determinar status inicial baseado na data de vencimento
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const status = dataVencimento < hoje ? 'VENCIDO' : 'PENDENTE';

    // Inserir conta a receber
    const result = await query(
      `INSERT INTO cant_contas_receber
       (tipo_cliente, codigo_funcionario, ra_aluno, nome_terceiro, descricao, valor, dt_vencimento, status, categoria, numero_documento, observacoes, criado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        tipo_cliente,
        tipo_cliente === 'FUNCIONARIO' ? codigo_funcionario : null,
        tipo_cliente === 'ALUNO' ? ra_aluno : null,
        tipo_cliente === 'TERCEIRO' ? nome_terceiro.trim() : null,
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
      `SELECT cr.*,
              CASE
                WHEN cr.tipo_cliente = 'ALUNO' THEN a.nome
                WHEN cr.tipo_cliente = 'FUNCIONARIO' THEN f.nome
                ELSE cr.nome_terceiro
              END as nome_cliente,
              uc.nome as criado_por_nome
       FROM cant_contas_receber cr
       LEFT JOIN alunos a ON cr.ra_aluno = a.ra AND cr.tipo_cliente = 'ALUNO'
       LEFT JOIN funcionarios f ON cr.codigo_funcionario = f.codigo AND cr.tipo_cliente = 'FUNCIONARIO'
       LEFT JOIN cant_usuarios_cantina uc ON cr.criado_por = uc.id
       WHERE cr.id = LAST_INSERT_ID()`,
      []
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Conta a receber criada com sucesso',
        data: newConta[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar conta a receber:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
