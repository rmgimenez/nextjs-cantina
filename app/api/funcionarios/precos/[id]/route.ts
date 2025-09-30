import type { Pool, PoolConnection } from 'mysql2/promise';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../lib/auth';
import pool, { QueryRow } from '../../../../../lib/db';

type PrecoCargoRow = QueryRow<{
  id: number;
  cargo: string;
  id_produto: number;
  preco_especial: number | string;
  ativo: number;
  dt_inicio_vigencia: string | null;
  dt_fim_vigencia: string | null;
  produto_nome: string;
  preco_padrao: number | string;
}>;

type QueryExecutor = Pool | PoolConnection;

function parseDecimal(value: unknown) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(
    typeof value === 'string' ? value.replace(/\./g, '').replace(',', '.') : value
  );
  return Number.isFinite(num) ? Number(num.toFixed(2)) : null;
}

async function obterPreco(id: number, executor: QueryExecutor = pool) {
  const [rows] = await executor.query<PrecoCargoRow[]>(
    `SELECT pc.*, p.nome AS produto_nome, p.preco_venda AS preco_padrao
     FROM cant_precos_por_cargo pc
     INNER JOIN cant_produtos p ON p.id = pc.id_produto
     WHERE pc.id = ?`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = Number(params?.id);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
    }

    const preco = await obterPreco(id);
    if (!preco) {
      return NextResponse.json({ error: 'Preço não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: preco });
  } catch (error) {
    console.error('Erro ao consultar preço por cargo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const conn = await pool.getConnection();
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const params = await context.params;
    const id = Number(params?.id);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
    }

    const atual = await obterPreco(id, conn);
    if (!atual) {
      return NextResponse.json({ error: 'Preço não encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const preco_especial = parseDecimal(body?.preco_especial);
    const ativo = body?.ativo === undefined ? undefined : Number(body.ativo) ? 1 : 0;
    const cargo = body?.cargo ? body.cargo.toString().trim().toUpperCase() : undefined;
    const dt_inicio_vigencia = body?.dt_inicio_vigencia
      ? new Date(body.dt_inicio_vigencia)
      : undefined;
    const dt_fim_vigencia = body?.dt_fim_vigencia ? new Date(body.dt_fim_vigencia) : undefined;

    if (dt_inicio_vigencia && dt_fim_vigencia && dt_inicio_vigencia > dt_fim_vigencia) {
      return NextResponse.json({ error: 'Período de vigência inválido' }, { status: 400 });
    }

    await conn.beginTransaction();

    const campos: string[] = [];
    const valores: (string | number | null)[] = [];
    let mudouPreco = false;

    if (cargo) {
      campos.push('cargo = ?');
      valores.push(cargo);
    }
    if (preco_especial !== null) {
      campos.push('preco_especial = ?');
      valores.push(preco_especial);
      mudouPreco = Number(atual.preco_especial) !== preco_especial;
    }
    if (ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(ativo);
    }
    if (dt_inicio_vigencia !== undefined) {
      campos.push('dt_inicio_vigencia = ?');
      valores.push(dt_inicio_vigencia ? dt_inicio_vigencia.toISOString().slice(0, 10) : null);
    }
    if (dt_fim_vigencia !== undefined) {
      campos.push('dt_fim_vigencia = ?');
      valores.push(dt_fim_vigencia ? dt_fim_vigencia.toISOString().slice(0, 10) : null);
    }

    if (campos.length === 0) {
      await conn.rollback();
      return NextResponse.json({ error: 'Nenhuma alteração informada' }, { status: 400 });
    }

    campos.push('dt_alteracao = NOW()');

    await conn.query(`UPDATE cant_precos_por_cargo SET ${campos.join(', ')} WHERE id = ?`, [
      ...valores,
      id,
    ]);

    if (mudouPreco) {
      await conn.query(
        `INSERT INTO cant_precos_por_cargo_historico
         (id_preco_cargo, cargo, id_produto, preco_anterior, preco_novo, dt_alteracao, usuario)
         VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
        [
          id,
          cargo || atual.cargo,
          Number(atual.id_produto),
          Number(atual.preco_especial),
          preco_especial,
          user.id,
        ]
      );
    }

    await conn.commit();

    const atualizado = await obterPreco(id, conn);
    return NextResponse.json({ success: true, data: atualizado });
  } catch (error) {
    try {
      await conn.rollback();
    } catch {}
    console.error('Erro ao atualizar preço por cargo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  } finally {
    conn.release();
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const conn = await pool.getConnection();
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const params = await context.params;
    const id = Number(params?.id);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
    }

    const atual = await obterPreco(id, conn);
    if (!atual) {
      return NextResponse.json({ error: 'Preço não encontrado' }, { status: 404 });
    }

    await conn.query(
      `UPDATE cant_precos_por_cargo SET ativo = 0, dt_alteracao = NOW() WHERE id = ?`,
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao desativar preço por cargo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  } finally {
    conn.release();
  }
}
