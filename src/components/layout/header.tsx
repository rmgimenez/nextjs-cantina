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
    <header className='bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6'>
      {/* Busca Global */}
      <div className='flex-1 max-w-md'>
        <div className='relative'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <input
            type='text'
            placeholder='Buscar produtos, alunos, funcionários...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
          />
        </div>
      </div>

      {/* Ações do Header */}
      <div className='flex items-center space-x-4'>
        {/* Toggle Dark Mode */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
          title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
        >
          {isDarkMode ? (
            <FiSun className='w-5 h-5 text-gray-600' />
          ) : (
            <FiMoon className='w-5 h-5 text-gray-600' />
          )}
        </button>

        {/* Notificações */}
        <div className='relative'>
          <button className='p-2 rounded-lg hover:bg-gray-100 transition-colors relative'>
            <FiBell className='w-5 h-5 text-gray-600' />
            <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
              {notifications.length}
            </span>
          </button>
        </div>

        {/* Status do Caixa */}
        <div className='hidden md:flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg'>
          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
          <span className='text-sm text-green-700 font-medium'>Caixa Aberto</span>
        </div>

        {/* Perfil do Usuário */}
        <div className='relative'>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className='flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors'
          >
            <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center'>
              <span className='text-white font-semibold text-sm'>
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className='hidden md:block text-left'>
              <p className='text-sm font-medium text-gray-900'>{userName}</p>
              <p className='text-xs text-gray-500'>{userRole}</p>
            </div>
            <FiChevronDown
              className={clsx('w-4 h-4 text-gray-500 transition-transform', {
                'rotate-180': isProfileMenuOpen,
              })}
            />
          </button>

          {/* Menu do Perfil */}
          {isProfileMenuOpen && (
            <div className='absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50'>
              <div className='px-4 py-3 border-b border-gray-100'>
                <p className='text-sm font-medium text-gray-900'>{userName}</p>
                <p className='text-xs text-gray-500'>{userRole}</p>
              </div>
              <button
                onClick={() => setIsProfileMenuOpen(false)}
                className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
              >
                <FiUser className='w-4 h-4 mr-3' />
                Meu Perfil
              </button>
              <button
                onClick={() => setIsProfileMenuOpen(false)}
                className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
              >
                <FiSettings className='w-4 h-4 mr-3' />
                Configurações
              </button>
              <hr className='my-1' />
              <button
                onClick={handleLogout}
                className='flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors'
              >
                <FiLogOut className='w-4 h-4 mr-3' />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para fechar menu do perfil */}
      {isProfileMenuOpen && (
        <div className='fixed inset-0 z-40' onClick={() => setIsProfileMenuOpen(false)} />
      )}
    </header>
  );
}
