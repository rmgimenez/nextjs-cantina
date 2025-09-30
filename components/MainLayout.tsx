'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import { MainLayoutProps } from './layout/types';
import { useAuth } from './layout/useAuth';
import { getCurrentPageTitle } from './layout/utils';

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

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

  const currentPageTitle = getCurrentPageTitle(pathname);

  return (
    <div className='d-flex'>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} user={user} />

      <div
        className='flex-grow-1'
        style={{
          marginLeft: sidebarOpen ? '280px' : '70px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Header user={user} currentPageTitle={currentPageTitle} onLogout={logout} />

        <main className='p-4 bg-light' style={{ minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
