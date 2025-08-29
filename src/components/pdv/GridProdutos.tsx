import { FiPackage, FiPlus } from 'react-icons/fi';

interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  estoque: number;
  estoqueMinimo: number;
  exigePeso: boolean;
}

interface GridProdutosProps {
  produtos: Produto[];
  onAdicionarAoCarrinho: (produto: Produto) => void;
  loading?: boolean;
}

export default function GridProdutos({
  produtos,
  onAdicionarAoCarrinho,
  loading,
}: GridProdutosProps) {
  if (loading) {
    return (
      <div className='row g-3'>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className='col-6 col-md-4 col-lg-3'>
            <div className='card h-100 placeholder-glow'>
              <div className='card-body'>
                <span className='placeholder col-12 h-100'></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (produtos.length === 0) {
    return (
      <div className='text-center py-5 text-muted'>
        <FiPackage className='mb-3' size={40} />
        <p className='fw-semibold mb-1'>Nenhum produto encontrado</p>
        <small>Ajuste os filtros de busca</small>
      </div>
    );
  }

  return (
    <div className='row g-3'>
      {produtos.map((produto) => {
        const estoqueStatus =
          produto.estoque <= 0
            ? 'sem-estoque'
            : produto.estoque <= produto.estoqueMinimo
            ? 'estoque-baixo'
            : 'ok';

        return (
          <div key={produto.id} className='col-6 col-md-4 col-lg-3 d-flex'>
            <div
              className={`card w-100 border-2 shadow-sm h-100 ${
                estoqueStatus === 'sem-estoque'
                  ? 'border-danger-subtle bg-danger bg-opacity-10'
                  : estoqueStatus === 'estoque-baixo'
                  ? 'border-warning bg-warning bg-opacity-10'
                  : 'border-light'
              }`}
            >
              <div className='p-2 pb-0'>
                <div className='ratio ratio-1x1 rounded bg-light d-flex align-items-center justify-content-center mb-2'>
                  <FiPackage className='text-secondary' size={28} />
                </div>
                <h6 className='fw-semibold small mb-1 text-truncate' title={produto.nome}>
                  {produto.nome}
                </h6>
                <div className='d-flex justify-content-between small text-muted mb-2'>
                  <span className='text-uppercase'>{produto.categoria}</span>
                  <span
                    className={`badge rounded-pill ${
                      estoqueStatus === 'sem-estoque'
                        ? 'text-bg-danger'
                        : estoqueStatus === 'estoque-baixo'
                        ? 'text-bg-warning'
                        : 'text-bg-secondary'
                    }`}
                  >
                    {produto.estoque.toFixed(produto.exigePeso ? 3 : 0)}
                    {produto.exigePeso ? 'kg' : 'un'}
                  </span>
                </div>
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <span className='fw-bold text-success'>
                    R$ {produto.preco.toFixed(2)}
                    {produto.exigePeso && <small className='text-muted'>/kg</small>}
                  </span>
                </div>
              </div>
              <div className='px-2 pb-2 mt-auto'>
                <button
                  onClick={() => onAdicionarAoCarrinho(produto)}
                  disabled={produto.estoque <= 0}
                  className={`btn btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-1 ${
                    produto.estoque <= 0 ? 'btn-outline-secondary disabled' : 'btn-primary'
                  }`}
                >
                  <FiPlus /> {produto.estoque <= 0 ? 'Sem estoque' : 'Adicionar'}
                </button>
                {estoqueStatus === 'estoque-baixo' && produto.estoque > 0 && (
                  <div className='text-warning small mt-1 text-center fw-semibold'>
                    Estoque baixo
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
