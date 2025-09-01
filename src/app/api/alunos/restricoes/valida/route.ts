import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de validação de restrição para PDV.
 * Query params (GET) ou body (POST): { aluno_ra, produtoId }
 * Retorna { blocked: boolean, reasons: [{ type: 'PRODUTO'|'TIPO', id, motivo }] }
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const ra = Number(url.searchParams.get('aluno_ra')) || 0;
    const produtoId = Number(url.searchParams.get('produtoId')) || 0;
    if (!ra || !produtoId) return NextResponse.json({ error: 'missing_params' }, { status: 400 });

    // Checar restrição por produto
    const resProd: any[] = await query(
      'SELECT motivo FROM cant_aluno_restricao_produto WHERE aluno_ra=? AND produto_id=? AND ativo=1 LIMIT 1',
      [ra, produtoId]
    );
    if (resProd.length) {
      return NextResponse.json({
        blocked: true,
        reasons: [{ type: 'PRODUTO', id: produtoId, motivo: resProd[0].motivo || 'Restrição' }],
      });
    }

    // Checar tipo do produto
    const tipoRows: any[] = await query('SELECT tipo_id FROM cant_produtos WHERE id = ? LIMIT 1', [
      produtoId,
    ]);
    const tipoId = tipoRows.length ? tipoRows[0].tipo_id : null;
    if (tipoId) {
      const resTipo: any[] = await query(
        'SELECT motivo FROM cant_aluno_restricao_tipo WHERE aluno_ra=? AND tipo_produto_id=? AND ativo=1 LIMIT 1',
        [ra, tipoId]
      );
      if (resTipo.length) {
        return NextResponse.json({
          blocked: true,
          reasons: [{ type: 'TIPO', id: tipoId, motivo: resTipo[0].motivo || 'Restrição' }],
        });
      }
    }

    return NextResponse.json({ blocked: false, reasons: [] });
  } catch (err: any) {
    console.error('GET /api/alunos/restricoes/valida', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ra = Number(body.aluno_ra) || 0;
    const produtoId = Number(body.produtoId) || 0;
    if (!ra || !produtoId) return NextResponse.json({ error: 'missing_params' }, { status: 400 });
    // Reusar GET logic
    const q = new URL(req.url);
    return await GET(
      new NextRequest(`${q.origin}${q.pathname}?aluno_ra=${ra}&produtoId=${produtoId}`)
    );
  } catch (err: any) {
    console.error('POST /api/alunos/restricoes/valida', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
