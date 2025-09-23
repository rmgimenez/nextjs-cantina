import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { COOKIE_NAME, verifyToken } from '../../../../lib/jwt';

async function getUserFromRequest(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(COOKIE_NAME + '='));
  if (!match) return null;
  const token = match.split('=')[1];
  return verifyToken(token);
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const body = await req.json();
    const { valor_inicial } = body || {};
    const inicial = Number(valor_inicial);
    if (isNaN(inicial) || inicial < 0) {
      return NextResponse.json({ error: 'Valor inicial inválido' }, { status: 400 });
    }

    const aberto = await query(
      `SELECT id FROM cant_caixa WHERE status = 'ABERTO' ORDER BY dt_abertura DESC LIMIT 1`
    );
    if (aberto && aberto.length > 0) {
      return NextResponse.json({ error: 'Já existe um caixa aberto' }, { status: 400 });
    }

    await query(
      `INSERT INTO cant_caixa (dt_abertura, valor_inicial, status, usuario_abertura)
       VALUES (NOW(), ?, 'ABERTO', ?)`,
      [inicial, user.id]
    );

    const novo = await query(`SELECT * FROM cant_caixa WHERE id = LAST_INSERT_ID()`);
    return NextResponse.json({ success: true, data: novo[0] }, { status: 201 });
  } catch (error) {
    console.error('Erro ao abrir caixa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
