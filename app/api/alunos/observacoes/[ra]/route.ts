import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import {
  ApiObservation,
  buildOrderClause,
  ensureAlunoExiste,
  mapObservation,
  parseDateOnly,
  PrioridadeObs,
  PRIORIDADES,
  RawObservation,
  TipoObs,
  TIPOS_OBS,
} from '../helpers';

export async function GET(req: Request, { params }: { params: Promise<{ ra: string }> }) {
  try {
    const { ra } = await params;
    const raNum = Number(ra);
    if (!ra || Number.isNaN(raNum)) {
      return NextResponse.json({ error: 'RA inválido' }, { status: 400 });
    }

    const url = new URL(req.url);
    const ativoParam = url.searchParams.get('ativo');
    const prioridade = url.searchParams.get('prioridade');

    const filtros: string[] = ['o.ra_aluno = ?'];
    const args: (number | string)[] = [raNum];

    if (ativoParam !== null) {
      filtros.push('o.ativo = ?');
      args.push(Number(ativoParam));
    }
    if (prioridade && PRIORIDADES.includes(prioridade as PrioridadeObs)) {
      filtros.push('o.prioridade = ?');
      args.push(prioridade);
    }

    const sql = `
      SELECT o.*, u.nome AS criado_por_nome
      FROM cant_observacoes_alunos o
      LEFT JOIN cant_usuarios_cantina u ON u.id = o.criado_por
      WHERE ${filtros.join(' AND ')}
      ${buildOrderClause()}
    `;

    const rows = (await query(sql, args)) as RawObservation[];
    const data: ApiObservation[] = rows.map(mapObservation);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const err = error as { message?: string } | undefined;
    if (err?.message === 'Aluno não encontrado') {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error('Erro ao listar observações do aluno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ ra: string }> }) {
  try {
    const { ra } = await params;
    const raNum = Number(ra);
    if (!ra || Number.isNaN(raNum)) {
      return NextResponse.json({ error: 'RA inválido' }, { status: 400 });
    }

    await ensureAlunoExiste(raNum);

    const body = await req.json();
    const tipo: TipoObs | undefined = body?.tipo_observacao;
    const observacao: string | undefined = body?.observacao;
    const prioridade: PrioridadeObs = PRIORIDADES.includes(body?.prioridade)
      ? (body.prioridade as PrioridadeObs)
      : 'MEDIA';
    const dtValidSql = parseDateOnly(body?.dt_validade);

    if (!tipo || !TIPOS_OBS.includes(tipo)) {
      return NextResponse.json({ error: 'tipo_observacao inválido' }, { status: 400 });
    }
    if (!observacao || !observacao.trim()) {
      return NextResponse.json({ error: 'Observação é obrigatória' }, { status: 400 });
    }

    await query(
      `INSERT INTO cant_observacoes_alunos
       (ra_aluno, tipo_observacao, observacao, prioridade, dt_validade, ativo, criado_por)
       VALUES (?, ?, ?, ?, ?, 1, 1)`.replace(/\s+/g, ' '),
      [raNum, tipo, observacao.trim(), prioridade, dtValidSql]
    );

    const rows = (await query(
      `SELECT o.*, u.nome AS criado_por_nome
       FROM cant_observacoes_alunos o
       LEFT JOIN cant_usuarios_cantina u ON u.id = o.criado_por
       WHERE o.id = LAST_INSERT_ID()`.replace(/\s+/g, ' ')
    )) as RawObservation[];

    const data = rows.length ? mapObservation(rows[0]) : null;
    return NextResponse.json(
      {
        success: true,
        message: 'Observação registrada com sucesso',
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    const err = error as { message?: string } | undefined;
    if (err?.message === 'Aluno não encontrado') {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err?.message?.startsWith('Data inválida')) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('Erro ao criar observação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
