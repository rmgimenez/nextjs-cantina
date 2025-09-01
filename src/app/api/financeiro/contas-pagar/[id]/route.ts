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

    const { id } = params;

    // Busca a conta
    const [conta] = await query(
      `
      SELECT * FROM cant_view_conta_pagar_resumo WHERE id = ?
    `,
      [id]
    );

    if (!conta) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    // Busca parcelas se houver
    const parcelas = await query(
      `
      SELECT * FROM cant_view_conta_pagar_parcela_resumo 
      WHERE conta_pagar_id = ? 
      ORDER BY numero_parcela
    `,
      [id]
    );

    // Busca histórico de pagamentos
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

    return NextResponse.json({
      conta,
      parcelas,
      pagamentos,
    });
  } catch (error) {
    console.error('Erro ao buscar conta a pagar:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: any) {
  try {
    const token = request.cookies.get('cantina_session')?.value;
    const user = verifyToken(token);

    if (!user || !['ADMIN', 'ESTOQUISTA'].includes(user.tipo)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      categoria_id,
      descricao,
      fornecedor,
      numero_documento,
      valor_original,
      data_emissao,
      data_vencimento,
      observacoes,
      status,
    } = body;

    if (!descricao || !valor_original || !data_emissao || !data_vencimento) {
      return NextResponse.json({ error: 'Dados obrigatórios não informados' }, { status: 400 });
    }

    const result = await query(
      `
      UPDATE cant_conta_pagar SET
        categoria_id = ?, 
        descricao = ?, 
        fornecedor = ?, 
        numero_documento = ?, 
        valor_original = ?, 
        data_emissao = ?, 
        data_vencimento = ?, 
        observacoes = ?,
        status = IFNULL(?, status)
      WHERE id = ?
    `,
      [
        categoria_id || null,
        descricao,
        fornecedor || null,
        numero_documento || null,
        valor_original,
        data_emissao,
        data_vencimento,
        observacoes || null,
        status || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Conta atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar conta a pagar:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const token = request.cookies.get('cantina_session')?.value;
    const user = verifyToken(token);

    if (!user || user.tipo !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = params;

    // Verifica se há pagamentos associados
    const [pagamento] = await query(
      `
      SELECT id FROM cant_conta_pagar_pagamento WHERE conta_pagar_id = ? LIMIT 1
    `,
      [id]
    );

    if (pagamento) {
      return NextResponse.json(
        {
          error: 'Não é possível excluir conta com pagamentos registrados',
        },
        { status: 400 }
      );
    }

    const result = await query(
      `
      DELETE FROM cant_conta_pagar WHERE id = ?
    `,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Conta excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir conta a pagar:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
