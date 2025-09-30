import { NextResponse } from 'next/server';
import { QueryRow, query } from '../../../../../lib/db';

type RestricaoAlunoRow = QueryRow<{
  id: number;
  ra_aluno: number;
  tipo_restricao: 'PRODUTO' | 'TIPO_PRODUTO';
  id_produto: number | null;
  id_tipo_produto: number | null;
  motivo: string | null;
  ativo: number;
  dt_criacao: string;
  produto_nome: string | null;
  tipo_produto_nome: string | null;
}>;

type IdRow = QueryRow<{ id: number; ativo?: number | null }>;

interface RestricaoPayload {
  tipo_restricao: 'PRODUTO' | 'TIPO_PRODUTO';
  id_produto?: number | null;
  id_tipo_produto?: number | null;
  motivo?: string | null;
}

// GET /api/alunos/restricoes/[ra]?ativo=1
// Lista restrições de consumo de um aluno (por RA)
export async function GET(req: Request, { params }: { params: Promise<{ ra: string }> }) {
  try {
    const { ra } = await params;
    if (!ra || isNaN(Number(ra))) {
      return NextResponse.json({ error: 'RA inválido' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const ativoParam = searchParams.get('ativo');
    const filtros: string[] = ['r.ra_aluno = ?'];
    const args: (number | string)[] = [Number(ra)];
    if (ativoParam !== null) {
      filtros.push('r.ativo = ?');
      args.push(Number(ativoParam));
    }

    const sql = `
      SELECT 
        r.id,
        r.ra_aluno,
        r.tipo_restricao,
        r.id_produto,
        r.id_tipo_produto,
        r.motivo,
        r.ativo,
        r.dt_criacao,
        p.nome AS produto_nome,
        tp.nome AS tipo_produto_nome
      FROM cant_restricoes_alunos r
      LEFT JOIN cant_produtos p ON r.id_produto = p.id
      LEFT JOIN cant_tipos_produtos tp ON r.id_tipo_produto = tp.id
      WHERE ${filtros.join(' AND ')}
      ORDER BY r.dt_criacao DESC, r.id DESC
    `;
    const rows = await query<RestricaoAlunoRow[]>(sql, args);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Erro ao listar restrições do aluno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/alunos/restricoes/[ra]
// Cria uma nova restrição para o RA informado
// Body: { tipo_restricao: 'PRODUTO' | 'TIPO_PRODUTO', id_produto?: number, id_tipo_produto?: number, motivo?: string }
export async function POST(req: Request, { params }: { params: Promise<{ ra: string }> }) {
  try {
    const { ra } = await params;
    if (!ra || isNaN(Number(ra))) {
      return NextResponse.json({ error: 'RA inválido' }, { status: 400 });
    }

    const body = (await req.json()) as RestricaoPayload | null;
    const { tipo_restricao, id_produto, id_tipo_produto, motivo } = body ?? {};

    if (!tipo_restricao || !['PRODUTO', 'TIPO_PRODUTO'].includes(tipo_restricao)) {
      return NextResponse.json({ error: 'tipo_restricao inválido' }, { status: 400 });
    }

    // Verificar existência do aluno na view 'alunos'
    const aluno = await query<QueryRow<{ ra: number; nome: string }>[]>(
      'SELECT ra, nome FROM alunos WHERE ra = ? LIMIT 1',
      [Number(ra)]
    );
    if (!aluno || aluno.length === 0) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
    }

    if (tipo_restricao === 'PRODUTO') {
      if (!id_produto || isNaN(Number(id_produto))) {
        return NextResponse.json(
          { error: 'id_produto é obrigatório para restrição por PRODUTO' },
          { status: 400 }
        );
      }
      const prod = await query<IdRow[]>('SELECT id FROM cant_produtos WHERE id = ? AND ativo = 1', [
        Number(id_produto),
      ]);
      if (!prod || prod.length === 0) {
        return NextResponse.json({ error: 'Produto inválido/inativo' }, { status: 400 });
      }

      // Verificar duplicidade
      const dup = await query<IdRow[]>(
        `SELECT id, ativo FROM cant_restricoes_alunos 
         WHERE ra_aluno = ? AND tipo_restricao = 'PRODUTO' AND id_produto = ?
         LIMIT 1`,
        [Number(ra), Number(id_produto)]
      );
      if (dup && dup.length > 0) {
        const existente = dup[0];
        if (Number(existente.ativo) === 1) {
          return NextResponse.json(
            { error: 'Restrição por produto já existente' },
            { status: 400 }
          );
        }
        await query('UPDATE cant_restricoes_alunos SET ativo = 1, motivo = ? WHERE id = ?', [
          motivo?.trim() || null,
          existente.id,
        ]);
        const updated = await query<RestricaoAlunoRow[]>(
          `SELECT r.*, p.nome AS produto_nome, tp.nome AS tipo_produto_nome
           FROM cant_restricoes_alunos r
           LEFT JOIN cant_produtos p ON r.id_produto = p.id
           LEFT JOIN cant_tipos_produtos tp ON r.id_tipo_produto = tp.id
           WHERE r.id = ?`,
          [existente.id]
        );
        return NextResponse.json({
          success: true,
          message: 'Restrição reativada',
          data: updated[0],
        });
      }

      await query(
        `INSERT INTO cant_restricoes_alunos 
         (ra_aluno, tipo_restricao, id_produto, id_tipo_produto, motivo, ativo, criado_por)
         VALUES (?, 'PRODUTO', ?, NULL, ?, 1, 1)`,
        [Number(ra), Number(id_produto), motivo?.trim() || null]
      );
    } else {
      // TIPO_PRODUTO
      if (!id_tipo_produto || isNaN(Number(id_tipo_produto))) {
        return NextResponse.json(
          { error: 'id_tipo_produto é obrigatório para restrição por TIPO_PRODUTO' },
          { status: 400 }
        );
      }
      const tipo = await query<IdRow[]>(
        'SELECT id FROM cant_tipos_produtos WHERE id = ? AND ativo = 1',
        [Number(id_tipo_produto)]
      );
      if (!tipo || tipo.length === 0) {
        return NextResponse.json({ error: 'Tipo de produto inválido/inativo' }, { status: 400 });
      }

      const dup = await query<IdRow[]>(
        `SELECT id, ativo FROM cant_restricoes_alunos 
         WHERE ra_aluno = ? AND tipo_restricao = 'TIPO_PRODUTO' AND id_tipo_produto = ?
         LIMIT 1`,
        [Number(ra), Number(id_tipo_produto)]
      );
      if (dup && dup.length > 0) {
        const existente = dup[0];
        if (Number(existente.ativo) === 1) {
          return NextResponse.json(
            { error: 'Restrição por tipo de produto já existente' },
            { status: 400 }
          );
        }
        await query('UPDATE cant_restricoes_alunos SET ativo = 1, motivo = ? WHERE id = ?', [
          motivo?.trim() || null,
          existente.id,
        ]);
        const updated = await query<RestricaoAlunoRow[]>(
          `SELECT r.*, p.nome AS produto_nome, tp.nome AS tipo_produto_nome
           FROM cant_restricoes_alunos r
           LEFT JOIN cant_produtos p ON r.id_produto = p.id
           LEFT JOIN cant_tipos_produtos tp ON r.id_tipo_produto = tp.id
           WHERE r.id = ?`,
          [existente.id]
        );
        return NextResponse.json({
          success: true,
          message: 'Restrição reativada',
          data: updated[0],
        });
      }

      await query(
        `INSERT INTO cant_restricoes_alunos 
         (ra_aluno, tipo_restricao, id_produto, id_tipo_produto, motivo, ativo, criado_por)
         VALUES (?, 'TIPO_PRODUTO', NULL, ?, ?, 1, 1)`,
        [Number(ra), Number(id_tipo_produto), motivo?.trim() || null]
      );
    }

    const novo = await query<RestricaoAlunoRow[]>(
      `SELECT r.*, p.nome AS produto_nome, tp.nome AS tipo_produto_nome
       FROM cant_restricoes_alunos r
       LEFT JOIN cant_produtos p ON r.id_produto = p.id
       LEFT JOIN cant_tipos_produtos tp ON r.id_tipo_produto = tp.id
       WHERE r.id = LAST_INSERT_ID()`
    );
    return NextResponse.json(
      { success: true, message: 'Restrição criada com sucesso', data: novo[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar restrição do aluno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
