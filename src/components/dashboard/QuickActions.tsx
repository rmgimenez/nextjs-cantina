'use client';

import {
  FiAlertCircle,
  FiBarChart,
  FiBox,
  FiCreditCard,
  FiPackage,
  FiShoppingCart,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
  description?: string;
}

interface QuickActionsProps {
  userRole: string;
}

export default function QuickActions({ userRole }: QuickActionsProps) {
  const generateActionsByRole = (): QuickAction[] => {
    const role = userRole.toUpperCase();

    if (role === 'ADMIN') {
      return [
        {
          icon: <FiUsers className='w-6 h-6' />,
          label: 'Gerenciar Usuários',
          href: '/dashboard/usuarios',
          color: '#253287',
          description: 'Criar e gerenciar funcionários da cantina',
        },
        {
          icon: <FiBarChart className='w-6 h-6' />,
          label: 'Relatórios',
          href: '/dashboard/relatorios',
          color: '#FEA800',
          description: 'Relatórios de vendas e performance',
        },
        {
          icon: <FiCreditCard className='w-6 h-6' />,
          label: 'Financeiro',
          href: '/dashboard/financeiro',
          color: '#333333',
          description: 'Contas a pagar e receber',
        },
        {
          icon: <FiPackage className='w-6 h-6' />,
          label: 'Estoque',
          href: '/dashboard/estoque',
          color: '#B20000',
          description: 'Controle de produtos e movimentações',
        },
      ];
    } else if (role === 'ESTOQUISTA') {
      return [
        {
          icon: <FiPackage className='w-6 h-6' />,
          label: 'Movimentar Estoque',
          href: '/dashboard/estoque/movimentacao',
          color: '#253287',
          description: 'Registrar entrada e saída de produtos',
        },
        {
          icon: <FiBox className='w-6 h-6' />,
          label: 'Produtos',
          href: '/dashboard/produtos',
          color: '#FEA800',
          description: 'Cadastrar e gerenciar produtos',
        },
        {
          icon: <FiBarChart className='w-6 h-6' />,
          label: 'Relatórios',
          href: '/dashboard/estoque/relatorios',
          color: '#333333',
          description: 'Relatórios de estoque e movimentação',
        },
        {
          icon: <FiAlertCircle className='w-6 h-6' />,
          label: 'Alertas',
          href: '/dashboard/estoque',
          color: '#B20000',
          description: 'Produtos em falta ou com baixo estoque',
        },
      ];
    } else {
      // Atendente
      return [
        {
          icon: <FiShoppingCart className='w-6 h-6' />,
          label: 'Nova Venda',
          href: '/dashboard/pdv',
          color: '#253287',
          description: 'Realizar nova venda no PDV',
        },
        {
          icon: <FiUserCheck className='w-6 h-6' />,
          label: 'Alunos',
          href: '/dashboard/alunos',
          color: '#FEA800',
          description: 'Consultar saldo e histórico',
        },
        {
          icon: <FiCreditCard className='w-6 h-6' />,
          label: 'Caixa',
          href: '/dashboard/pdv',
          color: '#333333',
          description: 'Controle de caixa e vendas',
        },
        {
          icon: <FiBarChart className='w-6 h-6' />,
          label: 'Relatórios',
          href: '/dashboard/relatorios',
          color: '#B20000',
          description: 'Relatórios de vendas do dia',
        },
      ];
    }
  };

  const actions = generateActionsByRole();

  return (
    <div className='mb-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {actions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            className='dashboard-action-btn group block p-6 bg-white rounded-xl shadow-sm border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-decoration-none'
          >
            <div className='flex flex-col items-center text-center'>
              <div
                className='w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg'
                style={{
                  background: `linear-gradient(135deg, ${action.color}20, ${action.color}10)`,
                  border: `2px solid ${action.color}30`,
                }}
              >
                <div style={{ color: action.color }} className='drop-shadow-sm'>
                  {action.icon}
                </div>
              </div>
              <span className='text-sm font-semibold text-gray-700 group-hover:text-gray-900 mb-2 leading-tight'>
                {action.label}
              </span>
              {action.description && (
                <span className='text-xs text-gray-500 group-hover:text-gray-600 text-center leading-relaxed'>
                  {action.description}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
