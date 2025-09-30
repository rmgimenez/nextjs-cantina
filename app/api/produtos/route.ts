import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

// GET - Listar produtos com filtros
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // aceitar tanto 'search' quanto 'q' como termo
    const search = url.searchParams.get('search') || url.searchParams.get('q') || '';
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
    const parsed = (rows as any[]).map((r) => ({
      ...r,
      preco_venda: r.preco_venda != null ? Number(r.preco_venda) : r.preco_venda,
      por_quilo: r.por_quilo != null ? Number(r.por_quilo) : r.por_quilo,
    }));
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar novo produto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, id_tipo, preco_venda, codigo_barras, por_quilo, quantidade_inicial } = body;

    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    if (!id_tipo || isNaN(Number(id_tipo))) {
      return NextResponse.json({ error: 'Tipo é obrigatório' }, { status: 400 });
    }
    if (preco_venda === undefined || isNaN(Number(preco_venda))) {
      return NextResponse.json({ error: 'Preço de venda inválido' }, { status: 400 });
    }

    const quantidadeInicialNumber =
      quantidade_inicial !== undefined && quantidade_inicial !== null
        ? Number(quantidade_inicial)
        : 0;

    if (Number.isNaN(quantidadeInicialNumber) || quantidadeInicialNumber < 0) {
      return NextResponse.json({ error: 'Quantidade inicial inválida' }, { status: 400 });
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
    const insertResult = (await query(
      `INSERT INTO cant_produtos (nome, id_tipo, preco_venda, codigo_barras, por_quilo, ativo, criado_por)
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
      [nome.trim(), Number(id_tipo), Number(preco_venda), codigo_barras || null, por_quilo ? 1 : 0]
    )) as unknown;

    let novoProdutoId: number | undefined;
    if (insertResult && typeof insertResult === 'object' && 'insertId' in insertResult) {
      const rawId = (insertResult as { insertId: number }).insertId;
      if (rawId) novoProdutoId = Number(rawId);
    }

    if (!novoProdutoId) {
      const idRows = (await query(
        `SELECT id FROM cant_produtos WHERE nome = ? AND id_tipo = ? ORDER BY id DESC LIMIT 1`,
        [nome.trim(), Number(id_tipo)]
      )) as Array<{ id: number }>;
      if (idRows && idRows.length > 0) {
        novoProdutoId = Number(idRows[0].id);
      }
    }

    if (!novoProdutoId) {
      return NextResponse.json(
        { error: 'Não foi possível identificar o produto criado' },
        { status: 500 }
      );
    }

    // Criar registro de estoque inicial
    await query(
      `INSERT INTO cant_estoque (id_produto, quantidade_atual, quantidade_minima)
       VALUES (?, ?, 0)`,
      [novoProdutoId, quantidadeInicialNumber]
    );

    if (quantidadeInicialNumber > 0) {
      await query(
        `INSERT INTO cant_movimentacoes_estoque (id_produto, tipo_movimentacao, quantidade, quantidade_anterior, quantidade_posterior, motivo, documento, usuario)
         VALUES (?, 'AJUSTE', ?, 0, ?, 'Estoque inicial', 'CADASTRO_PRODUTO', 1)`,
        [novoProdutoId, quantidadeInicialNumber, quantidadeInicialNumber]
      );
    }

    // Buscar produto criado
    const novo = await query(
      `SELECT p.*, tp.nome AS tipo_nome
       FROM cant_produtos p
       INNER JOIN cant_tipos_produtos tp ON p.id_tipo = tp.id
       WHERE p.id = ?`,
      [novoProdutoId]
    );

    const parsedNovo = (novo as any[]).map((r) => ({
      ...r,
      preco_venda: r.preco_venda != null ? Number(r.preco_venda) : r.preco_venda,
      por_quilo: r.por_quilo != null ? Number(r.por_quilo) : r.por_quilo,
    }));

    return NextResponse.json(
      { success: true, message: 'Produto criado com sucesso', data: parsedNovo[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
