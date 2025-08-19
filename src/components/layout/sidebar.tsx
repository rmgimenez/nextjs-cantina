'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import {
  FiBarChart,
  FiCalendar,
  FiClipboard,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiHome,
  FiMenu,
  FiPackage,
  FiPieChart,
  FiSettings,
  FiShield,
  FiShoppingCart,
  FiStar,
  FiTruck,
  FiUserCheck,
  FiUsers,
  FiX,
} from 'react-icons/fi';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  children?: MenuItem[];
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: FiHome,
    href: '/dashboard',
  },
  {
    id: 'pdv',
    label: 'PDV - Vendas',
    icon: FiShoppingCart,
    href: '/dashboard/pdv',
    roles: ['admin', 'atendente'],
  },
  {
    id: 'produtos',
    label: 'Produtos',
    icon: FiPackage,
    href: '/dashboard/produtos',
    children: [
      {
        id: 'produtos-lista',
        label: 'Lista de Produtos',
        icon: FiPackage,
        href: '/dashboard/produtos',
      },
      {
        id: 'produtos-tipos',
        label: 'Tipos de Produtos',
        icon: FiStar,
        href: '/dashboard/produtos/tipos',
      },
    ],
  },
  {
    id: 'estoque',
    label: 'Estoque',
    icon: FiTruck,
    href: '/dashboard/estoque',
    roles: ['admin', 'estoquista'],
    children: [
      {
        id: 'estoque-movimentacao',
        label: 'Movimentação',
        icon: FiTruck,
        href: '/dashboard/estoque/movimentacao',
      },
      {
        id: 'estoque-relatorios',
        label: 'Relatórios',
        icon: FiBarChart,
        href: '/dashboard/estoque/relatorios',
      },
    ],
  },
  {
    id: 'alunos',
    label: 'Alunos',
    icon: FiUsers,
    href: '/dashboard/alunos',
    children: [
      {
        id: 'alunos-saldo',
        label: 'Saldo e Recargas',
        icon: FiDollarSign,
        href: '/dashboard/alunos/saldo',
      },
      {
        id: 'alunos-pacotes',
        label: 'Pacotes de Alimentação',
        icon: FiCalendar,
        href: '/dashboard/alunos/pacotes',
      },
      {
        id: 'alunos-restricoes',
        label: 'Restrições',
        icon: FiShield,
        href: '/dashboard/alunos/restricoes',
      },
      {
        id: 'alunos-historico',
        label: 'Histórico de Compras',
        icon: FiClipboard,
        href: '/dashboard/alunos/historico',
      },
    ],
  },
  {
    id: 'funcionarios',
    label: 'Funcionários Escola',
    icon: FiUserCheck,
    href: '/dashboard/funcionarios',
    children: [
      {
        id: 'funcionarios-conta',
        label: 'Conta Mensal',
        icon: FiCreditCard,
        href: '/dashboard/funcionarios/conta',
      },
      {
        id: 'funcionarios-faturas',
        label: 'Faturas',
        icon: FiFileText,
        href: '/dashboard/funcionarios/faturas',
      },
    ],
  },
  {
    id: 'caixa',
    label: 'Controle de Caixa',
    icon: FiDollarSign,
    href: '/dashboard/caixa',
    roles: ['admin', 'atendente'],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: FiPieChart,
    href: '/dashboard/financeiro',
    roles: ['admin'],
    children: [
      {
        id: 'financeiro-pagar',
        label: 'Contas a Pagar',
        icon: FiCreditCard,
        href: '/dashboard/financeiro/pagar',
      },
      {
        id: 'financeiro-receber',
        label: 'Contas a Receber',
        icon: FiDollarSign,
        href: '/dashboard/financeiro/receber',
      },
    ],
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: FiBarChart,
    href: '/dashboard/relatorios',
    children: [
      {
        id: 'relatorios-vendas',
        label: 'Vendas',
        icon: FiBarChart,
        href: '/dashboard/relatorios/vendas',
      },
      {
        id: 'relatorios-produtos',
        label: 'Produtos',
        icon: FiPackage,
        href: '/dashboard/relatorios/produtos',
      },
      {
        id: 'relatorios-financeiro',
        label: 'Financeiro',
        icon: FiPieChart,
        href: '/dashboard/relatorios/financeiro',
      },
    ],
  },
  {
    id: 'usuarios',
    label: 'Usuários',
    icon: FiUsers,
    href: '/dashboard/usuarios',
    roles: ['admin'],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: FiSettings,
    href: '/dashboard/configuracoes',
    roles: ['admin'],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userRole?: string;
}

export default function Sidebar({ isOpen, onToggle, userRole = 'admin' }: SidebarProps) {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);

  const toggleSubmenu = (itemId: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const hasPermission = (item: MenuItem) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (!hasPermission(item)) return null;

    const isActive = pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isSubmenuOpen = openSubmenus.includes(item.id);

    return (
      <div key={item.id}>
        <div
          className={clsx(
            'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200',
            {
              'bg-blue-100 text-blue-700 border-r-3 border-blue-700': isActive,
              'text-gray-700 hover:bg-gray-100': !isActive,
              'ml-4': level > 0,
            }
          )}
          onClick={hasChildren ? () => toggleSubmenu(item.id) : undefined}
        >
          <Link
            href={item.href}
            className='flex items-center flex-1'
            onClick={(e) => hasChildren && e.preventDefault()}
          >
            <item.icon
              className={clsx('w-5 h-5 mr-3', {
                'text-blue-700': isActive,
                'text-gray-500': !isActive,
              })}
            />
            <span
              className={clsx('font-medium', {
                'opacity-0 w-0': !isOpen && level === 0,
                'opacity-100 w-auto': isOpen || level > 0,
              })}
            >
              {item.label}
            </span>
          </Link>
          {hasChildren && isOpen && (
            <div
              className={clsx('transform transition-transform duration-200', {
                'rotate-180': isSubmenuOpen,
              })}
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          )}
        </div>
        {hasChildren && isSubmenuOpen && isOpen && (
          <div className='mt-1 space-y-1'>
            {item.children?.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={clsx(
        'fixed left-0 top-0 h-full bg-white shadow-xl transition-all duration-300 z-30',
        {
          'w-64': isOpen,
          'w-16': !isOpen,
        }
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-200'>
        <div
          className={clsx('flex items-center', {
            'opacity-0': !isOpen,
            'opacity-100': isOpen,
          })}
        >
          <div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>C</span>
          </div>
          <div className='ml-3'>
            <h1 className='text-lg font-bold text-gray-800'>Sistema Cantina</h1>
            <p className='text-xs text-gray-500'>ERP Cantina Escolar</p>
          </div>
        </div>
        <button onClick={onToggle} className='p-2 rounded-lg hover:bg-gray-100 transition-colors'>
          {isOpen ? (
            <FiX className='w-5 h-5 text-gray-600' />
          ) : (
            <FiMenu className='w-5 h-5 text-gray-600' />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <div className='p-4 space-y-2 overflow-y-auto h-full pb-20'>
        {menuItems.map((item) => renderMenuItem(item))}
      </div>
    </div>
  );
}
