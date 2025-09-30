import { useMemo, useState } from 'react';
import type { ItemCarrinho, Produto, TipoCliente } from '../types';

/**
 * Hook para gerenciar o carrinho de compras
 */
export function useCarrinho(
  produtos: Produto[],
  tipoCliente: TipoCliente,
  precosCargo: Record<number, number>
) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  const totais = useMemo(() => {
    let base = 0;
    let aplicado = 0;

    for (const item of itens) {
      const produto = produtos.find((pr) => pr.id === item.id_produto);
      if (!produto) continue;

      const quantidade = produto.por_quilo
        ? Number(item.peso) || 0
        : Number(item.quantidade ?? 1) || 0;

      const precoBase = Number(produto.preco_venda);
      base += precoBase * quantidade;

      let precoAplicado = precoBase;
      if (tipoCliente === 'FUNCIONARIO') {
        const especial = precosCargo[produto.id];
        if (especial != null) {
          precoAplicado = Number(especial);
        }
      }
      aplicado += precoAplicado * quantidade;
    }

    base = Number(base.toFixed(2));
    aplicado = Number(aplicado.toFixed(2));

    return {
      base,
      aplicado,
      desconto: Number((base - aplicado).toFixed(2)),
    };
  }, [itens, produtos, tipoCliente, precosCargo]);

  const addItem = (p: Produto) => {
    setItens((cur) => {
      const existente = cur.find((i) => i.id_produto === p.id);
      if (existente) {
        if (p.por_quilo) return cur;
        return cur.map((i) =>
          i.id_produto === p.id ? { ...i, quantidade: Number(i.quantidade || 0) + 1 } : i
        );
      }
      return [
        ...cur,
        { id_produto: p.id, quantidade: p.por_quilo ? 1 : 1, peso: p.por_quilo ? 0.1 : undefined },
      ];
    });
  };

  const updateItem = (id_produto: number, field: 'quantidade' | 'peso', value: string) => {
    setItens((cur) =>
      cur.map((i) =>
        i.id_produto === id_produto
          ? { ...i, [field]: field === 'quantidade' ? Number(value) : Number(value) }
          : i
      )
    );
  };

  const removerItem = (id_produto: number) => {
    setItens((cur) => cur.filter((i) => i.id_produto !== id_produto));
  };

  const limparCarrinho = () => {
    setItens([]);
  };

  return {
    itens,
    totais,
    addItem,
    updateItem,
    removerItem,
    limparCarrinho,
  };
}
