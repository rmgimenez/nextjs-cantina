# 🎯 MainLayout - Estrutura Refatorada

## 📊 Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                     MainLayout.tsx (40 linhas)              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ • Gerencia estado da sidebar (aberto/fechado)        │  │
│  │ • Usa hook useAuth para autenticação                 │  │
│  │ • Orquestra Sidebar e Header                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│           ┌────────────────┴────────────────┐               │
│           ▼                                 ▼               │
│  ┌─────────────────┐              ┌──────────────────┐     │
│  │    Sidebar      │              │     Header       │     │
│  │  (navegação)    │              │   (cabeçalho)    │     │
│  └─────────────────┘              └──────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 🗂️ Estrutura de Diretórios

```
components/
│
├── MainLayout.tsx ⭐ (Componente principal - 40 linhas)
│   └── Orquestra todo o layout
│
└── layout/ 📁 (Módulos organizados)
    │
    ├── 📄 index.ts
    │   └── Exportações centralizadas
    │
    ├── 📘 types.ts
    │   ├── User
    │   ├── MenuItem
    │   ├── MainLayoutProps
    │   ├── SidebarProps
    │   ├── HeaderProps
    │   └── ... outros tipos
    │
    ├── 📋 menuData.ts
    │   └── Configuração completa do menu
    │
    ├── 🔧 utils.ts
    │   └── getCurrentPageTitle()
    │
    ├── 🎣 useAuth.ts
    │   ├── Hook de autenticação
    │   ├── Verificação de usuário
    │   └── Função de logout
    │
    ├── 🧩 Componentes:
    │   │
    │   ├── Sidebar.tsx
    │   │   ├── SidebarHeader.tsx
    │   │   │   └── Logo + Toggle
    │   │   └── MenuItemComponent.tsx
    │   │       └── Item individual do menu
    │   │
    │   ├── Header.tsx
    │   │   └── UserProfile.tsx
    │   │       └── Dropdown do usuário
    │   │
    │   └── ... outros componentes
    │
    └── 📚 Documentação:
        ├── README.md
        ├── REFACTORING_SUMMARY.md
        └── MIGRATION_GUIDE.md
```

## 🔄 Fluxo de Dados

```
┌──────────────────────────────────────────────────────────────┐
│                      Fluxo de Autenticação                   │
└──────────────────────────────────────────────────────────────┘

  MainLayout.tsx
       │
       ├─► useAuth() ───► API: /api/auth/me
       │      │
       │      ├─► user: User | null
       │      ├─► loading: boolean
       │      └─► logout: () => Promise<void>
       │
       ├─► Sidebar ───► Recebe user
       │      │
       │      └─► Verifica permissões
       │
       └─► Header ───► Recebe user
              │
              └─► UserProfile ───► Exibe dados + logout
```

```
┌──────────────────────────────────────────────────────────────┐
│                     Fluxo de Navegação                       │
└──────────────────────────────────────────────────────────────┘

  Sidebar.tsx
       │
       ├─► menuData.ts ───► Array de MenuItems
       │                        │
       │                        ├─► Dashboard
       │                        ├─► Operacional
       │                        │    ├─► PDV
       │                        │    ├─► Caixa
       │                        │    └─► Histórico
       │                        ├─► Alunos
       │                        ├─► Produtos & Estoque
       │                        ├─► Funcionários Escola
       │                        ├─► Relatórios
       │                        ├─► Financeiro
       │                        └─► Administração
       │
       ├─► hasPermission() ───► Verifica user.perfil
       │
       ├─► isActive() ───► Compara com pathname
       │
       └─► MenuItemComponent ───► Renderiza cada item
               │
               ├─► Item pai (seção)
               └─► Itens filhos (submenus)
```

## 📦 Componentes e Responsabilidades

