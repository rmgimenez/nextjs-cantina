import { COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

async function ensureAuth(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return (await verifySessionToken(token)) as any;
  } catch {
    return null;
  }
}

// GET /api/relatorios/alunos/historico?alunoRa=123&inicio=YYYY-MM-DD&fim=YYYY-MM-DD&produtoId=1
export async function GET(req: NextRequest) {
  const user = await ensureAuth(req);
  if (!user) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const { searchParams } = new URL(req.url);
    const alunoRa = searchParams.get('alunoRa');
    if (!alunoRa) return NextResponse.json({ error: 'missing_alunoRa' }, { status: 400 });
    const inicio = searchParams.get('inicio');
    const fim = searchParams.get('fim');
    const produtoId = searchParams.get('produtoId');
    const defaultInicio = new Date();
    defaultInicio.setDate(defaultInicio.getDate() - 30);
    const inicioParam = inicio || defaultInicio.toISOString().slice(0, 10);
    const fimParam = fim || new Date().toISOString().slice(0, 10);
    const params: any[] = [alunoRa, inicioParam + ' 00:00:00', fimParam + ' 23:59:59'];
    let filtroProduto = '';
    if (produtoId) {
      filtroProduto = ' AND vi.produto_id = ?';
      params.push(produtoId);
    }
    // Vendas (detalhes por venda, inclui forma de pagamento)
    const vendas = await query<any>(
      `SELECT v.id, v.created_at, v.valor_liquido, v.forma_pagamento,
              SUM(vi.quantidade) AS itens,
              GROUP_CONCAT(CONCAT(p.nome,' (',vi.quantidade,')') ORDER BY p.nome SEPARATOR ', ') AS produtos
         FROM cant_venda v
         JOIN cant_venda_item vi ON vi.venda_id = v.id
         JOIN cant_produtos p ON p.id = vi.produto_id
        WHERE v.tipo_comprador='ALUNO' AND v.comprador_aluno_ra=?
          AND v.created_at BETWEEN ? AND ? ${filtroProduto}
        GROUP BY v.id
        ORDER BY v.created_at DESC
        LIMIT 1000`,
      params
    );

    // Total geral no período
    const total = vendas.reduce((acc: number, v: any) => acc + Number(v.valor_liquido || 0), 0);

    // Totais por forma de pagamento
    const totaisPorForma = await query<any>(
      `SELECT v.forma_pagamento, COALESCE(SUM(v.valor_liquido),0) AS total
         FROM cant_venda v
        WHERE v.tipo_comprador='ALUNO' AND v.comprador_aluno_ra=?
          AND v.created_at BETWEEN ? AND ?
        GROUP BY v.forma_pagamento`,
      [alunoRa, inicioParam + ' 00:00:00', fimParam + ' 23:59:59']
    );

    // Produtos agregados no período (quantidade / valor)
    const produtosAgregados = await query<any>(
      `SELECT p.id AS produto_id, p.nome, COALESCE(SUM(vi.quantidade),0) AS quantidade_total,
              COALESCE(SUM(vi.valor_total),0) AS valor_total
         FROM cant_venda_item vi
         JOIN cant_venda v ON v.id = vi.venda_id
         JOIN cant_produtos p ON p.id = vi.produto_id
        WHERE v.tipo_comprador='ALUNO' AND v.comprador_aluno_ra=?
          AND v.created_at BETWEEN ? AND ?
        GROUP BY p.id, p.nome
        ORDER BY quantidade_total DESC`,
      [alunoRa, inicioParam + ' 00:00:00', fimParam + ' 23:59:59']
    );

    // Saldo atual do aluno (view cant_view_aluno_saldo)
    const saldoRows = await query<any>(
      `SELECT saldo_atual FROM cant_view_aluno_saldo WHERE aluno_ra = ? LIMIT 1`,
      [alunoRa]
    );
    const saldoAtual = saldoRows && saldoRows.length ? Number(saldoRows[0].saldo_atual || 0) : 0;

    return NextResponse.json({
      ok: true,
      alunoRa,
      periodo: { inicio: inicioParam, fim: fimParam },
      total,
      vendas,
      produtos: produtosAgregados,
      totaisPorForma: totaisPorForma,
      saldoAtual,
    });
  } catch (err) {
    console.error('GET /api/relatorios/alunos/historico error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
