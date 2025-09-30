# Guia de Migração - MainLayout Refatorado

## 🚀 Início Rápido

A refatoração do `MainLayout` foi concluída com sucesso! O componente principal continua funcionando da mesma forma, mas agora está organizado em componentes menores.

## ✅ O que NÃO precisa mudar

### Para páginas que já usam o MainLayout

**Nenhuma alteração necessária!** O uso continua igual:

```typescript
import MainLayout from '@/components/MainLayout';

export default function MinhaPage() {
  return (
    <MainLayout>
      <div>Meu conteúdo</div>
    </MainLayout>
  );
}
```

## 🆕 Novas Possibilidades

### 1. Reutilizar Componentes Individuais

Agora você pode usar componentes específicos em outras partes da aplicação:

```typescript
// Usar apenas o Header em uma página especial
import { Header } from '@/components/layout';

export default function SpecialPage() {
  return <Header user={user} currentPageTitle="Página Especial" onLogout={handleLogout} />;
}
```

### 2. Usar o Hook de Autenticação

```typescript
// Qualquer componente pode usar o hook de autenticação
import { useAuth } from '@/components/layout';

export default function MyComponent() {
  const { user, loading, logout } = useAuth();
  
  if (loading) return <Spinner />;
  if (!user) return <LoginPrompt />;
  
  return <div>Olá, {user.nome}!</div>;
}
```

### 3. Acessar Dados do Menu

```typescript
// Usar os dados do menu em outros componentes
import { menuItems } from '@/components/layout';

export default function Breadcrumb() {
  return (
    <nav>
      {menuItems.map(item => (
        <Link key={item.id} href={item.path}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

### 4. Usar Utilitários

```typescript
// Obter título da página atual
import { getCurrentPageTitle } from '@/components/layout';
import { usePathname } from 'next/navigation';

export default function PageTitle() {
  const pathname = usePathname();
  const title = getCurrentPageTitle(pathname);
  
  return <h1>{title}</h1>;
}
```

## 📋 Estrutura de Arquivos

### Antes da Refatoração
```
components/
└── MainLayout.tsx (330 linhas)
```

### Depois da Refatoração
```
components/
├── MainLayout.tsx (40 linhas)
└── layout/
    ├── index.ts
    ├── types.ts
    ├── menuData.ts
    ├── utils.ts
    ├── useAuth.ts
    ├── Sidebar.tsx
    ├── SidebarHeader.tsx
    ├── MenuItemComponent.tsx
    ├── Header.tsx
    ├── UserProfile.tsx
    ├── README.md
    └── REFACTORING_SUMMARY.md
```

## 🔧 Adicionar Novo Item ao Menu

### 1. Editar `menuData.ts`

```typescript
// components/layout/menuData.ts
{
  id: 'novo-modulo',
  label: 'Novo Módulo',
  icon: '🆕',
  path: '/novo-modulo',
  permission: [1, 2], // Admin e Operador
}
```

### 2. Adicionar com Submenu

```typescript
{
  id: 'nova-secao',
  label: 'NOVA SEÇÃO',
  icon: '📁',
  path: '#',
  permission: [1],
  children: [
    {
      id: 'item-1',
      label: 'Item 1',
      icon: '📄',
      path: '/nova-secao/item-1',
      permission: [1],
    },
    {
      id: 'item-2',
      label: 'Item 2',
      icon: '📄',
      path: '/nova-secao/item-2',
      permission: [1, 2],
    }
  ]
}
```

## 🎨 Customizar Componentes

### Modificar o Header

Edite `components/layout/Header.tsx`:

```typescript
export default function Header({ user, currentPageTitle, onLogout }: HeaderProps) {
  return (
    <header className='bg-white border-bottom shadow-sm'>
      {/* Adicione seus elementos aqui */}
      <div className='custom-element'>Novo elemento</div>
      
      <UserProfile user={user} onLogout={onLogout} />
    </header>
  );
}
```

### Modificar a Sidebar

Edite `components/layout/Sidebar.tsx`:

```typescript
export default function Sidebar({ isOpen, onToggle, user }: SidebarProps) {
  return (
    <nav>
      <SidebarHeader isOpen={isOpen} onToggle={onToggle} />
      
      {/* Adicione novos elementos aqui */}
      <div className='custom-sidebar-element'>
        Elemento customizado
      </div>
      
      {/* Menu items... */}
    </nav>
  );
}
```

## 🔒 Controlar Permissões

### Perfis Disponíveis
- `1` = Administrador (acesso total)
- `2` = Operador (acesso limitado)

### Verificar Permissão em Componente

```typescript
import { useAuth } from '@/components/layout';

export default function AdminOnlyFeature() {
  const { user } = useAuth();
  
  // Apenas admin pode ver
  if (user?.perfil !== 1) {
    return <div>Acesso negado</div>;
  }
  
  return <div>Conteúdo exclusivo para admin</div>;
}
```

## 📦 Importações

### Importar Múltiplos Itens

```typescript
import { 
  useAuth,           // Hook de autenticação
  menuItems,         // Dados do menu
  getCurrentPageTitle, // Utilitário
  User,              // Tipo
  MenuItem           // Tipo
} from '@/components/layout';
```

### Importar Componentes

```typescript
import { 
  Sidebar, 
  Header, 
  UserProfile 
} from '@/components/layout';
```

## 🐛 Solução de Problemas

### Erro: "Cannot find module '@/components/layout'"

**Solução:** Use o caminho relativo ou absoluto correto:

```typescript
// Relativo
import { useAuth } from '../components/layout';

// Absoluto (se configurado no tsconfig.json)
import { useAuth } from '@/components/layout';
```

### Erro: "user is possibly null"

**Solução:** Sempre verifique se o usuário existe:

```typescript
const { user } = useAuth();

// Opção 1: Early return
if (!user) return null;

// Opção 2: Optional chaining
<div>{user?.nome}</div>

// Opção 3: Null coalescing
<div>{user?.nome ?? 'Visitante'}</div>
```

### Menu não expande/colapsa

**Verificar:** Se você modificou o `Sidebar.tsx`, certifique-se de que o estado `expandedMenus` está sendo gerenciado corretamente.

## 📚 Documentação Adicional

- **Arquitetura completa:** Veja `components/layout/README.md`
- **Resumo da refatoração:** Veja `components/layout/REFACTORING_SUMMARY.md`
- **Tipos TypeScript:** Veja `components/layout/types.ts`

## ✅ Checklist de Migração

- [ ] Verifique se todas as páginas ainda funcionam
- [ ] Teste a navegação do menu
- [ ] Teste login/logout
- [ ] Verifique permissões de acesso
- [ ] Teste responsividade (desktop/mobile)
- [ ] Verifique animações do menu

## 🤝 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique os logs do console do navegador
2. Confira se não há erros TypeScript
3. Revise a documentação em `README.md`
4. Compare com o código original se necessário

---

**Pronto!** Seu sistema está refatorado e pronto para crescer! 🚀
