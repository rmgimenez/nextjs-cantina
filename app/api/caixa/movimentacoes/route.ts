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
    const { tipo, valor, descricao } = body || {};
    if (!tipo || !['SANGRIA', 'SUPRIMENTO'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }
    const v = Number(valor);
    if (isNaN(v) || v <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
    }

    type CaixaRow = { id: number };
    const aberto = (await query(
      `SELECT id FROM cant_caixa WHERE status = 'ABERTO' ORDER BY dt_abertura DESC LIMIT 1`
    )) as CaixaRow[];
    if (!aberto || aberto.length === 0) {
      return NextResponse.json({ error: 'Não há caixa aberto' }, { status: 400 });
    }
    const idCaixa = aberto[0].id;

    await query(
      `INSERT INTO cant_movimentacoes_caixa (id_caixa, tipo_movimentacao, valor, descricao, usuario)
       VALUES (?, ?, ?, ?, ?)`,
      [idCaixa, tipo, v, descricao || null, user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao movimentar caixa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
