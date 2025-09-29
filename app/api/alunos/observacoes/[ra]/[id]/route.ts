import { NextResponse } from 'next/server';
import { query } from '../../../../../../lib/db';
import {
  ApiObservation,
  mapObservation,
  parseDateOnly,
  PrioridadeObs,
  PRIORIDADES,
  RawObservation,
  TipoObs,
  TIPOS_OBS,
} from '../../helpers';

async function parseIds(params: Promise<{ ra: string; id: string }>) {
  const { ra, id } = await params;
  const raNum = Number(ra);
  const idNum = Number(id);
  if (!ra || Number.isNaN(raNum)) {
    throw new Error('RA inválido');
  }
  if (!id || Number.isNaN(idNum)) {
    throw new Error('ID inválido');
  }
  return { raNum, idNum };
}

async function ensureExiste(ra: number, id: number) {
  const rows = await query(
    'SELECT id FROM cant_observacoes_alunos WHERE id = ? AND ra_aluno = ? LIMIT 1',
    [id, ra]
  );
  if (!rows || rows.length === 0) {
    throw new Error('Observação não encontrada');
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ra: string; id: string }> }
) {
  try {
    const { raNum, idNum } = await parseIds(params);
    const rows = (await query(
      `SELECT o.*, u.nome AS criado_por_nome
       FROM cant_observacoes_alunos o
       LEFT JOIN cant_usuarios_cantina u ON u.id = o.criado_por
       WHERE o.id = ? AND o.ra_aluno = ?
       LIMIT 1`,
      [idNum, raNum]
    )) as RawObservation[];
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Observação não encontrada' }, { status: 404 });
    }
    const data: ApiObservation = mapObservation(rows[0]);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const err = error as { message?: string } | undefined;
    if (err?.message?.includes('inválido')) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('Erro ao buscar observação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ ra: string; id: string }> }
) {
  try {
    const { raNum, idNum } = await parseIds(params);
    const body = await req.json();

    await ensureExiste(raNum, idNum);

    const updates: string[] = [];
    const args: (string | number | null)[] = [];

    if (body?.tipo_observacao !== undefined) {
      const tipo = body.tipo_observacao as TipoObs;
      if (!TIPOS_OBS.includes(tipo)) {
        return NextResponse.json({ error: 'tipo_observacao inválido' }, { status: 400 });
      }
      updates.push('tipo_observacao = ?');
      args.push(tipo);
    }

    if (body?.observacao !== undefined) {
      const obs = String(body.observacao).trim();
      if (!obs) {
        return NextResponse.json({ error: 'Observação não pode ficar vazia' }, { status: 400 });
      }
      updates.push('observacao = ?');
      args.push(obs);
    }

    if (body?.prioridade !== undefined) {
      const prioridade = body.prioridade as PrioridadeObs;
      if (!PRIORIDADES.includes(prioridade)) {
        return NextResponse.json({ error: 'prioridade inválida' }, { status: 400 });
      }
      updates.push('prioridade = ?');
      args.push(prioridade);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'dt_validade')) {
      const dtValidSql = body.dt_validade ? parseDateOnly(body.dt_validade) : null;
      updates.push('dt_validade = ?');
      args.push(dtValidSql);
    }

    if (body?.ativo !== undefined) {
      updates.push('ativo = ?');
      args.push(body.ativo ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
    }

    args.push(idNum, raNum);

    await query(
      `UPDATE cant_observacoes_alunos
       SET ${updates.join(', ')}
       WHERE id = ? AND ra_aluno = ?`.replace(/\s+/g, ' '),
      args
    );

    const rows = (await query(
      `SELECT o.*, u.nome AS criado_por_nome
       FROM cant_observacoes_alunos o
       LEFT JOIN cant_usuarios_cantina u ON u.id = o.criado_por
       WHERE o.id = ?
       LIMIT 1`,
      [idNum]
    )) as RawObservation[];

    const data: ApiObservation = mapObservation(rows[0]);
    return NextResponse.json({ success: true, message: 'Observação atualizada', data });
  } catch (error) {
    const err = error as { message?: string } | undefined;
    if (err?.message?.includes('inválido')) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err?.message?.startsWith('Data inválida')) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err?.message === 'Observação não encontrada') {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error('Erro ao atualizar observação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ ra: string; id: string }> }
) {
  try {
    const { raNum, idNum } = await parseIds(params);
    await ensureExiste(raNum, idNum);

    await query('UPDATE cant_observacoes_alunos SET ativo = 0 WHERE id = ? AND ra_aluno = ?', [
      idNum,
      raNum,
    ]);

    return NextResponse.json({ success: true, message: 'Observação desativada' });
  } catch (error) {
    const err = error as { message?: string } | undefined;
    if (err?.message?.includes('inválido')) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err?.message === 'Observação não encontrada') {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error('Erro ao desativar observação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
