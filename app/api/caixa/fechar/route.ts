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
    const { valor_final_real, observacoes } = body || {};
    const valorReal = Number(valor_final_real);
    if (isNaN(valorReal) || valorReal < 0) {
      return NextResponse.json({ error: 'Valor final real inválido' }, { status: 400 });
    }

    type CaixaRow = { id: number; valor_inicial: number };
    const aberto = (await query(
      `SELECT id, valor_inicial FROM cant_caixa WHERE status = 'ABERTO' ORDER BY dt_abertura DESC LIMIT 1`
    )) as CaixaRow[];
    if (!aberto || aberto.length === 0) {
      return NextResponse.json({ error: 'Não há caixa aberto' }, { status: 400 });
    }
    const cx = aberto[0];
    const idCaixa = cx.id;

    type TotalRow = { total: number };
    const [sup] = (await query(
      `SELECT COALESCE(SUM(valor),0) AS total FROM cant_movimentacoes_caixa WHERE id_caixa = ? AND tipo_movimentacao = 'SUPRIMENTO'`,
      [idCaixa]
    )) as TotalRow[];
    const [san] = (await query(
      `SELECT COALESCE(SUM(valor),0) AS total FROM cant_movimentacoes_caixa WHERE id_caixa = ? AND tipo_movimentacao = 'SANGRIA'`,
      [idCaixa]
    )) as TotalRow[];
    const [venDin] = (await query(
      `SELECT COALESCE(SUM(valor),0) AS total FROM cant_movimentacoes_caixa WHERE id_caixa = ? AND tipo_movimentacao = 'VENDA'`,
      [idCaixa]
    )) as TotalRow[];

    const valor_inicial = Number(cx.valor_inicial || 0);
    const suprimentos = Number(sup?.total || 0);
    const sangrias = Number(san?.total || 0);
    const vendas_dinheiro = Number(venDin?.total || 0);
    const esperado = valor_inicial + suprimentos + vendas_dinheiro - sangrias;
    const diferenca = Number((valorReal - esperado).toFixed(2));

    await query(
      `UPDATE cant_caixa SET dt_fechamento = NOW(), valor_final_esperado = ?, valor_final_real = ?, diferenca = ?, status = 'FECHADO', observacoes = ?, usuario_fechamento = ? WHERE id = ?`,
      [esperado, valorReal, diferenca, observacoes || null, user.id, idCaixa]
    );

    return NextResponse.json({
      success: true,
      data: { id: idCaixa, esperado, valorReal, diferenca },
    });
  } catch (error) {
    console.error('Erro ao fechar caixa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
