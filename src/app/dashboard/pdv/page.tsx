import DashboardLayout from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  FiCreditCard,
  FiMinus,
  FiPlus,
  FiSearch,
  FiShoppingCart,
  FiTrash,
  FiUser,
} from 'react-icons/fi';

export default function PDVPage() {
  return (
    <DashboardLayout title='PDV - Ponto de Venda' subtitle='Sistema de vendas da cantina'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Área de Produtos */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Busca de Produtos */}
          <Card>
            <CardContent className='pt-6'>
              <div className='flex space-x-4'>
                <div className='flex-1'>
                  <Input
                    placeholder='Buscar produtos por nome ou código...'
                    icon={<FiSearch className='w-4 h-4' />}
                    iconPosition='left'
                  />
                </div>
                <Button variant='primary'>Buscar</Button>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Produtos */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {[
                  { id: 1, name: 'Coxinha', price: 4.5, category: 'Salgados', stock: 25 },
                  { id: 2, name: 'Coca-Cola 350ml', price: 5.0, category: 'Bebidas', stock: 15 },
                  { id: 3, name: 'Pão de Açúcar', price: 3.0, category: 'Doces', stock: 30 },
                  { id: 4, name: 'Suco de Laranja', price: 4.0, category: 'Bebidas', stock: 20 },
                  { id: 5, name: 'Brigadeiro', price: 2.5, category: 'Doces', stock: 40 },
                  { id: 6, name: 'Pastel de Queijo', price: 5.5, category: 'Salgados', stock: 18 },
                  { id: 7, name: 'Água 500ml', price: 2.0, category: 'Bebidas', stock: 50 },
                  { id: 8, name: 'Bolo de Chocolate', price: 6.0, category: 'Doces', stock: 12 },
                ].map((product) => (
                  <div
                    key={product.id}
                    className='bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer'
                  >
                    <div className='aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center'>
                      <span className='text-gray-400 text-xs'>Sem imagem</span>
                    </div>
                    <h3 className='font-medium text-sm text-gray-900 mb-1'>{product.name}</h3>
                    <p className='text-xs text-gray-500 mb-2'>{product.category}</p>
                    <div className='flex items-center justify-between'>
                      <span className='font-bold text-green-600'>
                        R$ {product.price.toFixed(2)}
                      </span>
                      <span className='text-xs text-gray-500'>Est: {product.stock}</span>
                    </div>
                    <Button
                      size='small'
                      variant='primary'
                      className='w-full mt-2'
                      icon={<FiPlus className='w-3 h-3' />}
                      iconPosition='left'
                    >
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carrinho e Checkout */}
        <div className='space-y-6'>
          {/* Identificação do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <FiUser className='w-5 h-5 mr-2' />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <Input
                  placeholder='RA do aluno ou CPF do funcionário'
                  icon={<FiSearch className='w-4 h-4' />}
                  iconPosition='left'
                />
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center'>
                      <span className='text-white font-bold'>JS</span>
                    </div>
                    <div>
                      <p className='font-medium text-gray-900'>João Silva</p>
                      <p className='text-sm text-gray-600'>Aluno - RA: 12345</p>
                      <p className='text-sm text-green-600 font-medium'>Saldo: R$ 125,50</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carrinho */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <FiShoppingCart className='w-5 h-5 mr-2' />
                Carrinho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {[
                  { id: 1, name: 'Coxinha', price: 4.5, qty: 2 },
                  { id: 2, name: 'Coca-Cola 350ml', price: 5.0, qty: 1 },
                ].map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center justify-between py-2 border-b border-gray-100'
                  >
                    <div className='flex-1'>
                      <p className='font-medium text-sm'>{item.name}</p>
                      <p className='text-xs text-gray-500'>R$ {item.price.toFixed(2)} cada</p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button size='small' variant='outline'>
                        <FiMinus className='w-3 h-3' />
                      </Button>
                      <span className='text-sm font-medium w-8 text-center'>{item.qty}</span>
                      <Button size='small' variant='outline'>
                        <FiPlus className='w-3 h-3' />
                      </Button>
                      <Button size='small' variant='danger'>
                        <FiTrash className='w-3 h-3' />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className='pt-3 border-t border-gray-200'>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium'>Total:</span>
                    <span className='text-xl font-bold text-green-600'>R$ 14,00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forma de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <FiCreditCard className='w-5 h-5 mr-2' />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='grid grid-cols-2 gap-2'>
                  <Button variant='outline' className='flex-col h-16'>
                    <FiUser className='w-5 h-5 mb-1' />
                    <span className='text-xs'>Saldo Aluno</span>
                  </Button>
                  <Button variant='outline' className='flex-col h-16'>
                    <FiCreditCard className='w-5 h-5 mb-1' />
                    <span className='text-xs'>Dinheiro</span>
                  </Button>
                </div>
                <Button
                  variant='success'
                  size='large'
                  className='w-full'
                  icon={<FiShoppingCart className='w-4 h-4' />}
                >
                  Finalizar Venda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
