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
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className='bg-gray-200 animate-pulse rounded-lg p-4 h-40'></div>
        ))}
      </div>
    );
  }

  if (produtos.length === 0) {
    return (
      <div className='text-center py-12 text-gray-500'>
        <FiPackage className='mx-auto mb-4 text-4xl' />
        <p className='text-lg font-medium'>Nenhum produto encontrado</p>
        <p className='text-sm'>Tente ajustar os filtros de busca</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
      {produtos.map((produto) => {
        const estoqueStatus =
          produto.estoque <= 0
            ? 'sem-estoque'
            : produto.estoque <= produto.estoqueMinimo
            ? 'estoque-baixo'
            : 'ok';

        return (
          <div
            key={produto.id}
            className={`bg-white border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-lg ${
              estoqueStatus === 'sem-estoque'
                ? 'border-red-200 bg-red-50 opacity-75'
                : estoqueStatus === 'estoque-baixo'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            {/* Imagem placeholder */}
            <div className='aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center'>
              <FiPackage className='text-gray-400 text-2xl' />
            </div>

            {/* Informações do produto */}
            <h3 className='font-semibold text-sm text-gray-900 mb-1 line-clamp-2'>
              {produto.nome}
            </h3>

            <p className='text-xs text-gray-500 mb-2'>{produto.categoria}</p>

            <div className='flex items-center justify-between mb-3'>
              <span className='text-lg font-bold text-green-600'>
                R$ {produto.preco.toFixed(2)}
                {produto.exigePeso && <span className='text-xs'>/kg</span>}
              </span>

              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  estoqueStatus === 'sem-estoque'
                    ? 'bg-red-100 text-red-700'
                    : estoqueStatus === 'estoque-baixo'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {produto.estoque.toFixed(produto.exigePeso ? 3 : 0)}
                {produto.exigePeso ? 'kg' : 'un'}
              </div>
            </div>

            {/* Botão adicionar */}
            <button
              onClick={() => onAdicionarAoCarrinho(produto)}
              disabled={produto.estoque <= 0}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                produto.estoque <= 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              <FiPlus className='w-4 h-4' />
              <span>{produto.estoque <= 0 ? 'Sem estoque' : 'Adicionar'}</span>
            </button>

            {/* Alertas de estoque */}
            {estoqueStatus === 'estoque-baixo' && produto.estoque > 0 && (
              <p className='text-xs text-yellow-600 mt-2 text-center'>⚠️ Estoque baixo</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
