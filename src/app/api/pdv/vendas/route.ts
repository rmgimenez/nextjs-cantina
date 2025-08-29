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

interface ItemVenda {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}

interface DadosVenda {
  tipoComprador: 'ALUNO' | 'FUNCIONARIO_ESCOLA' | 'AVULSA';
  compradorId?: number;
  formaPagamento: 'DINHEIRO' | 'CARTAO' | 'SALDO_ALUNO' | 'CONTA_FUNCIONARIO' | 'PACOTE';
  itens: ItemVenda[];
  observacao?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await ensureAuth(req);
    if (!user || !['ADMIN', 'ATENDENTE'].includes(user.tipo)) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const dados: DadosVenda = await req.json();

    // Validações básicas
    if (!dados.itens || dados.itens.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    if (!['ALUNO', 'FUNCIONARIO_ESCOLA', 'AVULSA'].includes(dados.tipoComprador)) {
      return NextResponse.json({ error: 'Tipo de comprador inválido' }, { status: 400 });
    }

    if (
      (dados.tipoComprador === 'ALUNO' || dados.tipoComprador === 'FUNCIONARIO_ESCOLA') &&
      !dados.compradorId
    ) {
      return NextResponse.json({ error: 'ID do comprador é obrigatório' }, { status: 400 });
    }

    // Verificar se existe caixa aberto
    const caixaAberto = await query(
      'SELECT id FROM cant_caixa WHERE status = "ABERTO" ORDER BY data_abertura DESC LIMIT 1'
    );

    if (caixaAberto.length === 0) {
      return NextResponse.json(
        { error: 'Não há caixa aberto. Abra o caixa antes de realizar vendas.' },
        { status: 400 }
      );
    }

    const caixaId = caixaAberto[0].id;

    // Calcular totais
    let valorBruto = 0;
    for (const item of dados.itens) {
      valorBruto += item.quantidade * item.precoUnitario;
    }
    const desconto = 0; // Por enquanto sem desconto
    const valorLiquido = valorBruto - desconto;

    // Validações específicas por tipo de comprador
    if (dados.tipoComprador === 'ALUNO' && dados.formaPagamento === 'SALDO_ALUNO') {
      // Verificar saldo do aluno
      const saldoResult = await query(
        'SELECT COALESCE(saldo, 0) as saldo FROM cant_view_aluno_saldo WHERE aluno_ra = ?',
        [dados.compradorId]
      );

      const saldoAtual = saldoResult.length > 0 ? parseFloat(saldoResult[0].saldo) : 0;

      if (saldoAtual < valorLiquido) {
        return NextResponse.json(
          {
            error: 'Saldo insuficiente',
            saldoAtual,
            valorNecessario: valorLiquido,
          },
          { status: 400 }
        );
      }

      // Verificar restrições do aluno
      const restricoes = await query(
        `
        SELECT produto_id, tipo_restricao, item_nome
        FROM cant_view_aluno_restricao
        WHERE aluno_ra = ? 
      `,
        [dados.compradorId]
      );

      for (const item of dados.itens) {
        const restricaoProduto = restricoes.find((r: any) => r.produto_id === item.produtoId);
        if (restricaoProduto) {
          return NextResponse.json(
            {
              error: `Produto ${restricaoProduto.item_nome} está restrito para este aluno`,
              restricao: restricaoProduto.tipo_restricao,
            },
            { status: 400 }
          );
        }
      }
    }

    // Verificar estoque dos produtos
    for (const item of dados.itens) {
      const estoqueResult = await query(
        'SELECT COALESCE(saldo, 0) as estoque FROM cant_view_estoque_saldo WHERE produto_id = ?',
        [item.produtoId]
      );

      const estoqueAtual = estoqueResult.length > 0 ? parseFloat(estoqueResult[0].estoque) : 0;

      if (estoqueAtual < item.quantidade) {
        const produtoResult = await query('SELECT nome FROM cant_produtos WHERE id = ?', [
          item.produtoId,
        ]);
        const nomeProduto = produtoResult.length > 0 ? produtoResult[0].nome : 'Produto';

        return NextResponse.json(
          {
            error: `Estoque insuficiente para ${nomeProduto}`,
            estoqueAtual,
            quantidadeSolicitada: item.quantidade,
          },
          { status: 400 }
        );
      }
    }

    // Iniciar transação
    await query('START TRANSACTION');

    try {
      // Inserir venda
      const vendaResult = await query(
        `
        INSERT INTO cant_venda (
          caixa_id, usuario_id, tipo_comprador, comprador_aluno_ra, comprador_funcionario_id,
          forma_pagamento, valor_bruto, desconto, valor_liquido, observacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          caixaId,
          user.id,
          dados.tipoComprador,
          dados.tipoComprador === 'ALUNO' ? dados.compradorId : null,
          dados.tipoComprador === 'FUNCIONARIO_ESCOLA' ? dados.compradorId : null,
          dados.formaPagamento,
          valorBruto,
          desconto,
          valorLiquido,
          dados.observacao || null,
        ]
      );

      const vendaId = vendaResult.insertId;

      // Inserir itens da venda
      for (const item of dados.itens) {
        const valorTotalItem = item.quantidade * item.precoUnitario;

        await query(
          `
          INSERT INTO cant_venda_item (venda_id, produto_id, quantidade, preco_unitario, valor_total)
          VALUES (?, ?, ?, ?, ?)
        `,
          [vendaId, item.produtoId, item.quantidade, item.precoUnitario, valorTotalItem]
        );

        // Dar baixa no estoque
        await query(
          `
          INSERT INTO cant_estoque_mov (produto_id, tipo_mov, quantidade, referencia, usuario_id)
          VALUES (?, 'SAIDA_VENDA', ?, ?, ?)
        `,
          [item.produtoId, item.quantidade, `Venda #${vendaId}`, user.id]
        );
      }

      // Movimentar saldo do aluno se necessário
      if (dados.tipoComprador === 'ALUNO' && dados.formaPagamento === 'SALDO_ALUNO') {
        await query(
          `
          INSERT INTO cant_aluno_saldo_mov (aluno_ra, tipo, valor, origem, referencia, usuario_id)
          VALUES (?, 'DEBITO', ?, 'VENDA', ?, ?)
        `,
          [dados.compradorId, valorLiquido, `Venda #${vendaId}`, user.id]
        );
      }

      // Registrar movimentação no caixa (apenas para dinheiro/cartão)
      if (['DINHEIRO', 'CARTAO'].includes(dados.formaPagamento)) {
        await query(
          `
          INSERT INTO cant_caixa_mov (caixa_id, tipo, valor, descricao, referencia, usuario_id)
          VALUES (?, 'VENDA', ?, ?, ?, ?)
        `,
          [caixaId, valorLiquido, `Venda ${dados.formaPagamento}`, `Venda #${vendaId}`, user.id]
        );
      }

      // Registrar conta a receber para funcionário da escola
      if (
        dados.tipoComprador === 'FUNCIONARIO_ESCOLA' &&
        dados.formaPagamento === 'CONTA_FUNCIONARIO'
      ) {
        const dataVencimento = new Date();
        dataVencimento.setMonth(dataVencimento.getMonth() + 1); // Vence no próximo mês

        await query(
          `
          INSERT INTO cant_contas_receber (
            descricao, valor, data_vencimento, funcionario_codigo, 
            referencia, created_by
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
          [
            `Consumo cantina - Venda #${vendaId}`,
            valorLiquido,
            dataVencimento.toISOString().split('T')[0],
            dados.compradorId,
            `venda_${vendaId}`,
            user.id,
          ]
        );
      }

      await query('COMMIT');

      return NextResponse.json({
        ok: true,
        vendaId,
        valorTotal: valorLiquido,
        message: 'Venda realizada com sucesso!',
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('POST /api/pdv/vendas', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
