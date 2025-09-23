import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

// GET - Listar produtos com filtros
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const idTipo = url.searchParams.get('id_tipo');
    const ativo = url.searchParams.get('ativo');

    let sql = `
      SELECT p.*, tp.nome AS tipo_nome
      FROM cant_produtos p
      INNER JOIN cant_tipos_produtos tp ON p.id_tipo = tp.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (search) {
      sql += ` AND (p.nome LIKE ? OR p.codigo_barras LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    if (idTipo) {
      sql += ` AND p.id_tipo = ?`;
      params.push(Number(idTipo));
    }
    if (ativo !== null) {
      sql += ` AND p.ativo = ?`;
      params.push(Number(ativo));
    }

    sql += ` ORDER BY p.nome ASC`;

    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar novo produto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, id_tipo, preco_venda, codigo_barras, por_quilo } = body;

    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    if (!id_tipo || isNaN(Number(id_tipo))) {
      return NextResponse.json({ error: 'Tipo é obrigatório' }, { status: 400 });
    }
    if (preco_venda === undefined || isNaN(Number(preco_venda))) {
      return NextResponse.json({ error: 'Preço de venda inválido' }, { status: 400 });
    }

    // Verificar se tipo existe e está ativo
    const tipo = await query('SELECT id FROM cant_tipos_produtos WHERE id = ? AND ativo = 1', [
      id_tipo,
    ]);
    if (!tipo || tipo.length === 0) {
      return NextResponse.json({ error: 'Tipo de produto inválido' }, { status: 400 });
    }

    // Verificar duplicidade por nome + tipo ativos
    const dup = await query(
      'SELECT id FROM cant_produtos WHERE nome = ? AND id_tipo = ? AND ativo = 1',
      [nome.trim(), id_tipo]
    );
    if (dup && dup.length > 0) {
      return NextResponse.json(
        { error: 'Já existe um produto ativo com este nome e tipo' },
        { status: 400 }
      );
    }

    // Inserir produto
    await query(
      `INSERT INTO cant_produtos (nome, id_tipo, preco_venda, codigo_barras, por_quilo, ativo, criado_por)
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
      [nome.trim(), Number(id_tipo), Number(preco_venda), codigo_barras || null, por_quilo ? 1 : 0]
    );

    // Criar registro de estoque inicial
    await query(
      `INSERT INTO cant_estoque (id_produto, quantidade_atual, quantidade_minima)
       VALUES (LAST_INSERT_ID(), 0, 0)`
    );

    // Buscar produto criado
    const novo = await query(
      `SELECT p.*, tp.nome AS tipo_nome
       FROM cant_produtos p
       INNER JOIN cant_tipos_produtos tp ON p.id_tipo = tp.id
       WHERE p.id = LAST_INSERT_ID()`
    );

    return NextResponse.json(
      { success: true, message: 'Produto criado com sucesso', data: novo[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
