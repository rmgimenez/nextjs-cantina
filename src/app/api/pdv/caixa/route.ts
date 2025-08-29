import { COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

async function ensureAuth(req: NextRequest) {
  const token =
    req.cookies.get(COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifySessionToken(token);
  return payload as any;
}

export async function GET(req: NextRequest) {
  try {
    const user = await ensureAuth(req);
    if (!user || !['ADMIN', 'ATENDENTE'].includes(user.tipo)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    // Buscar status do caixa atual
    const caixaAtual = await query(`
      SELECT 
        c.*,
        ua.nome as usuario_abertura_nome,
        uf.nome as usuario_fechamento_nome,
        COALESCE(SUM(CASE WHEN cm.tipo = 'VENDA' THEN cm.valor ELSE 0 END), 0) as total_vendas,
        COALESCE(SUM(CASE WHEN cm.tipo = 'SANGRIA' THEN cm.valor ELSE 0 END), 0) as total_sangrias,
        COALESCE(SUM(CASE WHEN cm.tipo = 'REFORCO' THEN cm.valor ELSE 0 END), 0) as total_reforcos
      FROM cant_caixa c
      LEFT JOIN cant_usuarios ua ON ua.id = c.usuario_abertura_id
      LEFT JOIN cant_usuarios uf ON uf.id = c.usuario_fechamento_id
      LEFT JOIN cant_caixa_mov cm ON cm.caixa_id = c.id
      WHERE c.status = 'ABERTO'
      GROUP BY c.id
      ORDER BY c.data_abertura DESC
      LIMIT 1
    `);

    if (caixaAtual.length === 0) {
      return NextResponse.json({
        ok: true,
        caixaAberto: false,
        caixa: null,
      });
    }

    const caixa = caixaAtual[0];
    const valorCalculado =
      parseFloat(caixa.valor_inicial) +
      parseFloat(caixa.total_vendas) +
      parseFloat(caixa.total_reforcos) -
      parseFloat(caixa.total_sangrias);

    return NextResponse.json({
      ok: true,
      caixaAberto: true,
      caixa: {
        id: caixa.id,
        dataAbertura: caixa.data_abertura,
        valorInicial: parseFloat(caixa.valor_inicial),
        totalVendas: parseFloat(caixa.total_vendas),
        totalSangrias: parseFloat(caixa.total_sangrias),
        totalReforcos: parseFloat(caixa.total_reforcos),
        valorCalculado,
        usuarioAbertura: caixa.usuario_abertura_nome,
      },
    });
  } catch (error) {
    console.error('GET /api/pdv/caixa', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await ensureAuth(req);
    if (!user || !['ADMIN', 'ATENDENTE'].includes(user.tipo)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const { acao, valorInicial, valorFechamento } = await req.json();

    if (acao === 'abrir') {
      // Verificar se já existe caixa aberto
      const caixaAberto = await query('SELECT id FROM cant_caixa WHERE status = "ABERTO"');

      if (caixaAberto.length > 0) {
        return NextResponse.json({ error: 'Já existe um caixa aberto' }, { status: 400 });
      }

      if (valorInicial < 0) {
        return NextResponse.json({ error: 'Valor inicial não pode ser negativo' }, { status: 400 });
      }

      // Abrir novo caixa
      const result = await query(
        `
        INSERT INTO cant_caixa (usuario_abertura_id, valor_inicial, status)
        VALUES (?, ?, 'ABERTO')
      `,
        [user.id, valorInicial || 0]
      );

      return NextResponse.json({
        ok: true,
        caixaId: result.insertId,
        message: 'Caixa aberto com sucesso!',
      });
    } else if (acao === 'fechar') {
      // Buscar caixa aberto
      const caixaAberto = await query(`
        SELECT 
          c.*,
          COALESCE(SUM(CASE WHEN cm.tipo = 'VENDA' THEN cm.valor ELSE 0 END), 0) as total_vendas,
          COALESCE(SUM(CASE WHEN cm.tipo = 'SANGRIA' THEN cm.valor ELSE 0 END), 0) as total_sangrias,
          COALESCE(SUM(CASE WHEN cm.tipo = 'REFORCO' THEN cm.valor ELSE 0 END), 0) as total_reforcos
        FROM cant_caixa c
        LEFT JOIN cant_caixa_mov cm ON cm.caixa_id = c.id
        WHERE c.status = 'ABERTO'
        GROUP BY c.id
      `);

      if (caixaAberto.length === 0) {
        return NextResponse.json({ error: 'Não há caixa aberto para fechar' }, { status: 400 });
      }

      const caixa = caixaAberto[0];
      const valorCalculado =
        parseFloat(caixa.valor_inicial) +
        parseFloat(caixa.total_vendas) +
        parseFloat(caixa.total_reforcos) -
        parseFloat(caixa.total_sangrias);

      const diferenca = parseFloat(valorFechamento) - valorCalculado;

      // Fechar caixa
      await query(
        `
        UPDATE cant_caixa 
        SET 
          status = 'FECHADO',
          data_fechamento = NOW(),
          usuario_fechamento_id = ?,
          valor_fechamento_informado = ?,
          valor_fechamento_calculado = ?,
          diferenca = ?
        WHERE id = ?
      `,
        [user.id, valorFechamento, valorCalculado, diferenca, caixa.id]
      );

      return NextResponse.json({
        ok: true,
        valorCalculado,
        valorInformado: parseFloat(valorFechamento),
        diferenca,
        message: 'Caixa fechado com sucesso!',
      });
    } else {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error) {
    console.error('POST /api/pdv/caixa', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
