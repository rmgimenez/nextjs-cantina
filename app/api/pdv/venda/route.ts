import type { ResultSetHeader } from 'mysql2/promise';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/auth';
import pool, { query } from '../../../../lib/db';

type ItemVenda = {
  id_produto: number;
  quantidade: number; // para por_quilo, usar quantidade = 1 e informar peso
  peso?: number | null;
  preco_unitario?: number | null; // opcional; se não vier, usar do produto
};

type ProdutoConsulta = {
  id: number;
  nome: string;
  preco_venda: number;
  por_quilo: number;
  quantidade_atual: number;
};

type ItemProcessado = {
  produto: ProdutoConsulta;
  quantidade: number;
  peso: number | null;
  precoBase: number;
  precoAplicado: number;
  valorBase: number;
  valorFinal: number;
};

export async function POST(req: Request) {
  const conn = await pool.getConnection();
  try {
    const user = getUserFromRequest(req);
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

    const produtoIds = itens.map((item: ItemVenda) => Number(item.id_produto));
    if (produtoIds.some((id) => !Number.isFinite(id) || id <= 0)) {
      return NextResponse.json({ error: 'Produtos inválidos' }, { status: 400 });
    }

    type CaixaRow = { id: number };
    const caixaAberto = (await query(
      `SELECT id FROM cant_caixa WHERE status = 'ABERTO' ORDER BY dt_abertura DESC LIMIT 1`
    )) as CaixaRow[];
    if (!caixaAberto || caixaAberto.length === 0) {
      return NextResponse.json(
        { error: 'Caixa fechado. Abra o caixa para vender.' },
        { status: 400 }
      );
    }
    const idCaixa = caixaAberto[0].id;

    let funcionarioInfo: { codigo: number; nome: string; cargo: string | null } | null = null;

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
      const funcionarios = (await query(
        `SELECT codigo, nome, cargo FROM funcionarios WHERE codigo = ? LIMIT 1`,
        [Number(codigo_funcionario)]
      )) as { codigo: number; nome: string; cargo: string | null }[];
      if (!funcionarios || funcionarios.length === 0) {
        return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
      }
      funcionarioInfo = funcionarios[0];
    }

    const produtos = (await query(
      `SELECT p.id, p.nome, p.preco_venda, p.por_quilo, e.quantidade_atual
         FROM cant_produtos p
         INNER JOIN cant_estoque e ON e.id_produto = p.id
         WHERE p.id IN (${produtoIds.map(() => '?').join(',')}) AND p.ativo = 1`,
      produtoIds
    )) as ProdutoConsulta[];
    if (!produtos || produtos.length !== produtoIds.length) {
      return NextResponse.json({ error: 'Produto inválido/inativo' }, { status: 400 });
    }

    const mapProdutos = new Map<number, ProdutoConsulta>();
    for (const produto of produtos) {
      mapProdutos.set(produto.id, produto);
    }

    let cargoAplicado: string | null = null;
    const precosCargo = new Map<number, number>();
    if (tipo_cliente === 'FUNCIONARIO') {
      const cargo = (funcionarioInfo?.cargo || '').trim();
      if (cargo) {
        cargoAplicado = cargo.toUpperCase();
        const precos = (await query(
          `SELECT id_produto, preco_especial
             FROM cant_precos_por_cargo
             WHERE cargo = ? AND ativo = 1
               AND (dt_inicio_vigencia IS NULL OR dt_inicio_vigencia <= CURDATE())
               AND (dt_fim_vigencia IS NULL OR dt_fim_vigencia >= CURDATE())
               AND id_produto IN (${produtoIds.map(() => '?').join(',')})`,
          [cargoAplicado, ...produtoIds]
        )) as { id_produto: number; preco_especial: number }[];
        for (const row of precos) {
          precosCargo.set(Number(row.id_produto), Number(row.preco_especial));
        }
      }
    }

    const itensProcessados: ItemProcessado[] = [];
    let total = 0;
    let valorOriginalTotal = 0;
    let valorAplicadoTotal = 0;

    for (const item of itens as ItemVenda[]) {
      const produto = mapProdutos.get(Number(item.id_produto));
      if (!produto) {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 400 });
      }

      const quantidade = Number(item.quantidade);
      if (!Number.isFinite(quantidade) || quantidade <= 0) {
        return NextResponse.json({ error: 'Quantidade inválida' }, { status: 400 });
      }
      const peso = item.peso != null ? Number(item.peso) : null;

      const precoBase = Number(produto.preco_venda);
      let precoAplicado = precoBase;

      if (tipo_cliente === 'FUNCIONARIO') {
        const especial = precosCargo.get(produto.id);
        if (especial != null && Number.isFinite(especial)) {
          precoAplicado = Number(especial);
        }
      } else if (item.preco_unitario != null) {
        const precoInformado = Number(item.preco_unitario);
        if (Number.isFinite(precoInformado) && precoInformado >= 0) {
          precoAplicado = precoInformado;
        }
      }

      let valorBase = 0;
      let valorFinal = 0;

      if (produto.por_quilo) {
        if (peso == null || !Number.isFinite(peso) || peso <= 0) {
          return NextResponse.json(
            { error: 'Peso inválido para produto por quilo' },
            { status: 400 }
          );
        }
        valorBase = Number((precoBase * peso).toFixed(2));
        valorFinal = Number((precoAplicado * peso).toFixed(2));
      } else {
        valorBase = Number((precoBase * quantidade).toFixed(2));
        valorFinal = Number((precoAplicado * quantidade).toFixed(2));
      }

      if (Number(produto.quantidade_atual) < quantidade) {
        return NextResponse.json({ error: `Sem estoque para ${produto.nome}` }, { status: 400 });
      }

      itensProcessados.push({
        produto,
        quantidade,
        peso: produto.por_quilo ? peso : null,
        precoBase,
        precoAplicado,
        valorBase,
        valorFinal,
      });

      total += valorFinal;
      if (tipo_cliente === 'FUNCIONARIO') {
        valorOriginalTotal += valorBase;
        valorAplicadoTotal += valorFinal;
      }
    }

    total = Number(total.toFixed(2));
    valorOriginalTotal = Number(valorOriginalTotal.toFixed(2));
    valorAplicadoTotal = Number(valorAplicadoTotal.toFixed(2));

    if (tipo_cliente !== 'FUNCIONARIO') {
      valorOriginalTotal = total;
      valorAplicadoTotal = total;
      cargoAplicado = null;
    }

    const descontoAplicado = Number((valorOriginalTotal - valorAplicadoTotal).toFixed(2));

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
        const criada = (await query(
          `SELECT id, saldo_atual, limite_credito FROM cant_contas_alunos WHERE ra_aluno = ?`,
          [Number(ra_aluno)]
        )) as ContaRow[];
        idContaAluno = criada[0].id;
      } else {
        idContaAluno = conta[0].id;
      }

      type ProdTipoRow = { id_produto: number; id_tipo: number };
      const prodsTipos = (await query(
        `SELECT p.id AS id_produto, tp.id AS id_tipo
           FROM cant_produtos p
           INNER JOIN cant_tipos_produtos tp ON tp.id = p.id_tipo
           WHERE p.id IN (${produtoIds.map(() => '?').join(',')})`,
        produtoIds
      )) as ProdTipoRow[];
      type RestrRow = {
        tipo_restricao: 'PRODUTO' | 'TIPO_PRODUTO';
        id_produto: number | null;
        id_tipo_produto: number | null;
      };
      const restricoes = (await query(
        `SELECT tipo_restricao, id_produto, id_tipo_produto FROM cant_restricoes_alunos
           WHERE ra_aluno = ? AND ativo = 1`,
        [Number(ra_aluno)]
      )) as RestrRow[];
      if (restricoes && restricoes.length > 0) {
        const restricaoProdutos = new Set(
          restricoes
            .filter((r) => r.tipo_restricao === 'PRODUTO' && r.id_produto != null)
            .map((r) => r.id_produto as number)
        );
        const restricaoTipos = new Set(
          restricoes
            .filter((r) => r.tipo_restricao === 'TIPO_PRODUTO' && r.id_tipo_produto != null)
            .map((r) => r.id_tipo_produto as number)
        );
        for (const pt of prodsTipos) {
          if (restricaoProdutos.has(pt.id_produto) || restricaoTipos.has(pt.id_tipo)) {
            return NextResponse.json(
              { error: 'Venda bloqueada por restrição do aluno' },
              { status: 400 }
            );
          }
        }
      }
    }

    if (
      !forma_pagamento ||
      !['SALDO', 'DINHEIRO', 'CARTAO', 'CONTA_FUNCIONARIO'].includes(forma_pagamento)
    ) {
      return NextResponse.json({ error: 'Forma de pagamento inválida' }, { status: 400 });
    }
    if (tipo_cliente === 'ALUNO' && forma_pagamento !== 'SALDO') {
      return NextResponse.json({ error: 'Alunos só podem pagar com SALDO' }, { status: 400 });
    }
    if (tipo_cliente === 'FUNCIONARIO' && forma_pagamento !== 'CONTA_FUNCIONARIO') {
      return NextResponse.json(
        { error: 'Funcionários devem pagar com CONTA_FUNCIONARIO' },
        { status: 400 }
      );
    }
    if (tipo_cliente === 'GERAL' && ['SALDO', 'CONTA_FUNCIONARIO'].includes(forma_pagamento)) {
      return NextResponse.json(
        { error: 'Clientes gerais não podem usar SALDO ou CONTA_FUNCIONARIO' },
        { status: 400 }
      );
    }

    await conn.beginTransaction();

    let contaFuncionarioInfo: {
      limite: number | null;
      alerta: number | null;
      saldoAtual: number;
      saldoProjetado: number;
    } | null = null;

    if (tipo_cliente === 'FUNCIONARIO') {
      const codigo = Number(codigo_funcionario);
      const [contasRows] = await conn.query(
        `SELECT id, limite_credito, alerta_credito
           FROM cant_contas_funcionarios
           WHERE codigo_funcionario = ? FOR UPDATE`,
        [codigo]
      );
      let conta = (
        contasRows as {
          id: number;
          limite_credito: number | null;
          alerta_credito: number | null;
        }[]
      )[0];
      if (!conta) {
        await conn.query(
          `INSERT INTO cant_contas_funcionarios (codigo_funcionario, limite_credito, alerta_credito, ativo, dt_criacao)
             VALUES (?, NULL, NULL, 1, NOW())`,
          [codigo]
        );
        const [contaCriadaRows] = await conn.query(
          `SELECT id, limite_credito, alerta_credito
             FROM cant_contas_funcionarios
             WHERE codigo_funcionario = ? FOR UPDATE`,
          [codigo]
        );
        conta = (
          contaCriadaRows as {
            id: number;
            limite_credito: number | null;
            alerta_credito: number | null;
          }[]
        )[0];
      }

      const limite = conta.limite_credito != null ? Number(conta.limite_credito) : null;
      const alerta = conta.alerta_credito != null ? Number(conta.alerta_credito) : null;

      const [pendenciasRows] = await conn.query(
        `SELECT COALESCE(SUM(valor_aplicado), 0) AS total_em_aberto
           FROM cant_vendas_funcionarios
           WHERE codigo_funcionario = ? AND pago = 0`,
        [codigo]
      );
      const totalEmAberto = Number(
        (pendenciasRows as { total_em_aberto: number | string }[])[0]?.total_em_aberto ?? 0
      );
      const saldoProjetado = Number((totalEmAberto + valorAplicadoTotal).toFixed(2));

      if (limite != null && saldoProjetado - limite > 0.009) {
        await conn.rollback();
        return NextResponse.json(
          {
            error: 'Limite de crédito excedido para o funcionário',
            details: {
              limite,
              saldo_atual: Number(totalEmAberto.toFixed(2)),
              valor_venda: valorAplicadoTotal,
            },
          },
          { status: 400 }
        );
      }

      contaFuncionarioInfo = {
        limite,
        alerta,
        saldoAtual: Number(totalEmAberto.toFixed(2)),
        saldoProjetado,
      };

      await conn.query(`UPDATE cant_contas_funcionarios SET dt_alteracao = NOW() WHERE id = ?`, [
        conta.id,
      ]);
    }

    const [resVenda] = await conn.query<ResultSetHeader>(
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
    const idVenda = resVenda.insertId;

    for (const linha of itensProcessados) {
      const produto = mapProdutos.get(linha.produto.id);
      if (!produto) {
        await conn.rollback();
        return NextResponse.json({ error: 'Produto inválido' }, { status: 400 });
      }

      await conn.query(
        `INSERT INTO cant_vendas_itens (id_venda, id_produto, quantidade, peso, preco_unitario, valor_total)
           VALUES (?, ?, ?, ?, ?, ?)`,
        [
          idVenda,
          produto.id,
          linha.quantidade,
          produto.por_quilo ? linha.peso : null,
          linha.precoAplicado,
          linha.valorFinal,
        ]
      );

      const qtdAnterior = Number(produto.quantidade_atual);
      const qtdPosterior = Number((qtdAnterior - linha.quantidade).toFixed(3));
      if (qtdPosterior < 0) {
        await conn.rollback();
        return NextResponse.json(
          { error: `Estoque insuficiente para ${produto.nome}` },
          { status: 400 }
        );
      }

      await conn.query(
        `INSERT INTO cant_movimentacoes_estoque (id_produto, tipo_movimentacao, quantidade, quantidade_anterior, quantidade_posterior, motivo, documento, dt_movimentacao, usuario)
           VALUES (?, 'SAIDA', ?, ?, ?, 'VENDA', ?, NOW(), ?)`,
        [produto.id, linha.quantidade, qtdAnterior, qtdPosterior, `VENDA#${idVenda}`, user.id]
      );

      await conn.query(
        `UPDATE cant_estoque SET quantidade_atual = ?, dt_ultima_movimentacao = NOW() WHERE id_produto = ?`,
        [qtdPosterior, produto.id]
      );

      produto.quantidade_atual = qtdPosterior;
    }

    if (tipo_cliente === 'ALUNO' && forma_pagamento === 'SALDO' && idContaAluno != null) {
      const [rowsContaAluno] = await conn.query(
        `SELECT id, saldo_atual, limite_credito
           FROM cant_contas_alunos
           WHERE id = ? FOR UPDATE`,
        [idContaAluno]
      );
      const contaAluno = (
        rowsContaAluno as {
          id: number;
          saldo_atual: number;
          limite_credito: number;
        }[]
      )[0];
      const saldoAnterior = Number(contaAluno.saldo_atual);
      const limiteCredito = Number(contaAluno.limite_credito || 0);
      const saldoPosterior = Number((saldoAnterior - total).toFixed(2));
      if (saldoPosterior < -limiteCredito) {
        await conn.rollback();
        return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
      }

      await conn.query(
        `INSERT INTO cant_movimentacoes_alunos (id_conta_aluno, tipo_movimentacao, valor, saldo_anterior, saldo_posterior, descricao, id_venda, dt_movimentacao, usuario)
           VALUES (?, 'DEBITO', ?, ?, ?, 'Compra na cantina', ?, NOW(), ?)`,
        [contaAluno.id, total, saldoAnterior, saldoPosterior, idVenda, user.id]
      );

      await conn.query(
        `UPDATE cant_contas_alunos SET saldo_atual = ?, dt_alteracao = NOW() WHERE id = ?`,
        [saldoPosterior, contaAluno.id]
      );
    } else if (forma_pagamento === 'DINHEIRO') {
      await conn.query(
        `INSERT INTO cant_movimentacoes_caixa (id_caixa, tipo_movimentacao, valor, descricao, dt_movimentacao, usuario)
           VALUES (?, 'VENDA', ?, 'Venda PDV', NOW(), ?)`,
        [idCaixa, total, user.id]
      );
    } else if (tipo_cliente === 'FUNCIONARIO' && forma_pagamento === 'CONTA_FUNCIONARIO') {
      const agora = new Date();
      const mesRef = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;

      await conn.query(
        `INSERT INTO cant_vendas_funcionarios (id_venda, codigo_funcionario, cargo_aplicado, valor_original, valor_aplicado, desconto_aplicado, mes_referencia, id_fatura, pago)
           VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 0)`,
        [
          idVenda,
          Number(codigo_funcionario),
          cargoAplicado,
          valorOriginalTotal,
          valorAplicadoTotal,
          descontoAplicado,
          mesRef,
        ]
      );
    }

    await conn.commit();

    return NextResponse.json({
      success: true,
      data: {
        id_venda: idVenda,
        total,
        valor_original: valorOriginalTotal,
        desconto: descontoAplicado,
        cargo_aplicado: cargoAplicado,
        conta_funcionario: contaFuncionarioInfo,
      },
    });
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
