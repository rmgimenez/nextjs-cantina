import { NextResponse } from 'next/server';
import { query } from '../../../../../../lib/db';

// POST /api/alunos/contas/[ra]/recarga { valor, descricao }
export async function POST(req: Request, { params }: { params: Promise<{ ra: string }> }) {
  try {
    const { ra } = await params;
    if (!ra || isNaN(Number(ra))) {
      return NextResponse.json({ error: 'RA inválido' }, { status: 400 });
    }
    const body = await req.json();
    const { valor, descricao } = body;
    const v = Number(valor);
    if (!valor || isNaN(v) || v <= 0) {
      return NextResponse.json({ error: 'Valor de recarga inválido' }, { status: 400 });
    }

    // Garantir que conta exista
    let contaRows = await query(
      'SELECT id, saldo_atual FROM cant_contas_alunos WHERE ra_aluno = ?',
      [Number(ra)]
    );
    if (!contaRows || contaRows.length === 0) {
      await query(
        `INSERT INTO cant_contas_alunos (ra_aluno, saldo_atual, limite_credito, ativo)
         VALUES (?, 0, 0, 1)`,
        [Number(ra)]
      );
      contaRows = await query('SELECT id, saldo_atual FROM cant_contas_alunos WHERE ra_aluno = ?', [
        Number(ra),
      ]);
    }
    const conta = contaRows[0] as { id: number; saldo_atual: number };
    const saldoAnterior = Number(conta.saldo_atual ?? 0) || 0;
    const saldoPosterior = saldoAnterior + v;

    // Registrar movimentação; trigger ajusta o saldo da conta
    await query(
      `INSERT INTO cant_movimentacoes_alunos
       (id_conta_aluno, tipo_movimentacao, valor, saldo_anterior, saldo_posterior, descricao, usuario)
       VALUES (?, 'CREDITO', ?, ?, ?, ?, 1)`,
      [conta.id, v, saldoAnterior, saldoPosterior, descricao?.trim() || 'Recarga manual']
    );

    return NextResponse.json({
      success: true,
      message: 'Recarga realizada com sucesso',
      data: { saldo_anterior: saldoAnterior, saldo_atual: saldoPosterior },
    });
  } catch (error) {
    console.error('Erro ao recarregar conta do aluno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
