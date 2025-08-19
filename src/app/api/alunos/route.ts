import {
  COOKIE_NAME,
  hasAnyRole,
  ROLE_ADMIN,
  ROLE_ATENDENTE,
  verifySessionToken,
} from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

async function getSession(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifySessionToken(token);
}

// GET /api/alunos?q= termo (RA exato ou parte do nome)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !hasAnyRole(session, [ROLE_ADMIN, ROLE_ATENDENTE])) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    if (!q) return NextResponse.json({ ok: true, alunos: [] });

    let alunos: any[] = [];
    if (/^\d+$/.test(q)) {
      alunos = await query<any[]>(
        'SELECT ra, nome, curso_nome, serie, turma FROM alunos WHERE ra = ? LIMIT 1',
        [q]
      );
    }
    if (alunos.length === 0) {
      const like = `%${q}%`;
      alunos = await query<any[]>(
        'SELECT ra, nome, curso_nome, serie, turma FROM alunos WHERE nome LIKE ? ORDER BY nome LIMIT 20',
        [like]
      );
    }

    const mapped = alunos.map((a) => ({
      ra: a.ra,
      nome: a.nome,
      curso: a.curso_nome,
      serie: a.serie,
      turma: a.turma,
      fotoUrl: `https://sistema.santanna.g12.br/carometr/${a.ra}.jpg`,
    }));

    return NextResponse.json({ ok: true, alunos: mapped });
  } catch (err) {
    console.error('GET /api/alunos error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
