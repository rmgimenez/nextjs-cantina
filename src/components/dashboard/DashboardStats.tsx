'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  FiActivity,
  FiAlertCircle,
  FiBox,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiPackage,
  FiShoppingCart,
  FiTarget,
  FiTrendingDown,
  FiTrendingUp,
  FiUserCheck,
} from 'react-icons/fi';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color?: string;
}

function StatCard({ title, value, change, changeType, icon, color = '#253287' }: StatCardProps) {
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

  const gradientBg = {
    '#253287': 'from-blue-600 to-blue-800',
    '#B20000': 'from-red-600 to-red-800',
    '#FEA800': 'from-yellow-500 to-yellow-700',
    '#333333': 'from-gray-600 to-gray-800',
  };

  return (
    <Card className='kpi-card hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-2 dashboard-interactive'>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <p className='text-sm font-medium text-gray-600 mb-2 opacity-80'>{title}</p>
            <p className='text-3xl font-bold text-gray-900 mb-3 tracking-tight'>{value}</p>
            <div
              className={`flex items-center text-sm font-medium ${changeColor[changeType]} bg-opacity-10 px-2 py-1 rounded-full`}
            >
              {changeIcon[changeType]}
              <span className='ml-1'>{change}</span>
            </div>
          </div>
          <div
            className={`rounded-xl p-4 flex items-center justify-center bg-gradient-to-br ${
              gradientBg[color as keyof typeof gradientBg] || 'from-blue-600 to-blue-800'
            } shadow-lg transform hover:scale-105 transition-transform duration-200`}
            style={{ backgroundColor: color }}
          >
            <div className='text-2xl text-white drop-shadow-sm'>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  userRole: string;
  vendasData: any;
  estoqueData: any;
  financeiroData: any;
  alunosData: any;
}

export default function DashboardStats({
  userRole,
  vendasData = {},
  estoqueData = {},
  financeiroData = {},
  alunosData = {},
}: DashboardStatsProps) {
  const generateStatsByRole = () => {
    const role = userRole.toUpperCase();

    if (role === 'ADMIN') {
      return [
        {
          title: 'Receita Hoje',
          value: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(financeiroData.receitaDiaria || 0),
          change: '+12%',
          changeType: 'positive' as const,
          icon: <FiDollarSign className='w-8 h-8' />,
          color: '#253287',
        },
        {
          title: 'Vendas Hoje',
          value: String(vendasData.totalVendas || 0),
          change: '+8%',
          changeType: 'positive' as const,
          icon: <FiShoppingCart className='w-8 h-8' />,
          color: '#FEA800',
        },
        {
          title: 'Produtos Críticos',
          value: String(estoqueData.produtosCriticos || 0),
          change: estoqueData.produtosCriticos > 0 ? 'Atenção' : 'OK',
          changeType:
            estoqueData.produtosCriticos > 0 ? ('negative' as const) : ('positive' as const),
          icon: <FiAlertCircle className='w-8 h-8' />,
          color: '#B20000',
        },
        {
          title: 'Contas a Pagar',
          value: String(financeiroData.contasPagar?.total || 0),
          change:
            financeiroData.contasPagar?.vencendo > 0
              ? `${financeiroData.contasPagar.vencendo} vencendo`
              : 'Em dia',
          changeType:
            financeiroData.contasPagar?.vencendo > 0
              ? ('negative' as const)
              : ('positive' as const),
          icon: <FiCreditCard className='w-8 h-8' />,
          color: '#333333',
        },
      ];
    } else if (role === 'ESTOQUISTA') {
      return [
        {
          title: 'Itens em Falta',
          value: String(estoqueData.produtosCriticos || 0),
          change: estoqueData.produtosCriticos > 0 ? 'Crítico' : 'OK',
          changeType:
            estoqueData.produtosCriticos > 0 ? ('negative' as const) : ('positive' as const),
          icon: <FiAlertCircle className='w-8 h-8' />,
          color: '#B20000',
        },
        {
          title: 'Estoque Baixo',
          value: String(estoqueData.produtosBaixo || 0),
          change: estoqueData.produtosBaixo > 0 ? 'Atenção' : 'OK',
          changeType: estoqueData.produtosBaixo > 0 ? ('neutral' as const) : ('positive' as const),
          icon: <FiPackage className='w-8 h-8' />,
          color: '#FEA800',
        },
        {
          title: 'Movimentações Hoje',
          value: String(estoqueData.movimentacoesHoje || 0),
          change: '+15%',
          changeType: 'positive' as const,
          icon: <FiActivity className='w-8 h-8' />,
          color: '#253287',
        },
        {
          title: 'Valor em Estoque',
          value: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(estoqueData.valorEstoque || 0),
          change: '+2%',
          changeType: 'positive' as const,
          icon: <FiBox className='w-8 h-8' />,
          color: '#333333',
        },
      ];
    } else {
      // Atendente
      return [
        {
          title: 'Vendas Hoje',
          value: String(vendasData.totalVendas || 0),
          change: '+15%',
          changeType: 'positive' as const,
          icon: <FiShoppingCart className='w-8 h-8' />,
          color: '#253287',
        },
        {
          title: 'Receita Hoje',
          value: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(financeiroData.receitaDiaria || 0),
          change: '+8%',
          changeType: 'positive' as const,
          icon: <FiDollarSign className='w-8 h-8' />,
          color: '#FEA800',
        },
        {
          title: 'Clientes Atendidos',
          value: String(alunosData.alunosAtendidos || 0),
          change: '+12%',
          changeType: 'positive' as const,
          icon: <FiUserCheck className='w-8 h-8' />,
          color: '#333333',
        },
        {
          title: 'Ticket Médio',
          value:
            vendasData.totalVendas > 0
              ? new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format((financeiroData.receitaDiaria || 0) / vendasData.totalVendas)
              : 'R$ 0,00',
          change: '+5%',
          changeType: 'positive' as const,
          icon: <FiTarget className='w-8 h-8' />,
          color: '#B20000',
        },
      ];
    }
  };

  const stats = generateStatsByRole();

  return (
    <div className='row g-4 mb-5'>
      {stats.map((stat, index) => (
        <div key={index} className='col-12 col-sm-6 col-lg-3'>
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
}
