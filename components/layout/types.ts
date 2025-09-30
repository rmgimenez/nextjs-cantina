export interface User {
  id: number;
  nome: string;
  perfil: number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  permission?: number[]; // IDs dos perfis que podem acessar
  children?: MenuItem[];
}

export interface MainLayoutProps {
  children: React.ReactNode;
}

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  user: User;
}

export interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

export interface MenuItemComponentProps {
  item: MenuItem;
  isActive: (path: string) => boolean;
  hasPermission: (item: MenuItem) => boolean;
  isExpanded: boolean;
  onToggle: (menuId: string, hasChildren: boolean) => void;
  sidebarOpen: boolean;
}

export interface HeaderProps {
  user: User;
  currentPageTitle: string;
  onLogout: () => void;
}

export interface UserProfileProps {
  user: User;
  onLogout: () => void;
}
