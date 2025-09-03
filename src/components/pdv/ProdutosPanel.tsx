'use client';

import GridProdutos from '@/components/pdv/GridProdutos';
import type { Produto } from '@/types/pdv';

type Props = {
  produtos: Produto[];
  onAdicionarAoCarrinho: (p: Produto) => void;
  loading?: boolean;
};

export default function ProdutosPanel({ produtos, onAdicionarAoCarrinho, loading }: Props) {
  return (
    <div className='card flex-fill shadow-sm'>
      <div className='card-header bg-white pb-2 pt-3 border-0 d-flex justify-content-between align-items-center'>
        <h5 className='mb-0 fw-semibold'>Produtos Disponíveis</h5>
        <small className='text-muted'>{produtos.length} itens</small>
      </div>
      <div className='card-body pt-0 overflow-auto' style={{ maxHeight: '62vh' }}>
        <GridProdutos
          produtos={produtos}
          onAdicionarAoCarrinho={onAdicionarAoCarrinho}
          loading={!!loading}
        />
      </div>
    </div>
  );
}
