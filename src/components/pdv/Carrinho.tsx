import { formatarMoeda } from '@/lib/formatters';
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
    <div className='card shadow-sm'>
      <div className='card-header bg-white border-0 pb-0'>
        <h5 className='fw-semibold mb-0 d-flex align-items-center'>
          <FiTrash2 className='me-2' /> Carrinho
          <span className='badge rounded-pill text-bg-secondary ms-2'>{itens.length}</span>
        </h5>
      </div>
      <div className='card-body pt-2'>
        {itens.length === 0 ? (
          <div className='text-center text-muted py-4 small'>
            <FiTrash2 className='mb-2' size={28} />
            <div>Carrinho vazio</div>
            <div>Adicione produtos para iniciar</div>
          </div>
        ) : (
          <>
            <div className='overflow-auto' style={{ maxHeight: '210px' }}>
              <ul className='list-unstyled mb-0'>
                {itens.map((item) => (
                  <li key={item.id} className='py-2 border-bottom'>
                    <div className='d-flex'>
                      <div className='flex-grow-1'>
                        <div className='d-flex justify-content-between'>
                          <strong className='text-truncate me-2 small'>{item.nome}</strong>
                          <span className='text-success small'>{formatarMoeda(item.preco)}</span>
                        </div>
                        <div className='text-muted small'>{item.categoria}</div>
                      </div>
                      <div className='ms-2 d-flex align-items-center gap-1'>
                        <button
                          onClick={() =>
                            onUpdateQuantidade(item.id, Math.max(0, item.quantidade - 1))
                          }
                          className='btn btn-outline-secondary btn-sm rounded-circle px-0'
                          disabled={item.quantidade <= 1}
                        >
                          <FiMinus size={14} />
                        </button>
                        <span
                          className='fw-semibold small'
                          style={{ width: 24, textAlign: 'center' }}
                        >
                          {item.quantidade}
                        </span>
                        <button
                          onClick={() => onUpdateQuantidade(item.id, item.quantidade + 1)}
                          className='btn btn-outline-secondary btn-sm rounded-circle px-0'
                        >
                          <FiPlus size={14} />
                        </button>
                        <button
                          onClick={() => onRemoverItem(item.id)}
                          className='btn btn-outline-danger btn-sm rounded-circle px-0'
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className='mt-3 pt-2 border-top d-flex justify-content-between align-items-center'>
              <span className='fw-semibold'>Total</span>
              <span className='fs-5 fw-bold text-success'>{formatarMoeda(total)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
