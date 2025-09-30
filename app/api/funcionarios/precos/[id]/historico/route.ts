import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../../lib/auth';
import { query } from '../../../../../../lib/db';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const params = await context.params;
    const id = Number(params?.id);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 });
    }

    const rows = await query(
      `SELECT h.id, h.cargo, h.id_produto, h.preco_anterior, h.preco_novo, h.dt_alteracao, h.usuario,
              u.nome AS usuario_nome
       FROM cant_precos_por_cargo_historico h
       LEFT JOIN cant_usuarios_cantina u ON u.id = h.usuario
       WHERE h.id_preco_cargo = ?
       ORDER BY h.dt_alteracao DESC`,
      [id]
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Erro ao consultar histórico de preços por cargo:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
