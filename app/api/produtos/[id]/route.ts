import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

// GET - Buscar produto específico
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const rows = await query(
      `SELECT p.*, tp.nome AS tipo_nome
       FROM cant_produtos p
       INNER JOIN cant_tipos_produtos tp ON p.id_tipo = tp.id
       WHERE p.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar produto
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nome, id_tipo, preco_venda, codigo_barras, por_quilo, ativo } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Buscar produto atual
    const currentRows = (await query('SELECT * FROM cant_produtos WHERE id = ?', [id])) as Array<{
      id: number;
      nome: string;
      id_tipo: number;
      preco_venda: number;
      codigo_barras: string | null;
      por_quilo: 0 | 1;
      ativo: 0 | 1;
    }>;
    if (!currentRows || currentRows.length === 0) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }
    const current = currentRows[0];

    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    if (!id_tipo || isNaN(Number(id_tipo))) {
      return NextResponse.json({ error: 'Tipo é obrigatório' }, { status: 400 });
    }
    if (preco_venda === undefined || isNaN(Number(preco_venda))) {
      return NextResponse.json({ error: 'Preço de venda inválido' }, { status: 400 });
    }

    // Verificar nome duplicado em outro produto ativo
    const dup = await query(
      'SELECT id FROM cant_produtos WHERE nome = ? AND id_tipo = ? AND id != ? AND ativo = 1',
      [nome.trim(), Number(id_tipo), Number(id)]
    );
    if (dup && dup.length > 0) {
      return NextResponse.json(
        { error: 'Já existe um produto ativo com este nome e tipo' },
        { status: 400 }
      );
    }

    // Atualizar produto
    await query(
      `UPDATE cant_produtos
       SET nome = ?, id_tipo = ?, preco_venda = ?, codigo_barras = ?, por_quilo = ?, ativo = ?
       WHERE id = ?`,
      [
        nome.trim(),
        Number(id_tipo),
        Number(preco_venda),
        codigo_barras || null,
        por_quilo ? 1 : 0,
        ativo ? 1 : 0,
        Number(id),
      ]
    );

    // Se preço mudou, registrar histórico
    if (Number(preco_venda) !== Number(current.preco_venda)) {
      await query(
        `INSERT INTO cant_historico_precos (id_produto, preco_anterior, preco_novo, alterado_por)
         VALUES (?, ?, ?, 1)`,
        [Number(id), Number(current.preco_venda), Number(preco_venda)]
      );
    }

    const updated = await query(
      `SELECT p.*, tp.nome AS tipo_nome
       FROM cant_produtos p
       INNER JOIN cant_tipos_produtos tp ON p.id_tipo = tp.id
       WHERE p.id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: updated[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Desativar (soft delete)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Verificar existência
    const exists = await query('SELECT id FROM cant_produtos WHERE id = ?', [id]);
    if (!exists || exists.length === 0) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    await query('UPDATE cant_produtos SET ativo = 0 WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Produto desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar produto:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
