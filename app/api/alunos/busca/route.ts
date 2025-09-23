import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

// GET /api/alunos/busca?q=termo&limit=20
// Busca alunos por RA (exato/prefixo) ou por qualquer parte do nome
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const limitParam = Number(searchParams.get('limit') || '20');
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100 ? limitParam : 20;

    if (!q) {
      return NextResponse.json({ success: true, data: [] });
    }

    const isNumeric = /^\d+$/.test(q);

    // Escape % e _ para LIKE
    const likeTerm = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    const likeRa = `${q}%`;

    let rows;
    if (isNumeric) {
      rows = await query(
        `SELECT a.ra, a.nome, a.turma, a.serie, a.curso_nome
         FROM alunos a
         WHERE a.ra = ? OR CAST(a.ra AS CHAR) LIKE ?
         ORDER BY a.ra = ? DESC, a.ra ASC
         LIMIT ?`,
        [Number(q), likeRa, Number(q), limit]
      );
    } else {
      rows = await query(
        `SELECT a.ra, a.nome, a.turma, a.serie, a.curso_nome
         FROM alunos a
         WHERE a.nome LIKE ?
         ORDER BY a.nome ASC
         LIMIT ?`,
        [likeTerm, limit]
      );
    }

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Erro na busca de alunos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
