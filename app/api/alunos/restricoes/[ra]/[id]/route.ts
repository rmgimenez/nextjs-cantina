import { NextResponse } from 'next/server';
import { QueryRow, query } from '../../../../../../lib/db';

type RestricaoAlunoRow = QueryRow<{
  id: number;
  ra_aluno: number;
  tipo_restricao: 'PRODUTO' | 'TIPO_PRODUTO';
  id_produto: number | null;
  id_tipo_produto: number | null;
  motivo: string | null;
  ativo: number;
  produto_nome: string | null;
  tipo_produto_nome: string | null;
}>;

interface AtualizarRestricaoPayload {
  motivo?: string | null;
  ativo?: boolean | number | null;
}

// Helper para validar RA e ID
function parseIds(params: Promise<{ ra: string; id: string }>) {
  return params.then(({ ra, id }) => {
    const raNum = Number(ra);
    const idNum = Number(id);
    if (!ra || isNaN(raNum)) throw new Error('RA inválido');
    if (!id || isNaN(idNum)) throw new Error('ID inválido');
    return { raNum, idNum };
  });
}

// GET - Buscar uma restrição específica por RA + ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ ra: string; id: string }> }
) {
  try {
    const { raNum, idNum } = await parseIds(params);
    const rows = await query<RestricaoAlunoRow[]>(
      `SELECT r.*, p.nome AS produto_nome, tp.nome AS tipo_produto_nome
       FROM cant_restricoes_alunos r
       LEFT JOIN cant_produtos p ON r.id_produto = p.id
       LEFT JOIN cant_tipos_produtos tp ON r.id_tipo_produto = tp.id
       WHERE r.id = ? AND r.ra_aluno = ?
       LIMIT 1`,
      [idNum, raNum]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Restrição não encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    if (error instanceof Error && error.message.includes('inválido')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Erro ao buscar restrição:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar motivo e/ou ativação (soft delete)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ ra: string; id: string }> }
) {
  try {
    const { raNum, idNum } = await parseIds(params);
    const body = (await req.json()) as AtualizarRestricaoPayload | null;
    const { motivo, ativo } = body ?? {};

    // Verificar existência
    const exists = await query<QueryRow<{ id: number }>[]>(
      'SELECT id FROM cant_restricoes_alunos WHERE id = ? AND ra_aluno = ?',
      [idNum, raNum]
    );
    if (!exists || exists.length === 0) {
      return NextResponse.json({ error: 'Restrição não encontrada' }, { status: 404 });
    }

    // Montar update dinâmico
    const sets: string[] = [];
    const args: (number | string | null)[] = [];
    if (motivo !== undefined) {
      sets.push('motivo = ?');
      args.push(motivo?.trim() || null);
    }
    if (ativo !== undefined) {
      sets.push('ativo = ?');
      args.push(ativo ? 1 : 0);
    }
    if (sets.length === 0) {
      return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 });
    }
    args.push(idNum, raNum);

    await query(
      `UPDATE cant_restricoes_alunos SET ${sets.join(', ')} WHERE id = ? AND ra_aluno = ?`,
      args
    );

    const updated = await query<RestricaoAlunoRow[]>(
      `SELECT r.*, p.nome AS produto_nome, tp.nome AS tipo_produto_nome
       FROM cant_restricoes_alunos r
       LEFT JOIN cant_produtos p ON r.id_produto = p.id
       LEFT JOIN cant_tipos_produtos tp ON r.id_tipo_produto = tp.id
       WHERE r.id = ?`,
      [idNum]
    );
    return NextResponse.json({ success: true, message: 'Restrição atualizada', data: updated[0] });
  } catch (error) {
    if (error instanceof Error && error.message.includes('inválido')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Erro ao atualizar restrição:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Soft delete (ativo = 0)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ ra: string; id: string }> }
) {
  try {
    const { raNum, idNum } = await parseIds(params);

    // Verificar existência
    const exists = await query<QueryRow<{ id: number }>[]>(
      'SELECT id FROM cant_restricoes_alunos WHERE id = ? AND ra_aluno = ?',
      [idNum, raNum]
    );
    if (!exists || exists.length === 0) {
      return NextResponse.json({ error: 'Restrição não encontrada' }, { status: 404 });
    }

    await query('UPDATE cant_restricoes_alunos SET ativo = 0 WHERE id = ? AND ra_aluno = ?', [
      idNum,
      raNum,
    ]);
    return NextResponse.json({ success: true, message: 'Restrição desativada' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('inválido')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Erro ao desativar restrição:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
