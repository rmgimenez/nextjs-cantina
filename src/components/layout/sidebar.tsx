'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import {
  FiBarChart,
  FiCalendar,
  FiChevronDown,
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

    const Icon = item.icon as React.ComponentType<any>;

    return (
      <div key={item.id}>
        <div
          onClick={hasChildren ? () => toggleSubmenu(item.id) : undefined}
          className={clsx('d-flex align-items-center justify-content-between p-2 rounded', {
            'sidebar-active-item': isActive,
            'brand-surface': isActive,
          })}
          style={{ cursor: 'pointer', marginLeft: level > 0 ? 12 : 0 }}
        >
          <Link
            href={item.href}
            className='d-flex align-items-center flex-grow-1 text-decoration-none text-dark'
            onClick={(e) => hasChildren && e.preventDefault()}
            title={!isOpen && level === 0 ? item.label : undefined}
          >
            <Icon size={18} className={clsx({ 'text-primary': isActive })} />
            {(isOpen || level > 0) && <span className='ms-2'>{item.label}</span>}
          </Link>

          {hasChildren && isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSubmenu(item.id);
              }}
              className='btn btn-sm btn-light'
              aria-expanded={isSubmenuOpen}
              aria-label={isSubmenuOpen ? 'Fechar submenu' : 'Abrir submenu'}
            >
              <FiChevronDown
                size={14}
                style={{ transform: isSubmenuOpen ? 'rotate(180deg)' : undefined }}
              />
            </button>
          )}
        </div>

        {hasChildren && isSubmenuOpen && isOpen && (
          <div className='mt-1 ps-3'>
            {item.children?.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={clsx('h-100 bg-white shadow-sm transition flex-shrink-0', {
        'sidebar-open': isOpen,
      })}
      // tornar o aside posicionado e com z-index alto para que o botão de toggle
      // continue acessível mesmo quando o conteúdo principal (Header) estiver sobreposto
      style={{ position: 'relative', zIndex: 1060, width: isOpen ? 260 : 64, minHeight: '100vh' }}
    >
      {/* Header */}
      <div className='d-flex align-items-center justify-content-between p-3 border-bottom'>
        <div className={clsx('d-flex align-items-center', { 'opacity-0': !isOpen })}>
          <div
            className='d-flex align-items-center justify-content-center bg-primary rounded me-2'
            style={{ width: 40, height: 40 }}
          >
            <span className='text-white fw-bold'>C</span>
          </div>
          <div className='d-none d-md-block'>
            <h6 className='mb-0 fw-bold text-dark'>Sistema Cantina</h6>
            <small className='text-muted'>ERP Cantina Escolar</small>
          </div>
        </div>
        <button onClick={onToggle} className='btn btn-light btn-sm'>
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Menu Items */}
      <div className='p-2 overflow-auto' style={{ height: 'calc(100vh - 72px)' }}>
        <ul className='list-unstyled m-0'>
          {menuItems.map((item) => (
            <li key={item.id} className='mb-1'>
              {renderMenuItem(item)}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
