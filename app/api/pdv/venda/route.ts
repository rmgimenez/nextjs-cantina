import { NextResponse } from 'next/server';
import pool, { query } from '../../../../lib/db';
import { COOKIE_NAME, verifyToken } from '../../../../lib/jwt';

type ItemVenda = {
  id_produto: number;
  quantidade: number; // para por_quilo, usar quantidade = 1 e informar peso
  peso?: number | null;
  preco_unitario?: number | null; // opcional; se não vier, usar do produto
};

async function getUserFromRequest(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(COOKIE_NAME + '='));
  if (!match) return null;
  const token = match.split('=')[1];
  return verifyToken(token);
}

export async function POST(req: Request) {
  const conn = await pool.getConnection();
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const body = await req.json();
    const { tipo_cliente, ra_aluno, codigo_funcionario, forma_pagamento, itens, observacoes } =
      body || {};

    if (!tipo_cliente || !['ALUNO', 'FUNCIONARIO', 'GERAL'].includes(tipo_cliente)) {
      return NextResponse.json({ error: 'Tipo de cliente inválido' }, { status: 400 });
    }
    if (!Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json({ error: 'Itens da venda são obrigatórios' }, { status: 400 });
    }

    // Verificar caixa aberto
    type CaixaRow = { id: number };
    const aberto = (await query(
      `SELECT id FROM cant_caixa WHERE status = 'ABERTO' ORDER BY dt_abertura DESC LIMIT 1`
    )) as CaixaRow[];
    if (!aberto || aberto.length === 0) {
      return NextResponse.json(
        { error: 'Caixa fechado. Abra o caixa para vender.' },
        { status: 400 }
      );
    }
    const idCaixa = aberto[0].id;

    // Validar cliente/base
    if (tipo_cliente === 'ALUNO') {
      if (!ra_aluno || isNaN(Number(ra_aluno))) {
        return NextResponse.json({ error: 'RA do aluno inválido' }, { status: 400 });
      }
      const aluno = await query(`SELECT ra FROM alunos WHERE ra = ? LIMIT 1`, [Number(ra_aluno)]);
      if (!aluno || aluno.length === 0) {
        return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 });
      }
    } else if (tipo_cliente === 'FUNCIONARIO') {
      if (!codigo_funcionario || isNaN(Number(codigo_funcionario))) {
        return NextResponse.json({ error: 'Funcionário inválido' }, { status: 400 });
      }
      const f = await query(`SELECT codigo FROM funcionarios WHERE codigo = ? LIMIT 1`, [
        Number(codigo_funcionario),
      ]);
      if (!f || f.length === 0) {
        return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
      }
    } else {
      // GERAL: não precisa validar cliente
    }

    // Carregar produtos e validar disponibilidade/estoque
    const ids = itens.map((i: ItemVenda) => Number(i.id_produto));
    type ProdRow = {
      id: number;
      nome: string;
      preco_venda: number;
      por_quilo: number;
      quantidade_atual: number;
    };
    const prods = (await query(
      `SELECT p.id, p.nome, p.preco_venda, p.por_quilo, e.quantidade_atual
       FROM cant_produtos p
       INNER JOIN cant_estoque e ON e.id_produto = p.id
       WHERE p.id IN (${ids.map(() => '?').join(',')}) AND p.ativo = 1`,
      ids
    )) as ProdRow[];
    if (!prods || prods.length !== ids.length) {
      return NextResponse.json({ error: 'Produto inválido/inativo' }, { status: 400 });
    }

    // Mapear prods
    const mapProd = new Map<number, ProdRow>();
    for (const p of prods) mapProd.set(p.id, p);

    // Cálculo do total e checagem de estoque
    let total = 0;
    for (const it of itens as ItemVenda[]) {
      const p = mapProd.get(Number(it.id_produto));
      if (!p) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 400 });
      const qtd = Number(it.quantidade);
      const peso = it.peso != null ? Number(it.peso) : null;
      if (isNaN(qtd) || qtd <= 0)
        return NextResponse.json({ error: 'Quantidade inválida' }, { status: 400 });
      const preco = it.preco_unitario != null ? Number(it.preco_unitario) : Number(p.preco_venda);
      if (p.por_quilo) {
        if (peso == null || isNaN(peso) || peso <= 0) {
          return NextResponse.json(
            { error: 'Peso inválido para produto por quilo' },
            { status: 400 }
          );
        }
        total += preco * peso;
        // estoque por unidade de item vendido (não controlamos por peso)
        if (Number(p.quantidade_atual) < qtd) {
          return NextResponse.json({ error: `Sem estoque para ${p.nome}` }, { status: 400 });
        }
      } else {
        total += preco * qtd;
        if (Number(p.quantidade_atual) < qtd) {
          return NextResponse.json({ error: `Sem estoque para ${p.nome}` }, { status: 400 });
        }
      }
    }
    total = Number(total.toFixed(2));

    // Para aluno, checar saldo e restrições
    let idContaAluno: number | null = null;
    if (tipo_cliente === 'ALUNO') {
      type ContaRow = { id: number; saldo_atual: number; limite_credito: number };
      const conta = (await query(
        `SELECT id, saldo_atual, limite_credito FROM cant_contas_alunos WHERE ra_aluno = ?`,
        [Number(ra_aluno)]
      )) as ContaRow[];
      if (!conta || conta.length === 0) {
        await query(
          `INSERT INTO cant_contas_alunos (ra_aluno, saldo_atual, limite_credito, ativo) VALUES (?, 0, 0, 1)`,
          [Number(ra_aluno)]
        );
        const created = (await query(
          `SELECT id, saldo_atual, limite_credito FROM cant_contas_alunos WHERE ra_aluno = ?`,
          [Number(ra_aluno)]
        )) as ContaRow[];
        idContaAluno = created[0].id;
      } else {
        idContaAluno = conta[0].id;
      }

      // Restrições
      type ProdTipoRow = { id_produto: number; id_tipo: number };
      const prodsTipos = (await query(
        `SELECT p.id as id_produto, tp.id as id_tipo
         FROM cant_produtos p INNER JOIN cant_tipos_produtos tp ON tp.id = p.id_tipo
         WHERE p.id IN (${ids.map(() => '?').join(',')})`,
        ids
      )) as ProdTipoRow[];
      type RestrRow = {
        tipo_restricao: 'PRODUTO' | 'TIPO_PRODUTO';
        id_produto: number | null;
        id_tipo_produto: number | null;
      };
      const r1 = (await query(
        `SELECT tipo_restricao, id_produto, id_tipo_produto FROM cant_restricoes_alunos
         WHERE ra_aluno = ? AND ativo = 1`,
        [Number(ra_aluno)]
      )) as RestrRow[];
      if (r1 && r1.length > 0) {
        const setProd = new Set(
          r1.filter((r) => r.tipo_restricao === 'PRODUTO').map((r) => r.id_produto as number)
        );
        const setTipo = new Set(
          r1
            .filter((r) => r.tipo_restricao === 'TIPO_PRODUTO')
            .map((r) => r.id_tipo_produto as number)
        );
        for (const pr of prodsTipos) {
          if (setProd.has(pr.id_produto) || setTipo.has(pr.id_tipo)) {
            return NextResponse.json(
              { error: 'Venda bloqueada por restrição do aluno' },
              { status: 400 }
            );
          }
        }
      }
    }

    // Forma de pagamento
    if (
      !forma_pagamento ||
      !['SALDO', 'DINHEIRO', 'CARTAO', 'CONTA_FUNCIONARIO'].includes(forma_pagamento)
    ) {
      return NextResponse.json({ error: 'Forma de pagamento inválida' }, { status: 400 });
    }
    if (tipo_cliente === 'ALUNO' && forma_pagamento !== 'SALDO') {
      return NextResponse.json({ error: 'Alunos só podem pagar com SALDO' }, { status: 400 });
    }
    if (tipo_cliente === 'FUNCIONARIO' && forma_pagamento === 'SALDO') {
      return NextResponse.json({ error: 'Funcionário não utiliza SALDO' }, { status: 400 });
    }
    if (tipo_cliente === 'GERAL') {
      if (['SALDO', 'CONTA_FUNCIONARIO'].includes(forma_pagamento)) {
        return NextResponse.json(
          { error: 'Clientes gerais não podem usar SALDO ou CONTA_FUNCIONARIO' },
          { status: 400 }
        );
      }
    }

    await conn.beginTransaction();

    // Inserir venda
    const [resVenda] = await conn.query(
      `INSERT INTO cant_vendas (ra_aluno, codigo_funcionario, tipo_cliente, valor_total, forma_pagamento, status, id_caixa, dt_venda, usuario, observacoes)
       VALUES (?, ?, ?, ?, ?, 'CONCLUIDA', ?, NOW(), ?, ?)`,
      [
        tipo_cliente === 'ALUNO' ? Number(ra_aluno) : null,
        tipo_cliente === 'FUNCIONARIO' ? Number(codigo_funcionario) : null,
        tipo_cliente,
        total,
        forma_pagamento,
        idCaixa,
        user.id,
        observacoes || null,
      ]
    );
    const idVenda = (resVenda as any).insertId as number;

    // Inserir itens e dar baixa em estoque
    for (const it of itens as ItemVenda[]) {
      const p = mapProd.get(Number(it.id_produto));
      if (!p) {
        await conn.rollback();
        return NextResponse.json({ error: 'Produto inválido' }, { status: 400 });
      }
      const qtd = Number(it.quantidade);
      const peso = it.peso != null ? Number(it.peso) : null;
      const preco = it.preco_unitario != null ? Number(it.preco_unitario) : Number(p.preco_venda);
      const valor_total_item = Number(
        (p.por_quilo ? preco * (peso as number) : preco * qtd).toFixed(2)
      );

      await conn.query(
        `INSERT INTO cant_vendas_itens (id_venda, id_produto, quantidade, peso, preco_unitario, valor_total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [idVenda, p.id, qtd, p.por_quilo ? peso : null, preco, valor_total_item]
      );

      // Estoque: SAIDA da quantidade de unidades do item (não por peso)
      const qtdAnterior = Number(p.quantidade_atual);
      const qtdPosterior = Number((qtdAnterior - qtd).toFixed(3));
      if (qtdPosterior < 0) {
        await conn.rollback();
        return NextResponse.json({ error: `Estoque insuficiente para ${p.nome}` }, { status: 400 });
      }
      await conn.query(
        `INSERT INTO cant_movimentacoes_estoque (id_produto, tipo_movimentacao, quantidade, quantidade_anterior, quantidade_posterior, motivo, documento, dt_movimentacao, usuario)
         VALUES (?, 'SAIDA', ?, ?, ?, 'VENDA', ?, NOW(), ?)`,
        [p.id, qtd, qtdAnterior, qtdPosterior, `VENDA#${idVenda}`, user.id]
      );
      await conn.query(
        `UPDATE cant_estoque SET quantidade_atual = ?, dt_ultima_movimentacao = NOW() WHERE id_produto = ?`,
        [qtdPosterior, p.id]
      );
    }

    // Movimentação financeira
    if (tipo_cliente === 'ALUNO' && forma_pagamento === 'SALDO') {
      // débito conta aluno
      type ContaRow2 = { id: number; saldo_atual: number; limite_credito: number };
      const [rowsConta] = await conn.query(
        `SELECT id, saldo_atual, limite_credito FROM cant_contas_alunos WHERE ra_aluno = ? FOR UPDATE`,
        [Number(ra_aluno)]
      );
      const linha = (rowsConta as ContaRow2[])[0];
      const saldoAnterior = Number(linha.saldo_atual);
      const limite = Number(linha.limite_credito || 0);
      const saldoPosterior = Number((saldoAnterior - total).toFixed(2));
      if (saldoPosterior < -limite) {
        await conn.rollback();
        return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
      }
      await conn.query(
        `INSERT INTO cant_movimentacoes_alunos (id_conta_aluno, tipo_movimentacao, valor, saldo_anterior, saldo_posterior, descricao, id_venda, dt_movimentacao, usuario)
         VALUES (?, 'DEBITO', ?, ?, ?, 'Compra na cantina', ?, NOW(), ?)`,
        [linha.id, total, saldoAnterior, saldoPosterior, idVenda, user.id]
      );
      await conn.query(
        `UPDATE cant_contas_alunos SET saldo_atual = ?, dt_alteracao = NOW() WHERE id = ?`,
        [saldoPosterior, linha.id]
      );

      // Registrar movimentação no caixa: VENDA apenas para DINHEIRO (nessa regra)
      // Como forma de pagamento é SALDO, não entra no caixa físico.
    } else if (forma_pagamento === 'DINHEIRO') {
      await conn.query(
        `INSERT INTO cant_movimentacoes_caixa (id_caixa, tipo_movimentacao, valor, descricao, dt_movimentacao, usuario)
         VALUES (?, 'VENDA', ?, 'Venda PDV', NOW(), ?)`,
        [idCaixa, total, user.id]
      );
    } else if (tipo_cliente === 'FUNCIONARIO' && forma_pagamento === 'CONTA_FUNCIONARIO') {
      // Registra venda para faturamento mensal
      const mes = new Date();
      const mesRef = `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`;
      await conn.query(
        `INSERT INTO cant_vendas_funcionarios (id_venda, codigo_funcionario, valor_original, valor_aplicado, desconto_aplicado, mes_referencia, pago)
         VALUES (?, ?, ?, ?, 0, ?, 0)`,
        [idVenda, Number(codigo_funcionario), total, total, mesRef]
      );
    }

    await conn.commit();
    return NextResponse.json({ success: true, data: { id_venda: idVenda, total } });
  } catch (error) {
    try {
      await conn.rollback();
    } catch {}
    console.error('Erro ao registrar venda:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  } finally {
    conn.release();
  }
}
