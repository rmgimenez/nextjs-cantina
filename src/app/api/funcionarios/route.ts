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

// GET /api/funcionarios?q= termo (código ou parte do nome/cargo)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !hasAnyRole(session, [ROLE_ADMIN, ROLE_ATENDENTE])) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    if (!q) return NextResponse.json({ ok: true, funcionarios: [] });

    let funcionarios: any[] = [];
    if (/^\d+$/.test(q)) {
      funcionarios = await query<any[]>(
        'SELECT f.codigo, f.nome, f.cargo, pc.valor_refeicao FROM funcionarios f LEFT JOIN cant_preco_cargo pc ON pc.cargo = f.cargo AND pc.ativo=1 WHERE f.codigo = ? LIMIT 1',
        [q]
      );
    }
    if (funcionarios.length === 0) {
      const like = `%${q}%`;
      funcionarios = await query<any[]>(
        'SELECT f.codigo, f.nome, f.cargo, pc.valor_refeicao FROM funcionarios f LEFT JOIN cant_preco_cargo pc ON pc.cargo = f.cargo AND pc.ativo=1 WHERE (f.nome LIKE ? OR f.cargo LIKE ?) AND (f.inativo IS NULL OR f.inativo=0) ORDER BY f.nome LIMIT 20',
        [like, like]
      );
    }

    const mapped = funcionarios.map((f) => ({
      id: f.codigo,
      nome: f.nome,
      cargo: f.cargo,
      valorRefeicao: f.valor_refeicao ?? null,
    }));
    return NextResponse.json({ ok: true, funcionarios: mapped });
  } catch (err) {
    console.error('GET /api/funcionarios error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
