import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import pool, { query } from '../../../../lib/db';

function parseDecimal(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(
    typeof value === 'string' ? value.replace(/\./g, '').replace(',', '.') : value
  );
  return Number.isFinite(num) ? Number(num.toFixed(2)) : null;
}

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const url = new URL(req.url);
    const cargo = (url.searchParams.get('cargo') || '').trim().toUpperCase();
    const idProduto = url.searchParams.get('id_produto');
    const ativo = url.searchParams.get('ativo');
    const apenasVigentes = url.searchParams.get('vigentes');

    let sql = `
      SELECT pc.id, pc.cargo, pc.id_produto, pc.preco_especial, pc.ativo,
             pc.dt_inicio_vigencia, pc.dt_fim_vigencia, pc.dt_criacao, pc.dt_alteracao,
             p.nome AS produto_nome, p.preco_venda AS preco_padrao
      FROM cant_precos_por_cargo pc
      INNER JOIN cant_produtos p ON p.id = pc.id_produto
      WHERE 1 = 1
    `;
    const params: (string | number)[] = [];

    if (cargo) {
      sql += ` AND pc.cargo = ?`;
      params.push(cargo);
    }
    if (idProduto) {
      const id = Number(idProduto);
      if (Number.isFinite(id) && id > 0) {
        sql += ` AND pc.id_produto = ?`;
        params.push(id);
      }
    }
    if (ativo !== null && ativo !== '') {
      sql += ` AND pc.ativo = ?`;
      params.push(Number(ativo) ? 1 : 0);
    }
    if (apenasVigentes && Number(apenasVigentes)) {
      sql += ` AND (pc.dt_inicio_vigencia IS NULL OR pc.dt_inicio_vigencia <= CURDATE())
               AND (pc.dt_fim_vigencia IS NULL OR pc.dt_fim_vigencia >= CURDATE())`;
    }

    sql += ` ORDER BY pc.cargo ASC, p.nome ASC`;

    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Erro ao listar preços por cargo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const conn = await pool.getConnection();
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const cargo = (body?.cargo || '').toString().trim().toUpperCase();
    const id_produto = Number(body?.id_produto);
    const preco_especial = parseDecimal(body?.preco_especial);
    const dt_inicio_vigencia = body?.dt_inicio_vigencia ? new Date(body.dt_inicio_vigencia) : null;
    const dt_fim_vigencia = body?.dt_fim_vigencia ? new Date(body.dt_fim_vigencia) : null;
    const ativo = body?.ativo === undefined ? 1 : Number(body.ativo) ? 1 : 0;

    if (!cargo) {
      return NextResponse.json({ error: 'Cargo é obrigatório' }, { status: 400 });
    }
    if (!Number.isFinite(id_produto) || id_produto <= 0) {
      return NextResponse.json({ error: 'Produto inválido' }, { status: 400 });
    }
    if (preco_especial === null) {
      return NextResponse.json({ error: 'Preço especial inválido' }, { status: 400 });
    }
    if (dt_inicio_vigencia && dt_fim_vigencia && dt_inicio_vigencia > dt_fim_vigencia) {
      return NextResponse.json({ error: 'Período de vigência inválido' }, { status: 400 });
    }

    const produtos = await conn.query(`SELECT id, preco_venda FROM cant_produtos WHERE id = ?`, [
      id_produto,
    ]);
    if (!Array.isArray(produtos[0]) || (produtos[0] as any[]).length === 0) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }
    const produto = (produtos[0] as { id: number; preco_venda: number }[])[0];

    const existentes = await conn.query(
      `SELECT id FROM cant_precos_por_cargo WHERE cargo = ? AND id_produto = ? LIMIT 1`,
      [cargo, id_produto]
    );
    if (Array.isArray(existentes[0]) && (existentes[0] as any[]).length > 0) {
      return NextResponse.json(
        { error: 'Já existe preço para este cargo e produto' },
        { status: 409 }
      );
    }

    await conn.beginTransaction();

    const [insertResult] = await conn.query(
      `INSERT INTO cant_precos_por_cargo
       (cargo, id_produto, preco_especial, ativo, dt_inicio_vigencia, dt_fim_vigencia, dt_criacao, dt_alteracao, criado_por)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
      [
        cargo,
        id_produto,
        preco_especial,
        ativo,
        dt_inicio_vigencia ? dt_inicio_vigencia.toISOString().slice(0, 10) : null,
        dt_fim_vigencia ? dt_fim_vigencia.toISOString().slice(0, 10) : null,
        user.id,
      ]
    );
    const idPreco = (insertResult as any).insertId as number;

    await conn.query(
      `INSERT INTO cant_precos_por_cargo_historico
       (id_preco_cargo, cargo, id_produto, preco_anterior, preco_novo, dt_alteracao, usuario)
       VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
      [idPreco, cargo, id_produto, Number(produto.preco_venda), preco_especial, user.id]
    );

    await conn.commit();

    const [rowsPreco] = await conn.query(
      `SELECT pc.*, p.nome AS produto_nome, p.preco_venda AS preco_padrao
       FROM cant_precos_por_cargo pc
       INNER JOIN cant_produtos p ON p.id = pc.id_produto
       WHERE pc.id = ?`,
      [idPreco]
    );

    return NextResponse.json({
      success: true,
      data: Array.isArray(rowsPreco) ? rowsPreco[0] : null,
    });
  } catch (error) {
    try {
      await conn.rollback();
    } catch {}
    console.error('Erro ao criar preço por cargo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  } finally {
    conn.release();
  }
}
