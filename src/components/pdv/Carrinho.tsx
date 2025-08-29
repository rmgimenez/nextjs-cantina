import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

interface ItemCarrinho {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: string;
}

interface CarrinhoProps {
  itens: ItemCarrinho[];
  onUpdateQuantidade: (id: number, novaQuantidade: number) => void;
  onRemoverItem: (id: number) => void;
}

export default function Carrinho({ itens, onUpdateQuantidade, onRemoverItem }: CarrinhoProps) {
  const total = itens.reduce((sum, item) => sum + item.preco * item.quantidade, 0);

  return (
    <div className='bg-white border rounded-lg p-4'>
      <h3 className='font-semibold text-lg mb-4 flex items-center'>
        <FiTrash2 className='mr-2' />
        Carrinho ({itens.length} {itens.length === 1 ? 'item' : 'itens'})
      </h3>

      {itens.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <FiTrash2 className='mx-auto mb-2 text-3xl' />
          <p>Carrinho vazio</p>
          <p className='text-sm'>Adicione produtos para iniciar a venda</p>
        </div>
      ) : (
        <>
          <div className='space-y-3 max-h-64 overflow-y-auto'>
            {itens.map((item) => (
              <div key={item.id} className='flex items-center justify-between p-3 border-b'>
                <div className='flex-1 min-w-0'>
                  <h4 className='font-medium text-sm truncate'>{item.nome}</h4>
                  <p className='text-xs text-gray-500'>{item.categoria}</p>
                  <p className='text-sm font-semibold text-green-600'>
                    R$ {item.preco.toFixed(2)} cada
                  </p>
                </div>

                <div className='flex items-center space-x-2 ml-3'>
                  <button
                    onClick={() => onUpdateQuantidade(item.id, Math.max(0, item.quantidade - 1))}
                    className='w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 text-gray-600'
                    disabled={item.quantidade <= 1}
                  >
                    <FiMinus className='w-3 h-3' />
                  </button>

                  <span className='w-8 text-center font-medium'>{item.quantidade}</span>

                  <button
                    onClick={() => onUpdateQuantidade(item.id, item.quantidade + 1)}
                    className='w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 text-gray-600'
                  >
                    <FiPlus className='w-3 h-3' />
                  </button>

                  <button
                    onClick={() => onRemoverItem(item.id)}
                    className='w-8 h-8 flex items-center justify-center rounded-full border border-red-300 hover:bg-red-100 text-red-600 ml-2'
                  >
                    <FiTrash2 className='w-3 h-3' />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-4 pt-4 border-t'>
            <div className='flex justify-between items-center'>
              <span className='text-lg font-semibold'>Total:</span>
              <span className='text-2xl font-bold text-green-600'>R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
