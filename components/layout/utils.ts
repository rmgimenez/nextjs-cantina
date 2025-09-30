import { menuItems } from './menuData';

/**
 * Retorna o título da página baseado na rota atual
 * @param pathname - Caminho atual da URL
 * @returns Título da página ou 'Dashboard' como padrão
 */
export function getCurrentPageTitle(pathname: string): string {
  // Verifica correspondência exata primeiro
  for (const item of menuItems) {
    if (item.path === pathname) {
      return item.label;
    }

    // Verifica nos filhos
    if (item.children) {
      for (const child of item.children) {
        if (child.path === pathname) {
          return child.label;
        }
      }
    }
  }

  // Se não encontrou correspondência exata, procura por match parcial
  for (const item of menuItems) {
    if (item.path !== '/' && pathname.startsWith(item.path)) {
      return item.label;
    }

    if (item.children) {
      for (const child of item.children) {
        if (child.path !== '/' && pathname.startsWith(child.path)) {
          return child.label;
        }
      }
    }
  }

  return 'Dashboard';
}
