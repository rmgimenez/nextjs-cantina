'use client';

import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import Header from './header';
import Sidebar from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className='d-flex vh-100 bg-light'>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} userRole='admin' />

      {/* Overlay para mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className='position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50'
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div
        className={clsx('flex-grow-1 d-flex flex-column transition', {
          'ms-4': !isMobile,
        })}
        style={{ marginLeft: isMobile ? 0 : isSidebarOpen ? 260 : 64 }}
      >
        {/* Header */}
        <Header userName='João Silva' userRole='Administrador' />

        {/* Page Content */}
        <main className='flex-grow-1 overflow-auto'>
          {(title || subtitle) && (
            <div className='bg-white border-bottom px-3 py-3'>
              {title && <h1 className='h4 mb-1 text-dark'>{title}</h1>}
              {subtitle && <p className='text-muted mb-0'>{subtitle}</p>}
            </div>
          )}
          <div className='p-3'>{children}</div>
        </main>
      </div>
    </div>
  );
}
