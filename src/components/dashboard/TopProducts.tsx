'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiAward, FiBarChart, FiTag, FiTrendingUp } from 'react-icons/fi';

interface TopProduct {
  id?: number;
  name: string;
  sales: number;
  percentage: number;
  revenue?: number;
}

interface TopProductsProps {
  products: TopProduct[];
}

export default function TopProducts({ products = [] }: TopProductsProps) {
  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className='w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-bold'>
            1
          </div>
        );
      case 1:
        return (
          <div className='w-6 h-6 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold'>
            2
          </div>
        );
      case 2:
        return (
          <div className='w-6 h-6 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white text-xs font-bold'>
            3
          </div>
        );
      default:
        return (
          <div className='w-6 h-6 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold'>
            {index + 1}
          </div>
        );
    }
  };

  const getProgressColor = (index: number) => {
    switch (index) {
      case 0:
        return 'from-yellow-400 to-yellow-600';
      case 1:
        return 'from-gray-300 to-gray-500';
      case 2:
        return 'from-amber-500 to-amber-700';
      default:
        return 'from-[#253287] to-[#3949ab]';
    }
  };

  return (
    <Card className='shadow-lg border-0 h-full'>
      <CardHeader className='bg-gradient-to-r from-[#333333] to-[#424242] text-white rounded-t-lg'>
        <CardTitle className='flex items-center justify-between text-white'>
          <div className='flex items-center'>
            <FiTrendingUp className='w-5 h-5 mr-2' />
            Produtos Mais Vendidos
          </div>
          <FiAward className='w-5 h-5' />
        </CardTitle>
      </CardHeader>
      <CardContent className='p-6'>
        <div className='space-y-5'>
          {products.length > 0 ? (
            products.map((product, index) => (
              <div
                key={product.id || index}
                className='bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200'
              >
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center space-x-3'>
                    {getMedalIcon(index)}
                    <span className='text-sm font-semibold text-gray-900 flex items-center'>
                      <FiTag className='w-4 h-4 mr-2 text-[#253287]' />
                      {product.name}
                    </span>
                  </div>
                  <div className='text-right'>
                    <div className='text-sm text-gray-600 font-medium'>{product.sales} vendas</div>
                    {product.revenue && (
                      <div className='text-xs text-gray-500'>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(product.revenue)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className='w-full bg-gray-200 rounded-full h-3 mb-2'>
                  <div
                    className={`bg-gradient-to-r ${getProgressColor(
                      index
                    )} h-3 rounded-full transition-all duration-700 shadow-sm`}
                    style={{ width: `${product.percentage}%` }}
                  ></div>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-xs text-gray-500'>Performance</span>
                  <span className='text-xs font-medium text-[#253287]'>{product.percentage}%</span>
                </div>
              </div>
            ))
          ) : (
            <div className='text-center text-gray-500 py-12'>
              <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <FiBarChart className='w-10 h-10 text-gray-400' />
              </div>
              <p className='font-medium text-lg mb-2'>Nenhuma venda registrada</p>
              <p className='text-sm text-gray-400'>Os produtos mais vendidos aparecerão aqui</p>
            </div>
          )}
        </div>

        {products.length > 0 && (
          <div className='mt-6 pt-4 border-t border-gray-200'>
            <a
              href='/dashboard/relatorios/produtos'
              className='inline-flex items-center text-[#333333] hover:text-[#424242] font-semibold text-sm transition-colors duration-200 group'
            >
              Ver relatório completo
              <FiTrendingUp className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200' />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
