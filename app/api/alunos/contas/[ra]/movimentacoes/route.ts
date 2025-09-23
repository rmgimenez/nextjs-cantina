import { NextResponse } from 'next/server';
import { query } from '../../../../../../lib/db';

// GET /api/alunos/contas/[ra]/movimentacoes?limit=50
export async function GET(req: Request, { params }: { params: Promise<{ ra: string }> }) {
  try {
    const { ra } = await params;
    if (!ra || isNaN(Number(ra))) {
      return NextResponse.json({ error: 'RA inválido' }, { status: 400 });
    }

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200);

    // Descobrir conta
    const contaRows = await query('SELECT id FROM cant_contas_alunos WHERE ra_aluno = ?', [
      Number(ra),
    ]);
    if (!contaRows || contaRows.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }
    const contaId = (contaRows[0] as { id: number }).id;

    const movs = await query(
      `SELECT id, tipo_movimentacao, valor, saldo_anterior, saldo_posterior, descricao, id_venda, dt_movimentacao
       FROM cant_movimentacoes_alunos
       WHERE id_conta_aluno = ?
       ORDER BY dt_movimentacao DESC
       LIMIT ${limit}`,
      [contaId]
    );
    return NextResponse.json({ success: true, data: movs });
  } catch (error) {
    console.error('Erro ao listar movimentações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
