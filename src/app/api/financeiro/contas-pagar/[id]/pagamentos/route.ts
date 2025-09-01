import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: any) {
  try {
    const token = request.cookies.get('cantina_session')?.value;
    const user = verifyToken(token);

    if (!user || !['ADMIN', 'ESTOQUISTA', 'ATENDENTE'].includes(user.tipo)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = params;
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

    // Registra o pagamento usando a stored procedure
    await query(
      `
      CALL cant_sp_registrar_pagamento_conta(?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        parcela_id || null,
        valor_pago,
        valor_desconto,
        valor_juros,
        data_pagamento,
        forma_pagamento,
        observacoes || null,
        user.id,
      ]
    );

    return NextResponse.json(
      {
        message: 'Pagamento registrado com sucesso',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
