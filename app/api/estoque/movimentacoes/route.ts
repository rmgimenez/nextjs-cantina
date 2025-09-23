import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

// POST /api/estoque/movimentacoes { id_produto, tipo_movimentacao, quantidade, motivo, documento }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_produto, tipo_movimentacao, quantidade, motivo, documento } = body;

    const tiposValidos = ['ENTRADA', 'SAIDA', 'AJUSTE'] as const;
    if (!id_produto || isNaN(Number(id_produto))) {
      return NextResponse.json({ error: 'Produto inválido' }, { status: 400 });
    }
    if (!tiposValidos.includes(tipo_movimentacao)) {
      return NextResponse.json({ error: 'Tipo de movimentação inválido' }, { status: 400 });
    }
    const qtd = Number(quantidade);
    if (isNaN(qtd) || qtd <= 0) {
      return NextResponse.json({ error: 'Quantidade inválida' }, { status: 400 });
    }

    // Garantir existência de estoque
    let estRows = (await query(
      'SELECT id, quantidade_atual FROM cant_estoque WHERE id_produto = ?',
      [Number(id_produto)]
    )) as Array<{ id: number; quantidade_atual: number }>;
    if (!estRows || estRows.length === 0) {
      await query(
        'INSERT INTO cant_estoque (id_produto, quantidade_atual, quantidade_minima) VALUES (?, 0, 0)',
        [Number(id_produto)]
      );
      estRows = (await query('SELECT id, quantidade_atual FROM cant_estoque WHERE id_produto = ?', [
        Number(id_produto),
      ])) as Array<{ id: number; quantidade_atual: number }>;
    }
    const estoque = estRows[0] as { id: number; quantidade_atual: number };
    const anterior = Number(estoque.quantidade_atual) || 0;

    let posterior = anterior;
    if (tipo_movimentacao === 'ENTRADA') posterior = anterior + qtd;
    else if (tipo_movimentacao === 'SAIDA') posterior = anterior - qtd;
    else if (tipo_movimentacao === 'AJUSTE') posterior = qtd; // ajuste define quantidade exata

    if (posterior < 0) {
      return NextResponse.json({ error: 'Estoque insuficiente' }, { status: 400 });
    }

    // Inserir movimentação; trigger atualizará tabela de estoque
    await query(
      `INSERT INTO cant_movimentacoes_estoque (id_produto, tipo_movimentacao, quantidade, quantidade_anterior, quantidade_posterior, motivo, documento, usuario)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        Number(id_produto),
        tipo_movimentacao,
        qtd,
        anterior,
        posterior,
        motivo?.trim() || null,
        documento?.trim() || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Movimentação registrada com sucesso',
      data: { quantidade_anterior: anterior, quantidade_posterior: posterior },
    });
  } catch (error) {
    console.error('Erro ao movimentar estoque:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
