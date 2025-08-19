'use client';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
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

interface DashboardData {
  stats: StatCardProps[];
  recentSales: any[];
  lowStockProducts: any[];
  topProducts: any[];
  alerts: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Buscar todas as APIs em paralelo
        const [statsRes, salesRes, stockRes, productsRes, alertsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/recent-sales'),
          fetch('/api/dashboard/low-stock'),
          fetch('/api/dashboard/top-products'),
          fetch('/api/dashboard/alerts'),
        ]);

        // Verificar se todas as requisições foram bem-sucedidas
        if (!statsRes.ok || !salesRes.ok || !stockRes.ok || !productsRes.ok || !alertsRes.ok) {
          throw new Error('Erro ao buscar dados do dashboard');
        }

        const [stats, recentSales, lowStockProducts, topProducts, alerts] = await Promise.all([
          statsRes.json(),
          salesRes.json(),
          stockRes.json(),
          productsRes.json(),
          alertsRes.json(),
        ]);

        // Adicionar ícones às estatísticas
        const statsWithIcons = stats.map((stat: any, index: number) => {
          const icons = [
            <FiDollarSign key='dollar' className='w-8 h-8' />,
            <FiShoppingCart key='cart' className='w-8 h-8' />,
            <FiUsers key='users' className='w-8 h-8' />,
            <FiPackage key='package' className='w-8 h-8' />,
          ];
          return {
            ...stat,
            icon: icons[index] || <FiDollarSign className='w-8 h-8' />,
          };
        });

        setData({
          stats: statsWithIcons,
          recentSales,
          lowStockProducts,
          topProducts,
          alerts,
        });
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <DashboardLayout title='Dashboard' subtitle='Carregando...'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Carregando dados do dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout title='Dashboard' subtitle='Erro ao carregar dados'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <FiAlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
            <p className='text-red-600 mb-4'>{error || 'Erro desconhecido'}</p>
            <button
              onClick={() => window.location.reload()}
              className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title='Dashboard' subtitle='Visão geral das operações da cantina'>
      <div className='space-y-6'>
        {/* Estatísticas - usar grid do Bootstrap para responsividade consistente */}
        <div className='row g-3 mb-4'>
          {data.stats.map((stat: any, index: number) => (
            <div key={index} className='col-12 col-md-6 col-lg-3'>
              <StatCard {...stat} />
            </div>
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
                  {data.recentSales.length > 0 ? (
                    data.recentSales.map((sale: any) => (
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
                    ))
                  ) : (
                    <div className='text-center text-gray-500 py-8'>
                      <FiShoppingCart className='w-12 h-12 mx-auto mb-2 opacity-50' />
                      <p>Nenhuma venda registrada hoje</p>
                    </div>
                  )}
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
                  {data.alerts.length > 0 ? (
                    data.alerts.map((alert: any, index: number) => (
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
                    ))
                  ) : (
                    <div className='text-center text-gray-500 py-4'>
                      <FiAlertCircle className='w-8 h-8 mx-auto mb-2 opacity-50' />
                      <p className='text-sm'>Nenhum alerta no momento</p>
                    </div>
                  )}
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
                  {data.lowStockProducts.length > 0 ? (
                    data.lowStockProducts.map((product: any, index: number) => (
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
                    ))
                  ) : (
                    <div className='text-center text-gray-500 py-4'>
                      <FiPackage className='w-8 h-8 mx-auto mb-2 opacity-50' />
                      <p className='text-sm'>Todos os produtos com estoque adequado</p>
                    </div>
                  )}
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
                {data.topProducts.map((product: any, index: number) => (
                  <div key={index}>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>{product.name}</span>
                      <span className='text-sm text-gray-500'>{product.sales} vendas</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full'
                        style={{ width: `${product.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {data.topProducts.length === 0 && (
                  <div className='text-center text-gray-500 py-4'>
                    <p>Nenhuma venda registrada nos últimos 7 dias</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
