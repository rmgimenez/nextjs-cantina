import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// Retorna série temporal (últimos 14 dias) de vendas para exibição em gráfico no dashboard
export async function GET() {
  try {
    let diarios: any[] = [];
    try {
      diarios = (await query(
        `SELECT DATE(created_at) AS data,
                COUNT(*) AS vendas,
                COALESCE(SUM(valor_liquido),0) AS total
           FROM cant_venda
          WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
          GROUP BY DATE(created_at)
          ORDER BY DATE(created_at)`
      )) as any[];
    } catch (e) {
      diarios = [];
    }

    // Garantir preenchimento de dias sem venda para linha contínua
    const map: Record<string, { data: string; vendas: number; total: number }> = {};
    diarios.forEach((d) => {
      map[d.data] = { data: d.data, vendas: Number(d.vendas) || 0, total: Number(d.total) || 0 };
    });
    const filled: { data: string; vendas: number; total: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0, 10);
      filled.push(map[key] || { data: key, vendas: 0, total: 0 });
    }

    const sumario = filled.reduce(
      (acc, d) => {
        acc.vendas += d.vendas;
        acc.total += d.total;
        return acc;
      },
      { vendas: 0, total: 0 }
    );

    return NextResponse.json({ ok: true, dias: filled, sumario });
  } catch (error) {
    console.error('Erro /api/dashboard/trend', error);
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 });
  }
}
