import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

// GET /api/estoque - lista estoque com produto e tipo
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    let sql = `
      SELECT e.*, p.nome AS produto_nome, p.id_tipo, tp.nome AS tipo_nome
      FROM cant_estoque e
      INNER JOIN cant_produtos p ON e.id_produto = p.id
      INNER JOIN cant_tipos_produtos tp ON p.id_tipo = tp.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];
    if (search) {
      sql += ` AND (p.nome LIKE ? OR tp.nome LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY p.nome ASC`;
    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Erro ao listar estoque:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
