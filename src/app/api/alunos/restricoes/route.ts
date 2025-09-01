import { COOKIE_NAME, hasAnyRole, ROLE_ADMIN, ROLE_ATENDENTE } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

async function getSession(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return (await import('@/lib/auth')).verifySessionToken(token);
}

// GET ?ra=123 - retorna restrições do aluno unificadas (produto + tipo)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !hasAnyRole(session, [ROLE_ADMIN, ROLE_ATENDENTE]))
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const url = new URL(req.url);
    const ra = url.searchParams.get('ra');
    if (!ra) return NextResponse.json({ restricoes: [] });

    // Buscar restrições por produto
    const prodRows: any[] = await query(
      `SELECT arp.id, arp.aluno_ra, 'PRODUTO' as tipo, arp.produto_id as referencia, arp.motivo, arp.ativo, p.nome as referencia_text
       FROM cant_aluno_restricao_produto arp
       LEFT JOIN cant_produtos p ON p.id = arp.produto_id
       WHERE arp.aluno_ra = ? ORDER BY arp.created_at DESC`,
      [ra]
    );

    // Buscar restrições por tipo
    const tipoRows: any[] = await query(
      `SELECT art.id, art.aluno_ra, 'TIPO' as tipo, art.tipo_produto_id as referencia, art.motivo, art.ativo, t.descricao as referencia_text
       FROM cant_aluno_restricao_tipo art
       LEFT JOIN cant_produto_tipo t ON t.id = art.tipo_produto_id
       WHERE art.aluno_ra = ? ORDER BY art.created_at DESC`,
      [ra]
    );

    // mapear para formato esperado pela UI
    const restricoes = [...prodRows, ...tipoRows].map((r) => ({
      id: r.id,
      aluno_ra: String(r.aluno_ra),
      tipo: r.tipo,
      referencia: r.referencia ? String(r.referencia) : null,
      referencia_text: r.referencia_text || null,
      motivo: r.motivo || '',
      ativo: r.ativo ? 1 : 0,
    }));

    return NextResponse.json({ restricoes });
  } catch (err: any) {
    console.error('GET /api/alunos/restricoes', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// POST - cria ou reativa uma restrição (produto ou tipo)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !hasAnyRole(session, [ROLE_ADMIN, ROLE_ATENDENTE]))
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const body = await req.json().catch(() => null);
    if (!body || !body.aluno_ra || !body.tipo)
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

    const ra = Number(body.aluno_ra);
    const motivo = body.motivo || null;
    if (body.tipo === 'PRODUTO') {
      const produtoId = Number(body.referencia) || 0;
      if (!produtoId) return NextResponse.json({ error: 'missing_produto' }, { status: 400 });
      // INSERT ... ON DUPLICATE KEY UPDATE -> reativa e atualiza motivo
      const sql = `INSERT INTO cant_aluno_restricao_produto (aluno_ra, produto_id, motivo, ativo) VALUES (?, ?, ?, 1)
                   ON DUPLICATE KEY UPDATE motivo = VALUES(motivo), ativo = 1`;
      await query(sql, [ra, produtoId, motivo]);
      return NextResponse.json({ ok: true });
    }

    if (body.tipo === 'TIPO') {
      const tipoId = Number(body.referencia) || 0;
      if (!tipoId) return NextResponse.json({ error: 'missing_tipo' }, { status: 400 });
      const sql = `INSERT INTO cant_aluno_restricao_tipo (aluno_ra, tipo_produto_id, motivo, ativo) VALUES (?, ?, ?, 1)
                   ON DUPLICATE KEY UPDATE motivo = VALUES(motivo), ativo = 1`;
      await query(sql, [ra, tipoId, motivo]);
      return NextResponse.json({ ok: true });
    }

    if (body.tipo === 'GERAL') {
      // Implementação opcional: armazenar em cant_aluno_observacao como observação inativa? Por ora, retornar erro
      return NextResponse.json({ error: 'tipo_geral_not_supported' }, { status: 400 });
    }

    return NextResponse.json({ error: 'invalid_type' }, { status: 400 });
  } catch (err: any) {
    console.error('POST /api/alunos/restricoes', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// PUT - atualiza motivo/ativo para uma restrição existente
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !hasAnyRole(session, [ROLE_ADMIN, ROLE_ATENDENTE]))
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const body = await req.json().catch(() => null);
    if (!body || !body.id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });
    const id = Number(body.id);
    const motivo = body.motivo ?? null;
    const ativo =
      typeof body.ativo === 'number' ? (body.ativo ? 1 : 0) : body.ativo === false ? 0 : 1;

    // tentar atualizar em produto
    const updProd: any = await query(
      'UPDATE cant_aluno_restricao_produto SET motivo = COALESCE(?, motivo), ativo = ? WHERE id = ?',
      [motivo, ativo, id]
    );
    // verificar mudanças (mysql2 retorna result object, não rows)
    // caso não tenha atualizado, tentar na tabela de tipo
    // Nota: query retorna OkPacket; para simplicidade, sempre executar update tipo também
    await query(
      'UPDATE cant_aluno_restricao_tipo SET motivo = COALESCE(?, motivo), ativo = ? WHERE id = ?',
      [motivo, ativo, id]
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('PUT /api/alunos/restricoes', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// DELETE ?id=123 - marca inativo na tabela correspondente
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session || !hasAnyRole(session, [ROLE_ADMIN, ROLE_ATENDENTE]))
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const url = new URL(req.url);
    const id = Number(url.searchParams.get('id')) || 0;
    if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });

    await query('UPDATE cant_aluno_restricao_produto SET ativo = 0 WHERE id = ?', [id]);
    await query('UPDATE cant_aluno_restricao_tipo SET ativo = 0 WHERE id = ?', [id]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('DELETE /api/alunos/restricoes', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
