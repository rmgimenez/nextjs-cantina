import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
      SELECT * FROM cant_view_conta_receber_resumo WHERE id = ?
    `,
      [id]
    );

    if (!conta) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    // Busca parcelas se houver
    const parcelas = await query(
      `
      SELECT * FROM cant_view_conta_receber_parcela_resumo 
      WHERE conta_receber_id = ? 
      ORDER BY numero_parcela
    `,
      [id]
    );

    // Busca histórico de recebimentos
    const recebimentos = await query(
      `
      SELECT crr.*, u.nome as usuario_nome
      FROM cant_conta_receber_recebimento crr
      LEFT JOIN cant_usuarios u ON crr.usuario_id = u.id
      WHERE crr.conta_receber_id = ?
      ORDER BY crr.data_recebimento DESC
    `,
      [id]
    );

    return NextResponse.json({
      conta,
      parcelas,
      recebimentos,
    });
  } catch (error) {
    console.error('Erro ao buscar conta a receber:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      cliente,
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
      UPDATE cant_conta_receber SET
        categoria_id = ?, 
        descricao = ?, 
        cliente = ?, 
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
        cliente || null,
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
    console.error('Erro ao atualizar conta a receber:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('cantina_session')?.value;
    const user = verifyToken(token);

    if (!user || user.tipo !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = params;

    // Verifica se há recebimentos associados
    const [recebimento] = await query(
      `
      SELECT id FROM cant_conta_receber_recebimento WHERE conta_receber_id = ? LIMIT 1
    `,
      [id]
    );

    if (recebimento) {
      return NextResponse.json(
        {
          error: 'Não é possível excluir conta com recebimentos registrados',
        },
        { status: 400 }
      );
    }

    const result = await query(
      `
      DELETE FROM cant_conta_receber WHERE id = ?
    `,
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Conta excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir conta a receber:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
