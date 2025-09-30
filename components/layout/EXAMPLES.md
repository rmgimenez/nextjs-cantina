# 💡 Exemplos Práticos de Uso

Este arquivo contém exemplos práticos de como usar os componentes e utilidades refatorados do MainLayout.

## 📚 Índice

1. [Usar o MainLayout](#1-usar-o-mainlayout)
2. [Hook de Autenticação](#2-hook-de-autenticação)
3. [Reutilizar Componentes](#3-reutilizar-componentes)
4. [Adicionar Item ao Menu](#4-adicionar-item-ao-menu)
5. [Verificar Permissões](#5-verificar-permissões)
6. [Customizar Componentes](#6-customizar-componentes)

---

## 1. Usar o MainLayout

### Exemplo Básico

```typescript
// app/minha-pagina/page.tsx
import MainLayout from '@/components/MainLayout';

export default function MinhaPagina() {
  return (
    <MainLayout>
      <div className="container">
        <h1>Minha Página</h1>
        <p>Conteúdo da página aqui...</p>
      </div>
    </MainLayout>
  );
}
```

### Com Loading State

```typescript
'use client';

import MainLayout from '@/components/MainLayout';
import { useState, useEffect } from 'react';

export default function PaginaComDados() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDados() {
      const res = await fetch('/api/dados');
      const data = await res.json();
      setDados(data);
      setLoading(false);
    }
    fetchDados();
  }, []);

  return (
    <MainLayout>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" />
        </div>
      ) : (
        <div>{/* Renderizar dados */}</div>
      )}
    </MainLayout>
  );
}
```

---

## 2. Hook de Autenticação

### Uso Básico

```typescript
'use client';

import { useAuth } from '@/components/layout';

export default function MeuComponente() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <div>Não autenticado</div>;
  }

  return (
    <div>
      <h2>Olá, {user.nome}!</h2>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

### Verificar Perfil do Usuário

```typescript
'use client';

import { useAuth } from '@/components/layout';

export default function FeatureAdminOnly() {
  const { user } = useAuth();

  // 1 = Admin, 2 = Operador
  const isAdmin = user?.perfil === 1;

  if (!isAdmin) {
    return (
      <div className="alert alert-warning">
        Você não tem permissão para acessar esta funcionalidade.
      </div>
    );
  }

  return (
    <div>
      <h2>Funcionalidade Exclusiva para Admin</h2>
      {/* Conteúdo restrito */}
    </div>
  );
}
```

### Redirecionar Baseado em Perfil

```typescript
'use client';

import { useAuth } from '@/components/layout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PaginaRestrita() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.perfil !== 1) {
      // Redireciona operadores para outra página
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return <div>Carregando...</div>;
  if (user?.perfil !== 1) return null;

  return <div>Conteúdo para administradores</div>;
}
```

---

## 3. Reutilizar Componentes

### Usar Apenas o Header

```typescript
'use client';

import { Header } from '@/components/layout';
import { useAuth } from '@/components/layout';

export default function PaginaCustomizada() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div>
      <Header 
        user={user} 
        currentPageTitle="Minha Página Customizada"
        onLogout={logout}
      />
      <main className="p-4">
        {/* Conteúdo sem sidebar */}
      </main>
    </div>
  );
}
```

### Criar Breadcrumb com Dados do Menu

```typescript
'use client';

import { menuItems } from '@/components/layout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Breadcrumb() {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Home', path: '/' }];

    menuItems.forEach(item => {
      if (pathname.startsWith(item.path) && item.path !== '#') {
        crumbs.push({ label: item.label, path: item.path });
      }

      if (item.children) {
        item.children.forEach(child => {
          if (pathname.startsWith(child.path)) {
            crumbs.push({ label: child.label, path: child.path });
          }
        });
      }
    });

    return crumbs;
  };

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {getBreadcrumbs().map((crumb, index) => (
          <li key={index} className="breadcrumb-item">
            <Link href={crumb.path}>{crumb.label}</Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

### Mini Menu de Navegação Rápida

```typescript
'use client';

import { menuItems, User } from '@/components/layout';
import Link from 'next/link';

interface QuickNavProps {
  user: User;
}

export default function QuickNav({ user }: QuickNavProps) {
  // Mostrar apenas itens principais que o usuário tem acesso
  const mainItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return item.permission.includes(user.perfil);
  });

  return (
    <div className="quick-nav">
      {mainItems.slice(0, 5).map(item => (
        <Link 
          key={item.id} 
          href={item.path}
          className="quick-nav-item"
        >
          <span className="icon">{item.icon}</span>
          <span className="label">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
```

---

## 4. Adicionar Item ao Menu

### Item Simples

```typescript
// components/layout/menuData.ts

// Adicione ao array menuItems:
{
  id: 'relatorios-custom',
  label: 'Relatórios Customizados',
  icon: '📊',
  path: '/relatorios/custom',
  permission: [1], // Apenas Admin
}
```

### Item com Submenu

```typescript
// components/layout/menuData.ts

{
  id: 'configuracoes',
  label: 'CONFIGURAÇÕES',
  icon: '⚙️',
  path: '#',
  permission: [1], // Apenas Admin
  children: [
    {
      id: 'config-geral',
      label: 'Configurações Gerais',
      icon: '🔧',
      path: '/configuracoes/geral',
      permission: [1],
    },
    {
      id: 'config-email',
      label: 'Configurações de Email',
      icon: '📧',
      path: '/configuracoes/email',
      permission: [1],
    },
    {
      id: 'config-notificacoes',
      label: 'Notificações',
      icon: '🔔',
      path: '/configuracoes/notificacoes',
      permission: [1, 2], // Admin e Operador
    }
  ]
}
```

### Item Condicional (Baseado em Feature Flag)

```typescript
// components/layout/menuData.ts

// No topo do arquivo
const FEATURE_FLAGS = {
  NOVO_DASHBOARD: process.env.NEXT_PUBLIC_FEATURE_NOVO_DASHBOARD === 'true',
};

// No array menuItems:
...(FEATURE_FLAGS.NOVO_DASHBOARD ? [{
  id: 'dashboard-v2',
  label: 'Dashboard V2 (Beta)',
  icon: '🆕',
  path: '/dashboard-v2',
  permission: [1],
}] : []),
```

---

## 5. Verificar Permissões

### Em um Componente

```typescript
'use client';

import { useAuth } from '@/components/layout';

export default function BotaoComPermissao() {
  const { user } = useAuth();
  const isAdmin = user?.perfil === 1;

  return (
    <div>
      {isAdmin ? (
        <button className="btn btn-danger">
          Excluir (Admin Only)
        </button>
      ) : (
        <button className="btn btn-secondary" disabled>
          Excluir (Sem Permissão)
        </button>
      )}
    </div>
  );
}
```

### Em uma API Route

```typescript
// app/api/admin/route.ts
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET() {
  const token = cookies().get('token')?.value;
  
  if (!token) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  
  if (!decoded || decoded.perfil !== 1) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  // Lógica restrita a admin
  return NextResponse.json({ data: 'Dados restritos' });
}
```

### Helper de Permissão Reutilizável

```typescript
// lib/permissions.ts
import { User } from '@/components/layout/types';

export const PERFIS = {
  ADMIN: 1,
  OPERADOR: 2,
} as const;

export function hasPermission(
  user: User | null, 
  requiredProfiles: number[]
): boolean {
  if (!user) return false;
  return requiredProfiles.includes(user.perfil);
}

export function isAdmin(user: User | null): boolean {
  return user?.perfil === PERFIS.ADMIN;
}

export function isOperador(user: User | null): boolean {
  return user?.perfil === PERFIS.OPERADOR;
}

// Uso:
import { useAuth } from '@/components/layout';
import { isAdmin, hasPermission } from '@/lib/permissions';

const { user } = useAuth();

if (isAdmin(user)) {
  // Funcionalidade admin
}

if (hasPermission(user, [1, 2])) {
  // Funcionalidade para admin e operador
}
```

---

## 6. Customizar Componentes

### Adicionar Logo Customizada

```typescript
// components/layout/SidebarHeader.tsx

export default function SidebarHeader({ isOpen, onToggle }: SidebarHeaderProps) {
  return (
    <>
      <div className='d-flex align-items-center justify-content-between p-3 border-bottom'>
        <div className={`d-flex align-items-center ${!isOpen && 'justify-content-center w-100'}`}>
          {/* Logo customizada */}
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ width: '45px', height: '45px' }}
          />
          {isOpen && (
            <div className='ms-3'>
              <h5 className='mb-0 text-white fw-bold'>Meu Sistema</h5>
              <small className='text-muted'>V2.0</small>
            </div>
          )}
        </div>
        {/* ... resto do código */}
      </div>
    </>
  );
}
```

### Adicionar Notificações no Header

```typescript
// components/layout/Header.tsx
import { useState, useEffect } from 'react';

export default function Header({ user, currentPageTitle, onLogout }: HeaderProps) {
  const [notifications, setNotifications] = useState<number>(0);

  useEffect(() => {
    async function fetchNotifications() {
      const res = await fetch('/api/notifications/count');
      const data = await res.json();
      setNotifications(data.count);
    }
    fetchNotifications();
  }, []);

  return (
    <header className='bg-white border-bottom shadow-sm'>
      <div className='d-flex justify-content-between align-items-center px-4 py-3'>
        <div>
          <h5 className='mb-0 text-dark'>{currentPageTitle}</h5>
        </div>

        <div className='d-flex align-items-center gap-3'>
          {/* Botão de notificações */}
          <button className='btn btn-link position-relative'>
            🔔
            {notifications > 0 && (
              <span className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger'>
                {notifications}
              </span>
            )}
          </button>

          <UserProfile user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}
```

### Tema Escuro na Sidebar

```typescript
// components/layout/Sidebar.tsx

export default function Sidebar({ isOpen, onToggle, user }: SidebarProps) {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <nav
      className={`text-white ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      style={{
        backgroundColor: darkMode ? '#1a1a1a' : '#212529',
        // ... outros estilos
      }}
    >
      <SidebarHeader isOpen={isOpen} onToggle={onToggle} />

      {/* Toggle de tema */}
      {isOpen && (
        <div className='px-3 py-2'>
          <button 
            className='btn btn-sm btn-outline-light w-100'
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
          </button>
        </div>
      )}

      {/* Menu items... */}
    </nav>
  );
}
```

---

## 🎯 Dicas e Boas Práticas

### 1. Sempre Verifique o Loading

```typescript
const { user, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!user) return <LoginPrompt />;

// Seu código aqui
```

### 2. Use Optional Chaining

```typescript
// ✅ Bom
<div>{user?.nome ?? 'Visitante'}</div>

// ❌ Evite
<div>{user ? user.nome : 'Visitante'}</div>
```

### 3. Memoize Componentes Pesados

```typescript
import { memo } from 'react';

const MenuItemComponent = memo(function MenuItemComponent(props) {
  // ... componente
});
```

### 4. Extraia Lógica Complexa

```typescript
// ✅ Bom - lógica em função separada
function calculatePermissions(user: User, item: MenuItem) {
  // lógica complexa
}

// Uso
const hasAccess = calculatePermissions(user, menuItem);
```

---

**🚀 Pronto para usar!** Estes exemplos cobrem os casos de uso mais comuns.
