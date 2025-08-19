import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FiAlertCircle,
  FiClock,
  FiDollarSign,
  FiPackage,
  FiShoppingCart,
  FiTrendingDown,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const changeIcon = {
    positive: <FiTrendingUp className='w-3 h-3' />,
    negative: <FiTrendingDown className='w-3 h-3' />,
    neutral: <FiClock className='w-3 h-3' />,
  };

  return (
    <Card>
      <CardContent className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='text-2xl font-bold text-gray-900'>{value}</p>
          <div className={`flex items-center mt-1 text-sm ${changeColor[changeType]}`}>
            {changeIcon[changeType]}
            <span className='ml-1'>{change}</span>
          </div>
        </div>
        <div className='text-blue-600'>{icon}</div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const stats = [
    {
      title: 'Vendas Hoje',
      value: 'R$ 1.247,50',
      change: '+12% vs ontem',
      changeType: 'positive' as const,
      icon: <FiDollarSign className='w-8 h-8' />,
    },
    {
      title: 'Transações',
      value: '89',
      change: '+5% vs ontem',
      changeType: 'positive' as const,
      icon: <FiShoppingCart className='w-8 h-8' />,
    },
    {
      title: 'Alunos Atendidos',
      value: '245',
      change: '+8% vs ontem',
      changeType: 'positive' as const,
      icon: <FiUsers className='w-8 h-8' />,
    },
    {
      title: 'Produtos em Falta',
      value: '3',
      change: '-2 vs ontem',
      changeType: 'negative' as const,
      icon: <FiPackage className='w-8 h-8' />,
    },
  ];

  const recentSales = [
    { id: 1, student: 'João Silva', amount: 'R$ 15,50', time: '14:32', items: '2 itens' },
    { id: 2, student: 'Maria Santos', amount: 'R$ 8,00', time: '14:28', items: '1 item' },
    { id: 3, student: 'Pedro Costa', amount: 'R$ 22,30', time: '14:25', items: '3 itens' },
    { id: 4, student: 'Ana Oliveira', amount: 'R$ 12,75', time: '14:20', items: '2 itens' },
    { id: 5, student: 'Carlos Lima', amount: 'R$ 18,90', time: '14:18', items: '2 itens' },
  ];

  const lowStockProducts = [
    { name: 'Refrigerante Coca-Cola 350ml', stock: 5, min: 20, status: 'critical' },
    { name: 'Suco de Laranja 200ml', stock: 8, min: 15, status: 'warning' },
    { name: 'Pão de Açúcar', stock: 12, min: 25, status: 'warning' },
  ];

  const alerts = [
    { type: 'error', message: 'Caixa com diferença de R$ 5,00 ontem', time: '1h atrás' },
    { type: 'warning', message: 'Estoque baixo: 3 produtos', time: '2h atrás' },
    { type: 'info', message: 'Backup automático realizado', time: '4h atrás' },
  ];

  return (
    <DashboardLayout title='Dashboard' subtitle='Visão geral das operações da cantina'>
      <div className='space-y-6'>
        {/* Cards de Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Conteúdo Principal */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Vendas Recentes */}
          <div className='lg:col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle>Vendas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {recentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className='flex items-center justify-between py-2 border-b border-gray-100 last:border-0'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                          <span className='text-blue-600 font-semibold text-sm'>
                            {sale.student.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className='font-medium text-gray-900'>{sale.student}</p>
                          <p className='text-sm text-gray-500'>{sale.items}</p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold text-gray-900'>{sale.amount}</p>
                        <p className='text-sm text-gray-500'>{sale.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='mt-4 pt-4 border-t border-gray-200'>
                  <button className='text-blue-600 hover:text-blue-700 font-medium text-sm'>
                    Ver todas as vendas →
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas e Estoque Baixo */}
          <div className='space-y-6'>
            {/* Alertas */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <FiAlertCircle className='w-5 h-5 mr-2 text-yellow-500' />
                  Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {alerts.map((alert, index) => (
                    <div key={index} className='flex items-start space-x-3'>
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          alert.type === 'error'
                            ? 'bg-red-500'
                            : alert.type === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                      ></div>
                      <div className='flex-1'>
                        <p className='text-sm text-gray-900'>{alert.message}</p>
                        <p className='text-xs text-gray-500'>{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estoque Baixo */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <FiPackage className='w-5 h-5 mr-2 text-red-500' />
                  Estoque Baixo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {lowStockProducts.map((product, index) => (
                    <div key={index} className='border-l-4 border-l-red-400 pl-3'>
                      <p className='font-medium text-gray-900 text-sm'>{product.name}</p>
                      <div className='flex items-center justify-between mt-1'>
                        <span className='text-xs text-gray-500'>
                          Estoque: {product.stock} | Mín: {product.min}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            product.status === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {product.status === 'critical' ? 'Crítico' : 'Baixo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='mt-4 pt-4 border-t border-gray-200'>
                  <button className='text-blue-600 hover:text-blue-700 font-medium text-sm'>
                    Ver estoque completo →
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gráficos e Métricas Adicionais */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>Vendas da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-64 flex items-center justify-center text-gray-500'>
                <div className='text-center'>
                  <FiTrendingUp className='w-12 h-12 mx-auto mb-2 opacity-50' />
                  <p>Gráfico de vendas será implementado</p>
                  <p className='text-sm'>Com Chart.js ou Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Pão de Açúcar</span>
                  <span className='text-sm text-gray-500'>45 vendas</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div className='bg-blue-600 h-2 rounded-full' style={{ width: '90%' }}></div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Refrigerante Coca-Cola</span>
                  <span className='text-sm text-gray-500'>32 vendas</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div className='bg-blue-600 h-2 rounded-full' style={{ width: '64%' }}></div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Suco de Laranja</span>
                  <span className='text-sm text-gray-500'>28 vendas</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div className='bg-blue-600 h-2 rounded-full' style={{ width: '56%' }}></div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Coxinha</span>
                  <span className='text-sm text-gray-500'>25 vendas</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div className='bg-blue-600 h-2 rounded-full' style={{ width: '50%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
