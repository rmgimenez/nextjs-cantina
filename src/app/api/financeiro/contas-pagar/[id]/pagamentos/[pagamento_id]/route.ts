import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: any) {
  try {
    const token = request.cookies.get('cantina_session')?.value;
    const user = verifyToken(token);

    if (!user || !['ADMIN', 'ESTOQUISTA', 'ATENDENTE'].includes(user.tipo)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id, pagamento_id } = await params;
    const body = await request.json();
    const {
      parcela_id,
      valor_pago,
      valor_desconto = 0,
      valor_juros = 0,
      data_pagamento,
      forma_pagamento,
      observacoes,
    } = body;

    if (!valor_pago || !data_pagamento || !forma_pagamento) {
      return NextResponse.json({ error: 'Dados obrigatórios não informados' }, { status: 400 });
    }

    if (
      ![
        'DINHEIRO',
        'CHEQUE',
        'TRANSFERENCIA',
        'PIX',
        'CARTAO_DEBITO',
        'CARTAO_CREDITO',
        'OUTRO',
      ].includes(forma_pagamento)
    ) {
      return NextResponse.json({ error: 'Forma de pagamento inválida' }, { status: 400 });
    }

    // Verifica se o pagamento pertence à conta especificada
    const [pagamento] = await query(
      `
      SELECT id FROM cant_conta_pagar_pagamento
      WHERE id = ? AND conta_pagar_id = ?
    `,
      [pagamento_id, id]
    );

    if (!pagamento) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    // Atualiza o pagamento
    await query(
      `
      UPDATE cant_conta_pagar_pagamento SET
        parcela_id = ?,
        valor_pago = ?,
        valor_desconto = ?,
        valor_juros = ?,
        data_pagamento = ?,
        forma_pagamento = ?,
        observacoes = ?
      WHERE id = ? AND conta_pagar_id = ?
    `,
      [
        parcela_id || null,
        valor_pago,
        valor_desconto,
        valor_juros,
        data_pagamento,
        forma_pagamento,
        observacoes || null,
        pagamento_id,
        id,
      ]
    );

    return NextResponse.json({
      message: 'Pagamento atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const token = request.cookies.get('cantina_session')?.value;
    const user = verifyToken(token);

    if (!user || !['ADMIN', 'ESTOQUISTA', 'ATENDENTE'].includes(user.tipo)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id, pagamento_id } = await params;

    // Verifica se a coluna data_pagamento existe na tabela (ajuda a diagnosticar discrepâncias de schema)
    try {
      const [colCheck] = await query(
        `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cant_conta_pagar_pagamento' AND COLUMN_NAME = 'data_pagamento'`
      );
      if (colCheck?.cnt === 0) {
        console.error(
          'Schema mismatch: coluna data_pagamento não encontrada em cant_conta_pagar_pagamento'
        );
        return NextResponse.json(
          {
            error:
              "Schema incompatível: coluna 'data_pagamento' ausente em cant_conta_pagar_pagamento. Aplique as migrations do módulo financeiro.",
          },
          { status: 500 }
        );
      }
    } catch (schemaErr) {
      console.error('Erro ao verificar schema da tabela cant_conta_pagar_pagamento', schemaErr);
      // Não bloqueia a operação principal — prossegue para tentarmos excluir e capturar erro real
    }

    // Verifica se o pagamento pertence à conta especificada
    const [pagamento] = await query(
      `
      SELECT id FROM cant_conta_pagar_pagamento
      WHERE id = ? AND conta_pagar_id = ?
    `,
      [pagamento_id, id]
    );

    if (!pagamento) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    // Exclui o pagamento
    try {
      await query(
        `
        DELETE FROM cant_conta_pagar_pagamento WHERE id = ? AND conta_pagar_id = ?
      `,
        [pagamento_id, id]
      );
    } catch (dbErr: unknown) {
      // Tipagem segura: dbErr pode ser qualquer coisa, então verificamos se possui sqlMessage
      const dbErrMsg =
        dbErr && typeof dbErr === 'object' && dbErr !== null && 'sqlMessage' in dbErr
          ? (dbErr as any).sqlMessage
          : String(dbErr);

      console.error('Erro ao executar DELETE em cant_conta_pagar_pagamento:', dbErrMsg);
      return NextResponse.json({ error: dbErrMsg || 'Erro ao excluir pagamento' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Pagamento excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir pagamento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
