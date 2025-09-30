import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import { query } from '../../../../lib/db';

export async function GET(req: Request) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const url = new URL(req.url);
    const codigo = url.searchParams.get('codigo_funcionario');
    const mes = (url.searchParams.get('mes') || '').trim();
    const limitParam = url.searchParams.get('limit');

    if (!codigo) {
      return NextResponse.json({ error: 'Código do funcionário é obrigatório' }, { status: 400 });
    }
    const codigoNumero = Number(codigo);
    if (!Number.isFinite(codigoNumero) || codigoNumero <= 0) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
    }

    const limite = limitParam ? Number(limitParam) : undefined;
    const aplicarLimite = Number.isFinite(limite as number) && (limite as number) > 0;

    let sql = `
      SELECT vf.id, vf.id_venda, vf.valor_original, vf.valor_aplicado, vf.desconto_aplicado,
             vf.mes_referencia, vf.pago, vf.dt_lancamento, v.dt_venda, v.observacoes,
             u.nome AS usuario_nome
      FROM cant_vendas_funcionarios vf
      INNER JOIN cant_vendas v ON v.id = vf.id_venda
      LEFT JOIN cant_usuarios_cantina u ON u.id = v.usuario
      WHERE vf.codigo_funcionario = ?
    `;
    const params: (number | string)[] = [codigoNumero];

    if (mes) {
      sql += ` AND vf.mes_referencia = ?`;
      params.push(mes);
    }

    sql += ` ORDER BY v.dt_venda DESC`;
    if (aplicarLimite) {
      sql += ` LIMIT ?`;
      params.push(Number(limite));
    }

    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Erro ao listar consumo de funcionário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
