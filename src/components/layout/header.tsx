'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiMoon,
  FiSearch,
  FiSettings,
  FiSun,
  FiUser,
} from 'react-icons/fi';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
  onToggle?: () => void;
}

export default function Header({
  userName = 'Usuário',
  userRole = 'Administrador',
  onLogout,
  onToggle,
}: HeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState(userName);
  const [role, setRole] = useState(userRole);
  const [loadingUser, setLoadingUser] = useState(true);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    async function loadSession() {
      try {
        const res = await fetch('/api/session', { method: 'GET', credentials: 'include' });
        if (!mounted) return;
        if (res.ok) {
          const body = await res.json();
          // API returns { authenticated: true, user: { id, nome, tipo } }
          if (body && body.user) {
            setName(body.user.nome || body.user.usuario || userName);
            setRole(body.user.tipo || userRole);
          }
        } else {
          // keep fallbacks when not authenticated
          setName(userName);
          setRole(userRole);
        }
      } catch (err) {
        console.error('Erro ao carregar sessão:', err);
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }
    loadSession();
    return () => {
      mounted = false;
    };
  }, [userName, userRole]);

  const notifications = [
    { id: 1, message: 'Estoque baixo: Refrigerante Coca-Cola', type: 'warning', time: '5 min' },
    { id: 2, message: 'Nova venda registrada: R$ 25,50', type: 'success', time: '10 min' },
    { id: 3, message: 'Caixa aberto por João Silva', type: 'info', time: '15 min' },
  ];
  return (
    <header
      className='navbar bg-white shadow-sm border-bottom position-sticky top-0'
      style={{ zIndex: 1050 }}
    >
      <div className='container-fluid d-flex align-items-center justify-content-between py-2'>
        {/* Busca Global */}
        <div className='flex-grow-1 me-3 d-flex align-items-center' style={{ maxWidth: 540 }}>
          {/* Botão de toggle da sidebar - visível em telas pequenas e médias
              Em telas md+ a sidebar está normalmente fixa, mas manter o botão
              não faz mal e melhora acessibilidade */}
          {onToggle && (
            <button
              onClick={onToggle}
              className='btn btn-light btn-sm me-2 d-md-none'
              title='Abrir/Fechar menu'
              aria-label='Abrir menu'
            >
              ☰
            </button>
          )}
          <div className='input-group flex-grow-1'>
            <span className='input-group-text bg-white border-end-0'>
              <FiSearch className='text-muted' />
            </span>
            <input
              type='text'
              placeholder='Buscar produtos, alunos, funcionários...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='form-control border-start-0'
              aria-label='Buscar'
            />
          </div>
        </div>

        {/* Ações do Header */}
        <div className='d-flex align-items-center gap-2'>
          {/* Toggle Dark Mode */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className='btn btn-light btn-sm rounded-circle'
            title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            aria-pressed={isDarkMode}
          >
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </button>

          {/* Notificações */}
          <div className='position-relative'>
            <button className='btn btn-light btn-sm rounded-circle position-relative'>
              <FiBell />
              <span className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger'>
                {notifications.length}
              </span>
            </button>
          </div>

          {/* Status do Caixa */}
          <div className='d-none d-md-flex align-items-center badge bg-success bg-opacity-10 text-success border border-success rounded-pill py-1 px-3'>
            <span className='me-2 rounded-circle bg-success' style={{ width: 8, height: 8 }} />
            <small className='mb-0'>Caixa Aberto</small>
          </div>

          {/* Perfil do Usuário */}
          <div className='dropdown'>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className='btn btn-light d-flex align-items-center gap-2'
              id='profileDropdown'
              aria-expanded={isProfileMenuOpen}
            >
              <div className='rounded-circle brand-avatar text-white d-flex align-items-center justify-content-center'>
                <strong>{(name && name.length > 0 ? name.charAt(0) : '?').toUpperCase()}</strong>
              </div>
              <div className='d-none d-md-block text-start'>
                <div className='fw-semibold text-dark'>{name}</div>
                <small className='text-muted'>{role}</small>
              </div>
              <FiChevronDown className={clsx('', { 'rotate-180': isProfileMenuOpen })} />
            </button>

            {/* Menu do Perfil */}
            {isProfileMenuOpen && (
              <ul
                className='dropdown-menu dropdown-menu-end show shadow-sm'
                aria-labelledby='profileDropdown'
              >
                <li className='px-3 py-2 border-bottom'>
                  <div className='fw-semibold'>{name}</div>
                  <small className='text-muted'>{role}</small>
                </li>
                <li>
                  <button className='dropdown-item' onClick={() => setIsProfileMenuOpen(false)}>
                    <FiUser className='me-2' /> Meu Perfil
                  </button>
                </li>
                <li>
                  <button className='dropdown-item' onClick={() => setIsProfileMenuOpen(false)}>
                    <FiSettings className='me-2' /> Configurações
                  </button>
                </li>
                <li>
                  <hr className='dropdown-divider' />
                </li>
                <li>
                  <button className='dropdown-item text-danger' onClick={handleLogout}>
                    <FiLogOut className='me-2' /> Sair
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Overlay para fechar menu do perfil */}
        {isProfileMenuOpen && (
          <div
            className='position-fixed top-0 start-0 w-100 h-100'
            onClick={() => setIsProfileMenuOpen(false)}
          />
        )}
      </div>
    </header>
  );
}
