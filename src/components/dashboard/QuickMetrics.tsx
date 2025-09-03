'use client';

import {
  FiActivity,
  FiAlertCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiPackage,
  FiShoppingCart,
  FiTarget,
  FiTrendingDown,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi';

interface Metric {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  color: string;
}

interface QuickMetricsProps {
  userRole: string;
  vendasData: any;
  estoqueData: any;
  financeiroData: any;
  alunosData: any;
}

export default function QuickMetrics({
  userRole,
  vendasData = {},
  estoqueData = {},
  financeiroData = {},
  alunosData = {},
}: QuickMetricsProps) {
  const generateMetricsByRole = (): Metric[] => {
    const role = userRole.toUpperCase();

    if (role === 'ADMIN') {
      return [
        {
          icon: <FiDollarSign className='w-6 h-6' />,
          label: 'Receita Mensal',
          value: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format((financeiroData.receitaDiaria || 0) * 30), // Estimativa mensal
          change: '+12%',
          changeType: 'positive',
          color: '#253287',
        },
        {
          icon: <FiUsers className='w-6 h-6' />,
          label: 'Alunos Ativos',
          value: '1.247', // Dado estático por enquanto
          change: '+5%',
          changeType: 'positive',
          color: '#FEA800',
        },
        {
          icon: <FiCreditCard className='w-6 h-6' />,
          label: 'Contas Pendentes',
          value: String(financeiroData.contasPagar?.total || 0),
          change:
            financeiroData.contasPagar?.atrasadas > 0
              ? `-${financeiroData.contasPagar.atrasadas}`
              : '0',
          changeType: financeiroData.contasPagar?.atrasadas > 0 ? 'negative' : 'positive',
          color: '#B20000',
        },
      ];
    } else if (role === 'ESTOQUISTA') {
      return [
        {
          icon: <FiPackage className='w-6 h-6' />,
          label: 'Produtos em Estoque',
          value: String(estoqueData.totalProdutos || 0),
          change: '+3',
          changeType: 'positive',
          color: '#253287',
        },
        {
          icon: <FiAlertCircle className='w-6 h-6' />,
          label: 'Alertas de Estoque',
          value: String((estoqueData.produtosCriticos || 0) + (estoqueData.produtosBaixo || 0)),
          change: (estoqueData.produtosCriticos || 0) > 0 ? 'Crítico' : 'OK',
          changeType: (estoqueData.produtosCriticos || 0) > 0 ? 'negative' : 'positive',
          color: '#FEA800',
        },
        {
          icon: <FiActivity className='w-6 h-6' />,
          label: 'Movimentações Hoje',
          value: String(estoqueData.movimentacoesHoje || 0),
          change: '+15%',
          changeType: 'positive',
          color: '#333333',
        },
      ];
    } else {
      // Atendente
      return [
        {
          icon: <FiShoppingCart className='w-6 h-6' />,
          label: 'Vendas Hoje',
          value: String(vendasData.totalVendas || 0),
          change: '+8%',
          changeType: 'positive',
          color: '#253287',
        },
        {
          icon: <FiTarget className='w-6 h-6' />,
          label: 'Ticket Médio',
          value:
            vendasData.totalVendas > 0
              ? new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format((financeiroData.receitaDiaria || 0) / vendasData.totalVendas)
              : 'R$ 0,00',
          change: '+5%',
          changeType: 'positive',
          color: '#FEA800',
        },
        {
          icon: <FiUserCheck className='w-6 h-6' />,
          label: 'Clientes Atendidos',
          value: String(alunosData.alunosAtendidos || 0),
          change: '+12%',
          changeType: 'positive',
          color: '#B20000',
        },
      ];
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return <FiTrendingUp className='w-3 h-3 mr-1' />;
      case 'negative':
        return <FiTrendingDown className='w-3 h-3 mr-1' />;
      default:
        return <FiClock className='w-3 h-3 mr-1' />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const metrics = generateMetricsByRole();

  return (
    <div className='mt-6'>
      <h5 className='text-gray-800 font-semibold mb-4 flex items-center'>
        <FiActivity className='w-5 h-5 mr-2 text-[#253287]' />
        Métricas Rápidas
      </h5>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {metrics.map((metric, index) => (
          <div
            key={index}
            className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1'
          >
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-600 mb-2'>{metric.label}</p>
                <p className='text-2xl font-bold text-gray-900 mb-2'>{metric.value}</p>
                <div
                  className={`flex items-center text-sm font-medium ${getChangeColor(
                    metric.changeType
                  )}`}
                >
                  {getChangeIcon(metric.changeType)}
                  <span>{metric.change}</span>
                </div>
              </div>
              <div
                className='w-14 h-14 rounded-xl flex items-center justify-center shadow-md'
                style={{ backgroundColor: `${metric.color}15` }}
              >
                <div style={{ color: metric.color }}>{metric.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
