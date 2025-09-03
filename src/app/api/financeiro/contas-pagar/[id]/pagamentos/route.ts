import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: any) {
  try {
    const token = request.cookies.get('cantina_session')?.value;
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const pagamentos = await query(
      `
      SELECT cpp.*, u.nome as usuario_nome
      FROM cant_conta_pagar_pagamento cpp
      LEFT JOIN cant_usuarios u ON cpp.usuario_id = u.id
      WHERE cpp.conta_pagar_id = ?
      ORDER BY cpp.data_pagamento DESC
    `,
      [id]
    );

    return NextResponse.json(pagamentos);
  } catch (error) {
    console.error('Erro ao buscar pagamentos da conta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: any) {
  try {
    const token = request.cookies.get('cantina_session')?.value;
    const user = verifyToken(token);

    if (!user || !['ADMIN', 'ESTOQUISTA', 'ATENDENTE'].includes(user.tipo)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = await params;
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

    // Converte valores para números
    const valorPagoNum = parseFloat(valor_pago);
    const valorDescontoNum = parseFloat(valor_desconto || 0);
    const valorJurosNum = parseFloat(valor_juros || 0);

    if (isNaN(valorPagoNum) || valorPagoNum <= 0) {
      return NextResponse.json({ error: 'Valor pago deve ser maior que zero' }, { status: 400 });
    }

    if (isNaN(valorDescontoNum) || valorDescontoNum < 0) {
      return NextResponse.json(
        { error: 'Valor desconto deve ser maior ou igual a zero' },
        { status: 400 }
      );
    }

    if (isNaN(valorJurosNum) || valorJurosNum < 0) {
      return NextResponse.json(
        { error: 'Valor juros deve ser maior ou igual a zero' },
        { status: 400 }
      );
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
    console.log('Registrar pagamento params:', {
      conta_pagar_id: id,
      parcela_id: parcela_id || null,
      valorPagoNum,
      valorDescontoNum,
      valorJurosNum,
      data_pagamento,
      forma_pagamento,
      observacoes: observacoes || null,
      usuario_id: user.id,
    });
    await query(
      `
      CALL cant_sp_registrar_pagamento_conta(?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        parcela_id || null,
        valorPagoNum,
        valorDescontoNum,
        valorJurosNum,
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
    // Em ambiente de dev, devolver stack/message para ajudar debug
    const msg = (error && (error as any).message) || 'Erro interno do servidor';
    const stack = (error && (error as any).stack) || null;
    console.error('Stack:', stack);
    return NextResponse.json({ error: msg, stack }, { status: 500 });
  }
}
