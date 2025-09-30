import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { query } from '../../../../lib/db';

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
    const search = (url.searchParams.get('search') || '').trim();
    const ativo = url.searchParams.get('ativo');
    const cargo = (url.searchParams.get('cargo') || '').trim();
    const limiteMin = url.searchParams.get('limite_min');
    const limiteMax = url.searchParams.get('limite_max');

    let sql = `
      SELECT v.*, cf.observacoes
      FROM vw_cant_contas_funcionarios v
      LEFT JOIN cant_contas_funcionarios cf ON cf.codigo_funcionario = v.codigo_funcionario
      WHERE 1 = 1
    `;
    const params: (string | number)[] = [];

    if (search) {
      sql += ` AND (CAST(codigo_funcionario AS CHAR) LIKE ? OR funcionario_nome LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (ativo !== null && ativo !== '') {
      sql += ` AND ativo = ?`;
      params.push(Number(ativo) ? 1 : 0);
    }

    if (cargo) {
      sql += ` AND (cargo_oficial = ? OR cargo_oficial LIKE ?)`;
      params.push(cargo, `%${cargo}%`);
    }

    if (limiteMin) {
      const min = Number(limiteMin);
      if (Number.isFinite(min)) {
        sql += ` AND (limite_credito IS NOT NULL AND limite_credito >= ?)`;
        params.push(min);
      }
    }

    if (limiteMax) {
      const max = Number(limiteMax);
      if (Number.isFinite(max)) {
        sql += ` AND (limite_credito IS NOT NULL AND limite_credito <= ?)`;
        params.push(max);
      }
    }

    sql += ` ORDER BY funcionario_nome ASC`;

    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Erro ao listar contas de funcionários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const codigo_funcionario = Number(body?.codigo_funcionario);
    const limite_credito = parseDecimal(body?.limite_credito);
    const alerta_credito = parseDecimal(body?.alerta_credito);
    const observacoes = (body?.observacoes || '').toString().trim() || null;
    const ativo = body?.ativo === undefined ? 1 : Number(body.ativo) ? 1 : 0;

    if (!Number.isFinite(codigo_funcionario) || codigo_funcionario <= 0) {
      return NextResponse.json({ error: 'Código de funcionário inválido' }, { status: 400 });
    }

    const funcionario = await query(
      `SELECT codigo, nome FROM funcionarios WHERE codigo = ? LIMIT 1`,
      [codigo_funcionario]
    );
    if (!funcionario || funcionario.length === 0) {
      return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
    }

    await query(
      `INSERT INTO cant_contas_funcionarios (codigo_funcionario, limite_credito, alerta_credito, observacoes, ativo)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         limite_credito = VALUES(limite_credito),
         alerta_credito = VALUES(alerta_credito),
         observacoes = VALUES(observacoes),
         ativo = VALUES(ativo),
         dt_alteracao = NOW()`,
      [codigo_funcionario, limite_credito, alerta_credito, observacoes, ativo]
    );

    const dados = await query(
      `SELECT v.*, cf.observacoes
       FROM vw_cant_contas_funcionarios v
       LEFT JOIN cant_contas_funcionarios cf ON cf.codigo_funcionario = v.codigo_funcionario
       WHERE v.codigo_funcionario = ? LIMIT 1`,
      [codigo_funcionario]
    );

    return NextResponse.json({ success: true, data: dados ? dados[0] : null });
  } catch (error) {
    console.error('Erro ao salvar conta de funcionário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