```
┌─────────────────────────────────────────────────────────────┐
│                    MainLayout (40 linhas)                   │
├─────────────────────────────────────────────────────────────┤
│ ✓ Estado da sidebar (aberto/fechado)                       │
│ ✓ Hook de autenticação                                     │
│ ✓ Composição de Sidebar + Header                           │
│ ✓ Layout responsivo                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Sidebar (~90 linhas)                     │
├─────────────────────────────────────────────────────────────┤
│ ✓ Renderização do menu                                     │
│ ✓ Controle de expansão de submenus                         │
│ ✓ Verificação de permissões                                │
│ ✓ Identificação de rota ativa                              │
│ ✓ Auto-expand baseado na rota                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  SidebarHeader (~60 linhas)                 │
├─────────────────────────────────────────────────────────────┤
│ ✓ Logo do sistema                                          │
│ ✓ Botão de toggle                                          │
│ ✓ Animações de transição                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              MenuItemComponent (~140 linhas)                │
├─────────────────────────────────────────────────────────────┤
│ ✓ Renderização de item individual                          │
│ ✓ Suporte a submenus                                       │
│ ✓ Animações de expansão                                    │
│ ✓ Indicadores visuais                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Header (~25 linhas)                      │
├─────────────────────────────────────────────────────────────┤
│ ✓ Título da página                                         │
│ ✓ Composição com UserProfile                               │
│ ✓ Layout sticky                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  UserProfile (~35 linhas)                   │
├─────────────────────────────────────────────────────────────┤
│ ✓ Nome do usuário                                          │
│ ✓ Perfil (Admin/Operador)                                  │
│ ✓ Dropdown com opções                                      │
│ ✓ Botão de logout                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   useAuth Hook (~50 linhas)                 │
├─────────────────────────────────────────────────────────────┤
│ ✓ Verificação de autenticação                              │
│ ✓ Estado de loading                                        │
│ ✓ Dados do usuário                                         │
│ ✓ Função de logout                                         │
│ ✓ Redirecionamento automático                              │
└─────────────────────────────────────────────────────────────┘
```

## 📈 Métricas da Refatoração

```
┌────────────────────────────────────────────────────────────┐
│                    ANTES DA REFATORAÇÃO                    │
├────────────────────────────────────────────────────────────┤
│  Arquivo único: MainLayout.tsx                             │
│  Linhas de código: ~330                                    │
│  Responsabilidades: 8+                                     │
│  Componentes: 1                                            │
│  Testabilidade: ⭐ Baixa                                   │
│  Manutenibilidade: ⭐ Baixa                                │
│  Reusabilidade: ⭐ Não                                     │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                   DEPOIS DA REFATORAÇÃO                    │
├────────────────────────────────────────────────────────────┤
│  MainLayout.tsx: 40 linhas                                 │
│  Módulos separados: 11 arquivos                            │
│  Componentes: 6                                            │
│  Hooks: 1                                                  │
│  Utilitários: 1                                            │
│  Testabilidade: ⭐⭐⭐⭐⭐ Alta                            │
│  Manutenibilidade: ⭐⭐⭐⭐⭐ Alta                         │
│  Reusabilidade: ⭐⭐⭐⭐⭐ Sim                             │
└────────────────────────────────────────────────────────────┘

                   REDUÇÃO DE 88% NO ARQUIVO PRINCIPAL
```

## 🎯 Importações Simplificadas

```typescript
// ✨ Antes (tudo em um arquivo)
import MainLayout from '@/components/MainLayout';
// Não era possível usar componentes individuais

// ✨ Depois (modular)
import MainLayout from '@/components/MainLayout';
import { 
  useAuth,              // Hook
  Sidebar,              // Componente
  Header,               // Componente
  menuItems,            // Dados
  getCurrentPageTitle,  // Utilitário
  User,                 // Tipo
  MenuItem              // Tipo
} from '@/components/layout';
```

## 🔐 Controle de Permissões

```
┌─────────────────────────────────────────────────────────────┐
│                  Sistema de Permissões                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Perfil 1 (Administrador) ────────► Acesso Total           │
│     │                                                       │
│     ├─► Dashboard                    ✓                     │
│     ├─► Operacional                  ✓                     │
│     ├─► Alunos                       ✓                     │
│     ├─► Produtos & Estoque           ✓                     │
│     ├─► Funcionários Escola          ✓                     │
│     ├─► Relatórios                   ✓                     │
│     ├─► Financeiro                   ✓                     │
│     └─► Administração                ✓                     │
│                                                             │
│  Perfil 2 (Operador) ──────────► Acesso Limitado           │
│     │                                                       │
│     ├─► Dashboard                    ✓                     │
│     ├─► Operacional                  ✓                     │
│     ├─► Alunos                       ✓ (parcial)           │
│     ├─► Produtos & Estoque           ✓                     │
│     ├─► Funcionários Escola          ✓ (parcial)           │
│     ├─► Relatórios                   ✓ (parcial)           │
│     ├─► Financeiro                   ✗                     │
│     └─► Administração                ✗                     │
└─────────────────────────────────────────────────────────────┘
```

## ✅ Resultados Alcançados

```
✅ Código modular e organizado
✅ Componentes reutilizáveis
✅ Fácil manutenção
✅ Fácil teste
✅ Separação de responsabilidades
✅ Documentação completa
✅ Sem quebrar funcionalidade existente
✅ Performance mantida
✅ TypeScript 100% tipado
✅ Estrutura escalável
```

---

**🚀 Sistema refatorado com sucesso!**
