'use client';

import clsx from 'clsx';
import { useState } from 'react';
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
}

export default function Header({
  userName = 'Usuário',
  userRole = 'Administrador',
  onLogout,
}: HeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const notifications = [
    { id: 1, message: 'Estoque baixo: Refrigerante Coca-Cola', type: 'warning', time: '5 min' },
    { id: 2, message: 'Nova venda registrada: R$ 25,50', type: 'success', time: '10 min' },
    { id: 3, message: 'Caixa aberto por João Silva', type: 'info', time: '15 min' },
  ];

  return (
    <header className='navbar bg-white shadow-sm border-bottom'>
      <div className='container-fluid d-flex align-items-center justify-content-between'>
        {/* Busca Global */}
        <div className='flex-grow-1 me-3' style={{ maxWidth: 520 }}>
          <div className='input-group'>
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
          <div className='d-none d-md-flex align-items-center badge bg-success bg-opacity-10 text-success border border-success rounded-pill py-2 px-3'>
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
              <div
                className='rounded-circle bg-primary text-white d-flex align-items-center justify-content-center'
                style={{ width: 36, height: 36 }}
              >
                <strong>{userName.charAt(0).toUpperCase()}</strong>
              </div>
              <div className='d-none d-md-block text-start'>
                <div className='fw-semibold text-dark'>{userName}</div>
                <small className='text-muted'>{userRole}</small>
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
                  <div className='fw-semibold'>{userName}</div>
                  <small className='text-muted'>{userRole}</small>
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
