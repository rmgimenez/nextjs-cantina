import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';
import { NextRequest, NextResponse } from 'next/server';

interface VendaDetalhe extends RowDataPacket {
  id: number;
  tipo_cliente: 'ALUNO' | 'FUNCIONARIO' | 'GERAL';
  nome_cliente: string;
  ra_aluno: number | null;
  codigo_funcionario: number | null;
  valor_total: number;
  forma_pagamento: 'SALDO' | 'DINHEIRO' | 'CARTAO' | 'CONTA_FUNCIONARIO';
  status: 'CONCLUIDA' | 'CANCELADA' | 'ESTORNADA';
  dt_venda: string;
  usuario_nome: string;
  observacoes: string | null;
  id_caixa: number;
  dt_abertura_caixa: string;
}

interface ItemVenda extends RowDataPacket {
  id: number;
  id_produto: number;
  produto_nome: string;
  tipo_produto: string;
  quantidade: number;
  peso: number | null;
  preco_unitario: number;
  valor_total: number;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    // Buscar informações da venda
    const vendaQuery = `
      SELECT 
        v.id,
        v.tipo_cliente,
        CASE 
          WHEN v.tipo_cliente = 'ALUNO' THEN a.nome
          WHEN v.tipo_cliente = 'FUNCIONARIO' THEN f.nome
          ELSE 'Cliente Geral'
        END AS nome_cliente,
        v.ra_aluno,
        v.codigo_funcionario,
        v.valor_total,
        v.forma_pagamento,
        v.status,
        v.dt_venda,
        u.nome AS usuario_nome,
        v.observacoes,
        v.id_caixa,
        c.dt_abertura AS dt_abertura_caixa
      FROM cant_vendas v
      LEFT JOIN alunos a ON v.ra_aluno = a.ra
      LEFT JOIN funcionarios f ON v.codigo_funcionario = f.codigo
      LEFT JOIN cant_usuarios_cantina u ON v.usuario = u.id
      LEFT JOIN cant_caixa c ON v.id_caixa = c.id
      WHERE v.id = ?
    `;

    const vendas = await query<VendaDetalhe[]>(vendaQuery, [id]);

    if (vendas.length === 0) {
      return NextResponse.json({ success: false, error: 'Venda não encontrada' }, { status: 404 });
    }

    const venda = vendas[0];

    // Buscar itens da venda
    const itensQuery = `
      SELECT 
        vi.id,
        vi.id_produto,
        p.nome AS produto_nome,
        tp.nome AS tipo_produto,
        vi.quantidade,
        vi.peso,
        vi.preco_unitario,
        vi.valor_total
      FROM cant_vendas_itens vi
      INNER JOIN cant_produtos p ON vi.id_produto = p.id
      INNER JOIN cant_tipos_produtos tp ON p.id_tipo = tp.id
      WHERE vi.id_venda = ?
      ORDER BY vi.id
    `;

    const itens = await query<ItemVenda[]>(itensQuery, [id]);

    return NextResponse.json({
      success: true,
      data: {
        venda,
        itens,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes da venda:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar detalhes da venda' },
      { status: 500 }
    );
  }
}
