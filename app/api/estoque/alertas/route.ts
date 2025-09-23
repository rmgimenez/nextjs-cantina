import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

// GET /api/estoque/alertas - lista produtos com status BAIXO/CRITICO
export async function GET() {
  try {
    const rows = await query(
      `SELECT * FROM vw_cant_estoque_alertas WHERE produto_ativo = 1 AND status_estoque IN ('BAIXO','CRITICO')`
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Erro ao buscar alertas de estoque:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
