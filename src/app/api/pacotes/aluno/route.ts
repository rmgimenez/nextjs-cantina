import { COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

async function auth(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifySessionToken(token);
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth(req);
    if (!session) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const ra = parseInt(searchParams.get('ra') || '');
    if (!ra) return NextResponse.json({ error: 'ra_required' }, { status: 400 });
    const pacotes = await query<any[]>(
      `SELECT pa.id, pa.aluno_ra, pa.data_inicio, pa.data_fim, pa.usos_totais, pa.usos_restantes, pa.status,
              pt.descricao, pt.codigo, pt.max_usos_dia
         FROM cant_pacote_aluno pa
         JOIN cant_pacote_tipo pt ON pt.id = pa.pacote_tipo_id
        WHERE pa.aluno_ra = ?
        ORDER BY pa.id DESC`,
      [ra]
    );
    const ids = pacotes.map((p) => p.id);
    const usosHoje: Record<number, number> = {};
    if (ids.length) {
      const rows = await query<any[]>(
        `SELECT pacote_aluno_id as id, COUNT(*) qt FROM cant_pacote_utilizacao WHERE DATE(data_utilizacao)=CURDATE() AND pacote_aluno_id IN (${ids
          .map(() => '?')
          .join(',')}) GROUP BY pacote_aluno_id`,
        ids
      );
      rows.forEach((r) => (usosHoje[r.id] = r.qt));
    }
    pacotes.forEach((p) => (p.usos_dia_hoje = usosHoje[p.id] || 0));
    return NextResponse.json({ ok: true, pacotes });
  } catch (e) {
    console.error('GET /api/pacotes/aluno', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
