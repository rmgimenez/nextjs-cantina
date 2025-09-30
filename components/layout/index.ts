// Exportações centralizadas dos componentes do layout
export { default as Header } from './Header';
export { default as MenuItemComponent } from './MenuItemComponent';
export { default as Sidebar } from './Sidebar';
export { default as SidebarHeader } from './SidebarHeader';
export { default as UserProfile } from './UserProfile';

// Exportação do hook
export { useAuth } from './useAuth';

// Exportação dos dados
export { menuItems } from './menuData';

// Exportação das utilidades
export { getCurrentPageTitle } from './utils';

// Exportação dos tipos
export type {
  HeaderProps,
  MainLayoutProps,
  MenuItem,
  MenuItemComponentProps,
  SidebarHeaderProps,
  SidebarProps,
  User,
  UserProfileProps,
} from './types';
