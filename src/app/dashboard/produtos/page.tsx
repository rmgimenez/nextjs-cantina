import DashboardLayout from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FiEdit, FiEye, FiFilter, FiPackage, FiPlus, FiSearch, FiTrash } from 'react-icons/fi';

export default function ProdutosPage() {
  const products = [
    {
      id: 1,
      name: 'Coxinha',
      category: 'Salgados',
      price: 4.5,
      cost: 2.8,
      stock: 25,
      status: 'active',
      barcode: '7891234567890',
    },
    {
      id: 2,
      name: 'Coca-Cola 350ml',
      category: 'Bebidas',
      price: 5.0,
      cost: 3.2,
      stock: 15,
      status: 'active',
      barcode: '7891234567891',
    },
    {
      id: 3,
      name: 'Pão de Açúcar',
      category: 'Doces',
      price: 3.0,
      cost: 1.8,
      stock: 30,
      status: 'active',
      barcode: '7891234567892',
    },
    {
      id: 4,
      name: 'Suco de Laranja 200ml',
      category: 'Bebidas',
      price: 4.0,
      cost: 2.5,
      stock: 8,
      status: 'low_stock',
      barcode: '7891234567893',
    },
    {
      id: 5,
      name: 'Brigadeiro',
      category: 'Doces',
      price: 2.5,
      cost: 1.2,
      stock: 0,
      status: 'out_of_stock',
      barcode: '7891234567894',
    },
  ];

  const getStatusBadge = (status: string, stock: number) => {
    if (status === 'out_of_stock' || stock === 0) {
      return (
        <span className='px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full'>
          Sem Estoque
        </span>
      );
    }
    if (status === 'low_stock' || stock < 10) {
      return (
        <span className='px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full'>
          Estoque Baixo
        </span>
      );
    }
    return (
      <span className='px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full'>
        Disponível
      </span>
    );
  };

  return (
    <DashboardLayout title='Produtos' subtitle='Gerenciamento de produtos da cantina'>
      <div className='space-y-6'>
        {/* Header com Ações */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0'>
          <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 flex-1'>
            <div className='flex-1 max-w-md'>
              <Input
                placeholder='Buscar produtos...'
                icon={<FiSearch className='w-4 h-4' />}
                iconPosition='left'
              />
            </div>
            <Button variant='outline' icon={<FiFilter className='w-4 h-4' />}>
              Filtros
            </Button>
          </div>
          <Button variant='primary' icon={<FiPlus className='w-4 h-4' />}>
            Novo Produto
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Total de Produtos</p>
                  <p className='text-2xl font-bold text-gray-900'>127</p>
                </div>
                <FiPackage className='w-8 h-8 text-blue-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Estoque Baixo</p>
                  <p className='text-2xl font-bold text-yellow-600'>8</p>
                </div>
                <FiPackage className='w-8 h-8 text-yellow-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Sem Estoque</p>
                  <p className='text-2xl font-bold text-red-600'>3</p>
                </div>
                <FiPackage className='w-8 h-8 text-red-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>Valor Total Estoque</p>
                  <p className='text-2xl font-bold text-green-600'>R$ 15.847</p>
                </div>
                <FiPackage className='w-8 h-8 text-green-600' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-gray-200'>
                    <th className='text-left py-3 px-4 font-medium text-gray-700'>Produto</th>
                    <th className='text-left py-3 px-4 font-medium text-gray-700'>Categoria</th>
                    <th className='text-left py-3 px-4 font-medium text-gray-700'>Preço</th>
                    <th className='text-left py-3 px-4 font-medium text-gray-700'>Custo</th>
                    <th className='text-left py-3 px-4 font-medium text-gray-700'>Estoque</th>
                    <th className='text-left py-3 px-4 font-medium text-gray-700'>Status</th>
                    <th className='text-left py-3 px-4 font-medium text-gray-700'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className='border-b border-gray-100 hover:bg-gray-50'>
                      <td className='py-4 px-4'>
                        <div className='flex items-center space-x-3'>
                          <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
                            <FiPackage className='w-5 h-5 text-gray-400' />
                          </div>
                          <div>
                            <p className='font-medium text-gray-900'>{product.name}</p>
                            <p className='text-xs text-gray-500'>Código: {product.barcode}</p>
                          </div>
                        </div>
                      </td>
                      <td className='py-4 px-4 text-gray-600'>{product.category}</td>
                      <td className='py-4 px-4'>
                        <span className='font-medium text-green-600'>
                          R$ {product.price.toFixed(2)}
                        </span>
                      </td>
                      <td className='py-4 px-4'>
                        <span className='text-gray-600'>R$ {product.cost.toFixed(2)}</span>
                      </td>
                      <td className='py-4 px-4'>
                        <span
                          className={`font-medium ${
                            product.stock === 0
                              ? 'text-red-600'
                              : product.stock < 10
                              ? 'text-yellow-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className='py-4 px-4'>{getStatusBadge(product.status, product.stock)}</td>
                      <td className='py-4 px-4'>
                        <div className='flex items-center space-x-2'>
                          <Button
                            size='small'
                            variant='outline'
                            icon={<FiEye className='w-3 h-3' />}
                          />
                          <Button
                            size='small'
                            variant='outline'
                            icon={<FiEdit className='w-3 h-3' />}
                          />
                          <Button
                            size='small'
                            variant='danger'
                            icon={<FiTrash className='w-3 h-3' />}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className='flex items-center justify-between mt-6 pt-4 border-t border-gray-200'>
              <p className='text-sm text-gray-600'>Mostrando 1 a 5 de 127 produtos</p>
              <div className='flex items-center space-x-2'>
                <Button size='small' variant='outline'>
                  Anterior
                </Button>
                <Button size='small' variant='primary'>
                  1
                </Button>
                <Button size='small' variant='outline'>
                  2
                </Button>
                <Button size='small' variant='outline'>
                  3
                </Button>
                <Button size='small' variant='outline'>
                  Próximo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
