# Layout Components - Estrutura Refatorada

Este diretório contém os componentes refatorados do `MainLayout`, organizados de forma modular para facilitar a manutenção e reutilização.

## 📁 Estrutura de Arquivos

```
components/layout/
├── index.ts                    # Exportações centralizadas
├── types.ts                    # Definições de tipos TypeScript
├── menuData.ts                 # Configuração dos itens do menu
├── utils.ts                    # Funções utilitárias
├── useAuth.ts                  # Hook customizado de autenticação
├── MainLayout.tsx             # Componente principal (no diretório pai)
├── Sidebar.tsx                 # Componente da barra lateral
├── SidebarHeader.tsx           # Cabeçalho da sidebar (logo + toggle)
├── MenuItemComponent.tsx       # Componente individual de item do menu
├── Header.tsx                  # Cabeçalho principal da aplicação
└── UserProfile.tsx             # Dropdown do perfil do usuário
```

## 🧩 Componentes

### MainLayout
**Arquivo:** `../MainLayout.tsx`

Componente principal que orquestra todo o layout da aplicação.

**Responsabilidades:**
- Gerencia o estado de abertura/fechamento da sidebar
- Utiliza o hook `useAuth` para autenticação
- Renderiza Sidebar e Header com as props necessárias

### Sidebar
**Arquivo:** `Sidebar.tsx`

Barra lateral de navegação com menu hierárquico.

**Props:**
- `isOpen: boolean` - Estado de abertura/fechamento
- `onToggle: () => void` - Função para alternar visibilidade
- `user: User` - Dados do usuário logado

**Responsabilidades:**
- Renderiza o menu de navegação
- Controla expansão/colapso de submenus
- Verifica permissões de acesso por perfil

### SidebarHeader
**Arquivo:** `SidebarHeader.tsx`

Cabeçalho da sidebar com logo e botão de toggle.

**Props:**
- `isOpen: boolean` - Estado de abertura/fechamento
- `onToggle: () => void` - Função para alternar visibilidade

### MenuItemComponent
**Arquivo:** `MenuItemComponent.tsx`

Componente individual para renderizar cada item do menu.

**Props:**
- `item: MenuItem` - Dados do item do menu
- `isActive: (path: string) => boolean` - Função para verificar rota ativa
- `hasPermission: (item: MenuItem) => boolean` - Função de verificação de permissão
- `isExpanded: boolean` - Estado de expansão do submenu
- `onToggle: (menuId: string, hasChildren: boolean) => void` - Função de toggle
- `sidebarOpen: boolean` - Estado da sidebar

**Responsabilidades:**
- Renderiza item do menu (pai ou filho)
- Gerencia animações de expansão
- Aplica estilos de item ativo

### Header
**Arquivo:** `Header.tsx`

Cabeçalho principal da aplicação.

**Props:**
- `user: User` - Dados do usuário logado
- `currentPageTitle: string` - Título da página atual
- `onLogout: () => void` - Função de logout

**Responsabilidades:**
- Exibe título da página atual
- Renderiza componente UserProfile

### UserProfile
**Arquivo:** `UserProfile.tsx`

Dropdown com informações do usuário e opção de logout.

**Props:**
- `user: User` - Dados do usuário logado
- `onLogout: () => void` - Função de logout

## 🔧 Utilitários

### useAuth Hook
**Arquivo:** `useAuth.ts`

Hook customizado para gerenciar autenticação.

**Retorno:**
```typescript
{
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}
```

**Responsabilidades:**
- Verifica autenticação ao montar
- Redireciona para login se não autenticado
- Fornece função de logout

### getCurrentPageTitle
**Arquivo:** `utils.ts`

Função utilitária que retorna o título da página baseado na rota atual.

**Parâmetros:**
- `pathname: string` - Caminho da URL atual

**Retorno:**
- `string` - Título da página

## 📊 Tipos

### User
```typescript
interface User {
  id: number;
  nome: string;
  perfil: number; // 1 = Admin, 2 = Operador
}
```

### MenuItem
```typescript
interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  permission?: number[]; // IDs dos perfis que podem acessar
  children?: MenuItem[]; // Submenus
}
```

## 📝 Configuração do Menu

Os itens do menu são definidos em `menuData.ts`. Para adicionar um novo item:

```typescript
{
  id: 'novo-item',
  label: 'Novo Item',
  icon: '🆕',
  path: '/novo-item',
  permission: [1, 2], // Admin e Operador
}
```

Para adicionar submenu:

```typescript
{
  id: 'secao',
  label: 'SEÇÃO',
  icon: '📁',
  path: '#',
  permission: [1],
  children: [
    {
      id: 'item-filho',
      label: 'Item Filho',
      icon: '📄',
      path: '/secao/item',
      permission: [1],
    }
  ]
}
```

## 🎨 Benefícios da Refatoração

1. **Separação de Responsabilidades**: Cada componente tem uma única responsabilidade
2. **Reusabilidade**: Componentes podem ser reutilizados em outras partes da aplicação
3. **Testabilidade**: Componentes menores são mais fáceis de testar
4. **Manutenibilidade**: Mais fácil localizar e corrigir bugs
5. **Legibilidade**: Código mais limpo e organizado
6. **Escalabilidade**: Facilita adição de novas funcionalidades

## 🚀 Como Usar

### Importar componentes individuais:
```typescript
import { Sidebar, Header, useAuth } from '@/components/layout';
```

### Usar o MainLayout (já configurado):
```typescript
import MainLayout from '@/components/MainLayout';

export default function Page() {
  return (
    <MainLayout>
      <div>Conteúdo da página</div>
    </MainLayout>
  );
}
```

## 🔒 Controle de Permissões

As permissões são baseadas no campo `perfil` do usuário:
- `1` = Administrador (acesso total)
- `2` = Operador (acesso limitado)

Para controlar acesso a um item do menu, use o campo `permission`:
```typescript
permission: [1] // Apenas Admin
permission: [1, 2] // Admin e Operador
permission: undefined // Sem restrição
```

## 📦 Exportações

O arquivo `index.ts` centraliza todas as exportações para facilitar imports:

```typescript
// Importar múltiplos itens de uma vez
import { 
  Sidebar, 
  Header, 
  useAuth, 
  menuItems,
  User,
  MenuItem 
} from '@/components/layout';
```
