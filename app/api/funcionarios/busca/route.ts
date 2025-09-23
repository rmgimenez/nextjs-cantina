import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

// GET /api/funcionarios/busca?q=termo&limit=20
// Busca funcionários por código (exato/prefixo) ou por parte do nome
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
    const likeTerm = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    const likeCod = `${q}%`;

    let rows;
    if (isNumeric) {
      rows = await query(
        `SELECT f.codigo, f.nome, f.cargo
         FROM funcionarios f
         WHERE f.codigo = ? OR CAST(f.codigo AS CHAR) LIKE ?
         ORDER BY f.codigo = ? DESC, f.codigo ASC
         LIMIT ?`,
        [Number(q), likeCod, Number(q), limit]
      );
    } else {
      rows = await query(
        `SELECT f.codigo, f.nome, f.cargo
         FROM funcionarios f
         WHERE f.nome LIKE ?
         ORDER BY f.nome ASC
         LIMIT ?`,
        [likeTerm, limit]
      );
    }

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Erro na busca de funcionários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
