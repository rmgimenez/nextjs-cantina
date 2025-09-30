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
      id: 'operacional',
      label: 'OPERACIONAL',
      icon: '⚡',
      path: '#',
      permission: [1, 2],
      children: [
        {
          id: 'pdv',
          label: 'PDV - Ponto de Venda',
          icon: '🛒',
          path: '/vendas/pdv',
          permission: [1, 2],
        },
        {
          id: 'caixa',
          label: 'Caixa',
          icon: '💰',
          path: '/caixa',
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
      id: 'alunos',
      label: 'ALUNOS',
      icon: '👨‍🎓',
      path: '#',
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
          label: 'Histórico de Consumo',
          icon: '📊',
          path: '/alunos/historico',
          permission: [1, 2],
        },
        {
          id: 'pacotes',
          label: 'Pacotes de Alimentação',
          icon: '🍱',
          path: '/alunos/pacotes',
          permission: [1, 2],
        },
        {
          id: 'restricoes',
          label: 'Restrições Alimentares',
          icon: '🍽️',
          path: '/alunos/restricoes',
          permission: [1, 2],
        },
        {
          id: 'observacoes',
          label: 'Observações',
          icon: '📝',
          path: '/alunos/observacoes',
          permission: [1, 2],
        },
        {
          id: 'importar-saldos',
          label: 'Importar Saldos',
          icon: '📥',
          path: '/alunos/importar-saldos',
          permission: [1], // Apenas Admin
        },
      ],
    },
    {
      id: 'produtos-estoque',
      label: 'PRODUTOS & ESTOQUE',
      icon: '📦',
      path: '#',
      permission: [1, 2],
      children: [
        {
          id: 'cadastro-produtos',
          label: 'Cadastro de Produtos',
          icon: '🏷️',
          path: '/produtos',
          permission: [1, 2],
        },
        {
          id: 'tipos-produtos',
          label: 'Tipos de Produtos',
          icon: '📦',
          path: '/produtos/tipos',
          permission: [1, 2],
        },
        {
          id: 'controle-estoque',
          label: 'Controle de Estoque',
          icon: '📦',
          path: '/estoque',
          permission: [1, 2],
        },
        {
          id: 'movimentacoes',
          label: 'Movimentações',
          icon: '📦',
          path: '/estoque/movimentacoes',
          permission: [1, 2],
        },
      ],
    },
    {
      id: 'funcionarios-escola',
      label: 'FUNCIONÁRIOS ESCOLA',
      icon: '👨‍🏫',
      path: '#',
      permission: [1, 2],
      children: [
        {
          id: 'contas-funcionarios-escola',
          label: 'Contas de Funcionários',
          icon: '💼',
          path: '/financeiro/funcionarios/contas',
          permission: [1, 2],
        },
        {
          id: 'faturas',
          label: 'Faturas',
          icon: '📄',
          path: '/financeiro/faturas',
          permission: [1, 2],
        },
        {
          id: 'precos-cargo',
          label: 'Preços por Cargo',
          icon: '💰',
          path: '/financeiro/funcionarios/precos',
          permission: [1],
        },
      ],
    },
    {
      id: 'relatorios',
      label: 'RELATÓRIOS',
      icon: '�',
      path: '#',
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
          icon: '📊',
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
        {
          id: 'relatorio-faturas-pdf',
          label: 'Relatório de Faturas',
          icon: '📄',
          path: '/financeiro/relatorios/faturas',
          permission: [1],
        },
      ],
    },
    {
      id: 'financeiro',
      label: 'FINANCEIRO',
      icon: '💰',
      path: '#',
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
          icon: '📄',
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
          id: 'relatorios-financeiros',
          label: 'Relatórios Financeiros',
          icon: '📈',
          path: '/financeiro/relatorios',
          permission: [1],
        },
      ],
    },
    {
      id: 'administracao',
      label: 'ADMINISTRAÇÃO',
      icon: '⚙️',
      path: '#',
      permission: [1], // Apenas Admin
      children: [
        {
          id: 'funcionarios-cantina',
          label: 'Funcionários da Cantina',
          icon: '👨‍�',
          path: '/funcionarios-cantina',
          permission: [1],
        },
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
        <div
          className='d-flex align-items-center justify-content-between p-3 border-bottom border-secondary'
          style={{ minHeight: '70px' }}
        >
          <div
            className={`d-flex align-items-center ${
              !sidebarOpen && 'justify-content-center w-100'
            }`}
          >
            <div
              className='bg-primary rounded d-flex align-items-center justify-content-center'
              style={{ width: '45px', height: '45px', fontSize: '1.5rem', flexShrink: 0 }}
            >
              🍽️
            </div>
            {sidebarOpen && (
              <div className='ms-3'>
                <h5 className='mb-0 text-white fw-bold'>Cantina Escolar</h5>
                <small className='text-muted' style={{ fontSize: '0.75rem' }}>
                  Sistema de Controle
                </small>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              className='btn btn-link text-white p-0'
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ fontSize: '1.2rem', minWidth: '30px' }}
              title='Recolher menu'
            >
              ◁
            </button>
          )}
        </div>

        {/* Toggle button quando fechado */}
        {!sidebarOpen && (
          <div className='text-center py-2 border-bottom border-secondary'>
            <button
              className='btn btn-link text-white p-0'
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ fontSize: '1.2rem' }}
              title='Expandir menu'
            >
              ▷
            </button>
          </div>
        )}

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

            // Separador de seção visual
            const isSection = item.label.toUpperCase() === item.label && hasChildren;

            return (
              <div key={item.id} className='mb-1'>
                <div
                  className={`d-flex align-items-center text-decoration-none text-white p-3 rounded mb-1 position-relative ${
                    active && !hasChildren ? 'bg-primary' : 'hover-bg-secondary'
                  }`}
                  style={{
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    marginLeft: '4px',
                    marginRight: '4px',
                  }}
                  onClick={() => {
                    if (hasChildren) {
                      toggleSubmenu(item.id, true);
                    } else {
                      router.push(item.path);
                    }
                  }}
                >
                  <span
                    className='me-3'
                    style={{ fontSize: '1.2rem', minWidth: '30px', textAlign: 'center' }}
                  >
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <>
                      <span
                        className='flex-grow-1'
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: isSection ? '600' : '400',
                        }}
                      >
                        {item.label}
                      </span>
                      {hasChildren && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            transition: 'transform 0.25s ease',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        >
                          ▼
                        </span>
                      )}
                    </>
                  )}
                  {!sidebarOpen && hasChildren && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '4px',
                        top: '4px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--amarelo-principal)',
                      }}
                    />
                  )}
                </div>

                {/* Submenu */}
                {sidebarOpen && hasChildren && (
                  <div
                    className='mb-2'
                    style={{
                      maxHeight: isExpanded ? '1000px' : '0px',
                      overflow: 'hidden',
                      transition: 'max-height 0.35s ease-in-out',
                      paddingLeft: '8px',
                    }}
                  >
                    {item.children!.map((child, index) => {
                      if (!hasPermission(child)) return null;

                      const childActive = isActive(child.path);

                      return (
                        <Link
                          key={child.id}
                          href={child.path}
                          className={`d-flex align-items-center text-decoration-none text-white p-2 ps-3 rounded mb-1 position-relative ${
                            childActive ? 'bg-primary' : 'hover-bg-secondary'
                          }`}
                          style={{
                            fontSize: '0.875rem',
                            marginLeft: '4px',
                            marginRight: '4px',
                            opacity: isExpanded ? 1 : 0,
                            transform: isExpanded ? 'translateY(0)' : 'translateY(-10px)',
                            transition: `all 0.3s ease-in-out ${index * 0.05}s`,
                            borderLeft: childActive
                              ? '3px solid var(--amarelo-principal)'
                              : '3px solid transparent',
                          }}
                        >
                          <span
                            className='me-2'
                            style={{
                              fontSize: '0.9rem',
                              minWidth: '25px',
                              textAlign: 'center',
                              opacity: 0.9,
                            }}
                          >
                            {child.icon}
                          </span>
                          <span style={{ fontWeight: childActive ? '500' : '400' }}>
                            {child.label}
                          </span>
                          {childActive && (
                            <span
                              className='ms-auto'
                              style={{ fontSize: '0.6rem', color: 'var(--amarelo-principal)' }}
                            >
                              ●
                            </span>
                          )}
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
