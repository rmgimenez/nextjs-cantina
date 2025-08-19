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
    const tipo = searchParams.get('tipo'); // 'RECEITA' ou 'DESPESA'

    let sql = `
      SELECT id, nome, tipo, descricao, ativo, created_at, updated_at 
      FROM cant_categoria_financeira 
      WHERE ativo = 1
    `;
    const params: any[] = [];

    if (tipo && ['RECEITA', 'DESPESA'].includes(tipo)) {
      sql += ` AND tipo = ?`;
      params.push(tipo);
    }

    sql += ` ORDER BY nome`;

    const categorias = await query(sql, params);
    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Erro ao buscar categorias financeiras:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('cantina_session')?.value;
    const user = verifyToken(token);

    if (!user || user.perfil !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { nome, tipo, descricao } = body;

    if (!nome || !tipo || !['RECEITA', 'DESPESA'].includes(tipo)) {
      return NextResponse.json({ error: 'Dados obrigatórios não informados' }, { status: 400 });
    }

    const result = await query(
      `
      INSERT INTO cant_categoria_financeira (nome, tipo, descricao)
      VALUES (?, ?, ?)
    `,
      [nome, tipo, descricao || null]
    );

    return NextResponse.json(
      {
        id: result.insertId,
        message: 'Categoria criada com sucesso',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar categoria financeira:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
