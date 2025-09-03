import { COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

async function ensureAuth(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const payload = await verifySessionToken(token);
    return payload as any;
  } catch {
    return null;
  }
}

// GET /api/relatorios/funcionarios/consumo?inicio=YYYY-MM-DD&fim=YYYY-MM-DD&funcionarioId=123
// Observação: este relatório retorna apenas vendas feitas por funcionários da escola
// que foram marcadas na conta do funcionário (forma_pagamento = 'CONTA_FUNCIONARIO').
export async function GET(req: NextRequest) {
  const user = await ensureAuth(req);
  if (!user || user.tipo !== 'ADMIN')
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const { searchParams } = new URL(req.url);
    const inicio = searchParams.get('inicio');
    const fim = searchParams.get('fim');
    const funcionarioId = searchParams.get('funcionarioId');

    // Período padrão últimos 30 dias
    const defaultInicio = new Date();
    defaultInicio.setDate(defaultInicio.getDate() - 30);
    const inicioParam = inicio || defaultInicio.toISOString().slice(0, 10);
    const fimParam = fim || new Date().toISOString().slice(0, 10);

    const params: any[] = [inicioParam + ' 00:00:00', fimParam + ' 23:59:59'];
    let filtroFuncionario = '';
    if (funcionarioId) {
      filtroFuncionario = ' AND v.comprador_funcionario_id = ?';
      params.push(funcionarioId);
    }

    const detalhes = await query<any>(
      `SELECT v.id, v.created_at, f.codigo AS funcionario_id, f.nome AS funcionario_nome,
              v.forma_pagamento, v.valor_liquido AS valor_venda,
              COALESCE(SUM(vi.quantidade),0) AS itens,
              GROUP_CONCAT(CONCAT(p.nome,' (',vi.quantidade,')') ORDER BY p.nome SEPARATOR ', ') AS produtos
         FROM cant_venda v
         JOIN funcionarios f ON f.codigo = v.comprador_funcionario_id
         LEFT JOIN cant_venda_item vi ON vi.venda_id = v.id
         LEFT JOIN cant_produtos p ON p.id = vi.produto_id
        WHERE v.tipo_comprador='FUNCIONARIO_ESCOLA'
          AND v.forma_pagamento = 'CONTA_FUNCIONARIO'
          AND v.created_at BETWEEN ? AND ? ${filtroFuncionario}
        GROUP BY v.id, v.created_at, f.codigo, f.nome, v.forma_pagamento, v.valor_liquido
        ORDER BY v.created_at DESC
        LIMIT 1000`,
      params
    );

    const agregados = await query<any>(
      `SELECT f.codigo AS funcionario_id, f.nome AS funcionario_nome,
              COUNT(v.id) AS qtde_vendas, SUM(v.valor_liquido) AS total
         FROM cant_venda v
         JOIN funcionarios f ON f.codigo = v.comprador_funcionario_id
        WHERE v.tipo_comprador='FUNCIONARIO_ESCOLA'
          AND v.forma_pagamento = 'CONTA_FUNCIONARIO'
          AND v.created_at BETWEEN ? AND ? ${filtroFuncionario}
        GROUP BY f.codigo, f.nome
        ORDER BY total DESC`,
      params
    );

    const totalPeriodo = agregados.reduce((acc: number, r: any) => acc + Number(r.total || 0), 0);

    return NextResponse.json({
      ok: true,
      periodo: { inicio: inicioParam, fim: fimParam },
      totalPeriodo,
      agregados,
      detalhes,
    });
  } catch (err) {
    console.error('GET /api/relatorios/funcionarios/consumo error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
