'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  nome: string;
  perfil: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  permission?: number[]; // IDs dos perfis que podem acessar
  children?: MenuItem[];
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (data.authenticated) {
          setUser(data.user);
        } else {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/login');
        return;
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  // Auto-expand menu baseado na rota atual
  useEffect(() => {
    const newExpandedMenus = new Set<string>();

    menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => isActive(child.path));
        if (hasActiveChild) {
          newExpandedMenus.add(item.id);
        }
      }
    });

    setExpandedMenus(newExpandedMenus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const toggleSubmenu = (menuId: string, hasChildren: boolean) => {
    if (!hasChildren) return;

    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/',
      permission: [1, 2], // Admin e Operador
    },
    {
      id: 'caixa',
      label: 'Caixa',
      icon: '💰',
      path: '/caixa',
      permission: [1, 2], // Admin e Operador
    },
    {
      id: 'vendas',
      label: 'Vendas',
      icon: '🛒',
      path: '/vendas',
      permission: [1, 2],
      children: [
        {
          id: 'pdv',
          label: 'PDV',
          icon: '💰',
          path: '/vendas/pdv',
          permission: [1, 2],
        },
        {
          id: 'historico-vendas',
          label: 'Histórico de Vendas',
          icon: '📋',
          path: '/vendas/historico',
          permission: [1, 2],
        },
      ],
    },
    {
      id: 'produtos',
      label: 'Produtos',
      icon: '📦',
      path: '/produtos',
      permission: [1, 2],
      children: [
        {
          id: 'cadastro-produtos',
          label: 'Cadastro de Produtos',
          icon: '➕',
          path: '/produtos',
          permission: [1, 2],
        },
        {
          id: 'tipos-produtos',
          label: 'Tipos de Produtos',
          icon: '🏷️',
          path: '/produtos/tipos',
          permission: [1, 2],
        },
      ],
    },
    {
      id: 'estoque',
      label: 'Estoque',
      icon: '📦',
      path: '/estoque',
      permission: [1, 2],
      children: [
        {
          id: 'controle-estoque',
          label: 'Controle de Estoque',
          icon: '📊',
          path: '/estoque',
          permission: [1, 2],
        },
        {
          id: 'movimentacoes',
          label: 'Movimentações',
          icon: '🔄',
          path: '/estoque/movimentacoes',
          permission: [1, 2],
        },
      ],
    },
    {
      id: 'alunos',
      label: 'Alunos',
      icon: '👨‍🎓',
      path: '/alunos',
      permission: [1, 2],
      children: [
        {
          id: 'contas-alunos',
          label: 'Contas dos Alunos',
          icon: '💳',
          path: '/alunos/contas',
          permission: [1, 2],
        },
        {
          id: 'historico-aluno',
          label: 'Histórico do Aluno',
          icon: '📊',
          path: '/alunos/historico',
          permission: [1, 2],
        },
        {
          id: 'restricoes',
          label: 'Restrições',
          icon: '🚫',
          path: '/alunos/restricoes',
          permission: [1, 2],
        },
        {
          id: 'pacotes',
          label: 'Pacotes de Alimentação',
          icon: '📦',
          path: '/alunos/pacotes',
          permission: [1, 2],
        },
      ],
    },
    {
      id: 'funcionarios',
      label: 'Funcionários',
      icon: '👥',
      path: '/funcionarios',
      permission: [1, 2],
      children: [
        {
          id: 'funcionarios-cantina',
          label: 'Funcionários da Cantina',
          icon: '👨‍💼',
          path: '/funcionarios-cantina',
          permission: [1], // Apenas Admin
        },
        {
          id: 'funcionarios-escola',
          label: 'Funcionários da Escola',
          icon: '👨‍🏫',
          path: '/funcionarios-escola',
          permission: [1, 2],
        },
      ],
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: '📊',
      path: '/relatorios',
      permission: [1, 2],
      children: [
        {
          id: 'relatorio-vendas',
          label: 'Relatório de Vendas',
          icon: '💰',
          path: '/relatorios/vendas',
          permission: [1, 2],
        },
        {
          id: 'relatorio-consumo',
          label: 'Relatório de Consumo',
          icon: '📈',
          path: '/relatorios/consumo',
          permission: [1, 2],
        },
        {
          id: 'relatorio-estoque',
          label: 'Relatório de Estoque',
          icon: '📦',
          path: '/relatorios/estoque',
          permission: [1, 2],
        },
      ],
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      icon: '💰',
      path: '/financeiro',
      permission: [1], // Apenas Admin
      children: [
        {
          id: 'dashboard-financeiro',
          label: 'Dashboard Financeiro',
          icon: '📊',
          path: '/financeiro/dashboard',
          permission: [1],
        },
        {
          id: 'fornecedores',
          label: 'Fornecedores',
          icon: '🏢',
          path: '/financeiro/fornecedores',
          permission: [1],
        },
        {
          id: 'contas-pagar',
          label: 'Contas a Pagar',
          icon: '📤',
          path: '/financeiro/contas-pagar',
          permission: [1],
        },
        {
          id: 'contas-receber',
          label: 'Contas a Receber',
          icon: '📥',
          path: '/financeiro/contas-receber',
          permission: [1],
        },
        {
          id: 'contas-funcionarios',
          label: 'Contas de Funcionários',
          icon: '💳',
          path: '/financeiro/funcionarios/contas',
          permission: [1],
        },
        {
          id: 'precos-cargo',
          label: 'Preços por Cargo',
          icon: '🏷️',
          path: '/financeiro/funcionarios/precos',
          permission: [1],
        },
        {
          id: 'relatorios-financeiros',
          label: 'Relatórios Financeiros',
          icon: '📈',
          path: '/financeiro/relatorios',
          permission: [1],
        },
        {
          id: 'faturas',
          label: 'Faturas de Funcionários',
          icon: '📄',
          path: '/financeiro/faturas',
          permission: [1],
        },
      ],
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: '⚙️',
      path: '/configuracoes',
      permission: [1], // Apenas Admin
      children: [
        {
          id: 'usuarios-sistema',
          label: 'Usuários do Sistema',
          icon: '👥',
          path: '/configuracoes/usuarios',
          permission: [1],
        },
        {
          id: 'perfis-acesso',
          label: 'Perfis de Acesso',
          icon: '🔐',
          path: '/configuracoes/perfis',
          permission: [1],
        },
        {
          id: 'parametros',
          label: 'Parâmetros do Sistema',
          icon: '🔧',
          path: '/configuracoes/parametros',
          permission: [1],
        },
      ],
    },
  ];

  const hasPermission = (item: MenuItem): boolean => {
    if (!item.permission) return true;
    if (!user) return false;
    return item.permission.includes(user.perfil);
  };

  const isActive = (path: string): boolean => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  if (loading) {
    return (
      <div className='d-flex justify-content-center align-items-center vh-100'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Carregando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className='d-flex'>
      {/* Sidebar */}
      <nav
        className={`bg-dark text-white ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        style={{
          width: sidebarOpen ? '280px' : '70px',
          minHeight: '100vh',
          transition: 'width 0.3s ease',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 1000,
          overflowY: 'auto',
        }}
      >
        {/* Logo e Toggle */}
        <div className='d-flex align-items-center justify-content-between p-3 border-bottom border-secondary'>
          <div className={`d-flex align-items-center ${!sidebarOpen && 'justify-content-center'}`}>
            <div
              className='bg-primary rounded-circle d-flex align-items-center justify-content-center'
              style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}
            >
              🍽️
            </div>
            {sidebarOpen && (
              <div className='ms-3'>
                <h6 className='mb-0 text-white'>Cantina Escolar</h6>
                <small className='text-muted'>Sistema de Controle</small>
              </div>
            )}
          </div>
          <button
            className='btn btn-link text-white p-0'
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ fontSize: '1.2rem' }}
          >
            {sidebarOpen ? '◁' : '▷'}
          </button>
        </div>

        {/* Menu Items */}
        <div
          className='p-2'
          style={{
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {menuItems.map((item) => {
            if (!hasPermission(item)) return null;

            const active = isActive(item.path);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.has(item.id);

            return (
              <div key={item.id} className='mb-1'>
                <div
                  className={`d-flex align-items-center text-decoration-none text-white p-3 rounded mb-1 ${
                    active ? 'bg-primary' : 'hover-bg-secondary'
                  }`}
                  style={{
                    transition: 'all 0.2s ease',
                    cursor: hasChildren ? 'pointer' : 'pointer',
                  }}
                  onClick={() => {
                    if (hasChildren) {
                      toggleSubmenu(item.id, true);
                    } else {
                      router.push(item.path);
                    }
                  }}
                >
                  <span className='me-3' style={{ fontSize: '1.2rem', minWidth: '30px' }}>
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <>
                      <span className='flex-grow-1'>{item.label}</span>
                      {hasChildren && (
                        <span
                          style={{
                            fontSize: '0.8rem',
                            transition: 'transform 0.2s ease',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        >
                          ▼
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Submenu */}
                {sidebarOpen && hasChildren && (
                  <div
                    className='ms-4 mb-2'
                    style={{
                      maxHeight: isExpanded ? '500px' : '0px',
                      overflow: 'hidden',
                      transition: 'max-height 0.3s ease-in-out',
                    }}
                  >
                    {item.children!.map((child) => {
                      if (!hasPermission(child)) return null;

                      const childActive = isActive(child.path);

                      return (
                        <Link
                          key={child.id}
                          href={child.path}
                          className={`d-flex align-items-center text-decoration-none text-white p-2 rounded mb-1 ${
                            childActive ? 'bg-primary' : 'hover-bg-secondary'
                          }`}
                          style={{
                            fontSize: '0.9rem',
                            marginLeft: '0px',
                            opacity: isExpanded ? 1 : 0,
                            transform: isExpanded ? 'translateY(0)' : 'translateY(-10px)',
                            transition: 'all 0.3s ease-in-out',
                          }}
                        >
                          <span className='me-3' style={{ fontSize: '1rem', minWidth: '25px' }}>
                            {child.icon}
                          </span>
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <div
        className='flex-grow-1'
        style={{
          marginLeft: sidebarOpen ? '280px' : '70px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {/* Header */}
        <header
          className='bg-white border-bottom shadow-sm'
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 999,
          }}
        >
          <div className='d-flex justify-content-between align-items-center px-4 py-3'>
            <div>
              <h5 className='mb-0 text-dark'>
                {menuItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
              </h5>
            </div>

            <div className='d-flex align-items-center'>
              <div className='me-3 text-end'>
                <div className='fw-bold text-dark'>{user.nome}</div>
                <small className='text-muted'>
                  {user.perfil === 1 ? 'Administrador' : 'Operador'}
                </small>
              </div>

              <div className='dropdown'>
                <button
                  className='btn btn-outline-secondary dropdown-toggle'
                  type='button'
                  data-bs-toggle='dropdown'
                >
                  <span className='me-2'>👤</span>
                  Conta
                </button>
                <ul className='dropdown-menu'>
                  <li>
                    <a className='dropdown-item' href='#' onClick={handleLogout}>
                      <span className='me-2'>🚪</span>
                      Sair
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className='p-4 bg-light' style={{ minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
