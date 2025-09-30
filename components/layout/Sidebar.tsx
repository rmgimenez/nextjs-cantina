'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { menuItems } from './menuData';
import MenuItemComponent from './MenuItemComponent';
import SidebarHeader from './SidebarHeader';
import { MenuItem, SidebarProps } from './types';

export default function Sidebar({ isOpen, onToggle, user }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const pathname = usePathname();

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
  }, [pathname]);

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

  return (
    <nav
      className={`bg-dark text-white ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      style={{
        width: isOpen ? '280px' : '70px',
        minHeight: '100vh',
        transition: 'width 0.3s ease',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        overflowY: 'auto',
      }}
    >
      <SidebarHeader isOpen={isOpen} onToggle={onToggle} />

      {/* Menu Items */}
      <div
        className='p-2'
        style={{
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {menuItems.map((item) => (
          <MenuItemComponent
            key={item.id}
            item={item}
            isActive={isActive}
            hasPermission={hasPermission}
            isExpanded={expandedMenus.has(item.id)}
            onToggle={toggleSubmenu}
            sidebarOpen={isOpen}
          />
        ))}
      </div>
    </nav>
  );
}
