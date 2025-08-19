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
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} userRole='admin' />

      {/* Overlay para mobile */}
      {isMobile && isSidebarOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-20' onClick={toggleSidebar} />
      )}

      {/* Main Content */}
      <div
        className={clsx('flex-1 flex flex-col transition-all duration-300', {
          'ml-64': isSidebarOpen && !isMobile,
          'ml-16': !isSidebarOpen && !isMobile,
          'ml-0': isMobile,
        })}
      >
        {/* Header */}
        <Header userName='João Silva' userRole='Administrador' />

        {/* Page Content */}
        <main className='flex-1 overflow-y-auto'>
          {(title || subtitle) && (
            <div className='bg-white border-b border-gray-200 px-6 py-4'>
              {title && <h1 className='text-2xl font-bold text-gray-900'>{title}</h1>}
              {subtitle && <p className='text-gray-600 mt-1'>{subtitle}</p>}
            </div>
          )}
          <div className='p-6'>{children}</div>
        </main>
      </div>
    </div>
  );
}
