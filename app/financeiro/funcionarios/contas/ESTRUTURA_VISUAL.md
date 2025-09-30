# 🎨 Estrutura Visual - Contas de Funcionários

## 📦 Árvore de Arquivos Completa

```
app/financeiro/funcionarios/contas/
│
├── 📄 page.tsx                    (94 linhas)  ← Componente Principal
│   └─ Orquestra toda a página
│
├── 📁 types/
│   ├── index.ts                   ← Definições de tipos
│   │   ├─ User
│   │   ├─ ContaFuncionario
│   │   ├─ FuncionarioBusca
│   │   ├─ ResumoContas
│   │   └─ FiltrosContas
│
├── 📁 utils/
│   ├── formatters.ts              ← Funções de formatação
│   │   ├─ formatCurrency()
│   │   ├─ formatDate()
│   │   ├─ normalizeDecimalInput()
│   │   └─ toDecimal()
│   └── index.ts                   ← Barrel export
│
├── 📁 hooks/
│   ├── useAuth.ts                 ← Hook de autenticação
│   │   └─ Verifica login e redireciona
│   │
│   ├── useContas.ts               ← Hook principal de contas
│   │   ├─ Gerencia listagem
│   │   ├─ Controla filtros
│   │   ├─ Calcula resumo
│   │   └─ Toggle de status
│   │
│   ├── useContaForm.ts            ← Hook do formulário
│   │   ├─ Gerencia campos
│   │   ├─ Busca funcionário
│   │   └─ Submete dados
│   │
│   └── index.ts                   ← Barrel export
│
├── 📁 components/
│   ├── HeaderBar.tsx              ← Cabeçalho da página
│   │   ├─ Título
│   │   ├─ Descrição
│   │   └─ Botão "Nova conta"
│   │
│   ├── FiltrosCard.tsx            ← Card de filtros
│   │   ├─ Busca por nome/código
│   │   ├─ Filtro de status
│   │   ├─ Filtro de cargo
│   │   └─ Filtros de limite (min/max)
│   │
│   ├── ResumoCards.tsx            ← Cards de estatísticas
│   │   ├─ Contas ativas
│   │   ├─ Total em aberto
│   │   ├─ Limite total
│   │   └─ Contas no limite
│   │
│   ├── TabelaContas.tsx           ← Tabela de listagem
│   │   ├─ Cabeçalho da tabela
│   │   ├─ Linhas de dados
│   │   ├─ Botões de ação
│   │   ├─ Loading state
│   │   └─ Empty state
│   │
│   ├── ContaModal.tsx             ← Modal de criação/edição
│   │   ├─ Busca de funcionário
│   │   ├─ Campos do formulário
│   │   ├─ Validações
│   │   └─ Submissão
│   │
│   └── index.ts                   ← Barrel export
│
└── 📁 docs/
    ├── README.md                  ← Guia completo
    ├── REFATORACAO.md             ← Comparação antes/depois
    └── RESUMO.md                  ← Resumo executivo
```

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    page.tsx (Orquestrador)                  │
│                                                             │
│  1. useAuth() → Verifica autenticação                      │
│  2. useContas() → Carrega e gerencia contas               │
│  3. useState() → Controla modal                            │
│  4. Renderiza componentes                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
    ┌─────────────────────────┴─────────────────────────┐
    ↓                         ↓                         ↓
┌─────────┐            ┌─────────┐             ┌─────────┐
│  Hooks  │            │  Types  │             │  Utils  │
└─────────┘            └─────────┘             └─────────┘
    ↓
┌───────────────────────────────────────────────────────────┐
│                      Components                            │
│  ┌──────────┐  ┌────────────┐  ┌─────────────┐          │
│  │ HeaderBar│  │FiltrosCard │  │ ResumoCards │          │
│  └──────────┘  └────────────┘  └─────────────┘          │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │  TabelaContas   │  │  ContaModal     │               │
│  └─────────────────┘  └─────────────────┘               │
└───────────────────────────────────────────────────────────┘
```

## 🎭 Hierarquia de Componentes

```
<MainLayout>
  └─ <ContasFuncionariosPage>
      │
      ├─ <HeaderBar>
      │   ├─ Título
      │   ├─ Descrição
      │   └─ Botão "Nova conta"
      │
      ├─ <FiltrosCard>
      │   ├─ Input: Busca
      │   ├─ Select: Status
      │   ├─ Input: Cargo
      │   ├─ Input: Limite mín
      │   └─ Input: Limite máx
      │
      ├─ <ResumoCards>
      │   ├─ Card: Contas ativas
      │   ├─ Card: Total em aberto
      │   ├─ Card: Limite total
      │   └─ Card: Contas no limite
      │
      ├─ Alert (se houver erro)
      │
      ├─ <Card>
      │   └─ <TabelaContas>
      │       ├─ Thead (cabeçalho)
      │       ├─ Tbody
      │       │   └─ Tr (para cada conta)
      │       │       ├─ Td: Funcionário
      │       │       ├─ Td: Cargo
      │       │       ├─ Td: Limite
      │       │       ├─ Td: Em aberto
      │       │       ├─ Td: Disponível
      │       │       ├─ Td: Alerta
      │       │       ├─ Td: Status
      │       │       ├─ Td: Atualizado
      │       │       └─ Td: Ações
      │       │           ├─ Btn: Editar
      │       │           └─ Btn: Ativar/Desativar
      │       │
      │       ├─ Loading state
      │       └─ Empty state
      │
      └─ <ContaModal> (condicional)
          ├─ Header
          │   ├─ Título
          │   └─ Botão fechar
          │
          ├─ Body
          │   ├─ Alert (se houver feedback)
          │   ├─ Input: Código
          │   ├─ Button: Buscar
          │   ├─ Input: Funcionário (disabled)
          │   ├─ Input: Limite de crédito
          │   ├─ Input: Alerta de crédito
          │   ├─ Textarea: Observações
          │   └─ Switch: Conta ativa
          │
          └─ Footer
              ├─ Btn: Cancelar
              └─ Btn: Salvar
```

## 📊 Responsabilidades por Camada

### 🎯 page.tsx (Orquestrador)
```
┌───────────────────────────────────────┐
│ Responsabilidades:                    │
│ • Coordenar componentes               │
│ • Gerenciar estado do modal           │
│ • Definir layout da página            │
│ • Controlar fluxo de dados            │
│                                       │
│ NÃO faz:                              │
│ ✗ Lógica de negócio                   │
│ ✗ Chamadas à API                      │
│ ✗ Formatação de dados                 │
│ ✗ Renderização de UI detalhada       │
└───────────────────────────────────────┘
```

### 🎣 Hooks (Lógica de Negócio)
```
┌───────────────────────────────────────┐
│ useAuth                               │
│ • Verifica autenticação               │
│ • Redireciona se não autenticado      │
│ • Retorna: { user, loading }          │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ useContas                             │
│ • Busca contas na API                 │
│ • Aplica filtros                      │
│ • Calcula estatísticas                │
│ • Toggle de status                    │
│ • Retorna: { contas, filtros, ... }   │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ useContaForm                          │
│ • Gerencia estado do formulário       │
│ • Busca funcionário                   │
│ • Valida dados                        │
│ • Submete para API                    │
│ • Retorna: { campos, handlers, ... }  │
└───────────────────────────────────────┘
```

### 🧩 Components (UI)
```
┌───────────────────────────────────────┐
│ HeaderBar                             │
│ • Renderiza título                    │
│ • Renderiza descrição                 │
│ • Renderiza botão "Nova conta"        │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ FiltrosCard                           │
│ • Renderiza inputs de filtro          │
│ • Controla mudanças                   │
│ • Notifica pai sobre mudanças         │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ ResumoCards                           │
│ • Renderiza 4 cards                   │
│ • Exibe estatísticas formatadas       │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ TabelaContas                          │
│ • Renderiza tabela                    │
│ • Renderiza loading state             │
│ • Renderiza empty state               │
│ • Dispara ações (editar, toggle)      │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ ContaModal                            │
│ • Renderiza formulário                │
│ • Usa useContaForm para lógica        │
│ • Controla busca de funcionário       │
│ • Submete dados                       │
└───────────────────────────────────────┘
```

### 🛠️ Utils (Funções Puras)
```
┌───────────────────────────────────────┐
│ formatCurrency(value)                 │
│ • Input: number                       │
│ • Output: "R$ 1.234,56"               │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ formatDate(dateIso)                   │
│ • Input: "2025-01-15T10:30:00Z"       │
│ • Output: "15/01/2025 10:30:00"       │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ normalizeDecimalInput(value)          │
│ • Input: "R$ 1.234,56abc"             │
│ • Output: "1.234,56"                  │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ toDecimal(value)                      │
│ • Input: "1.234,56"                   │
│ • Output: 1234.56 (number)            │
└───────────────────────────────────────┘
```

### 📝 Types (Contratos)
```
┌───────────────────────────────────────┐
│ User                                  │
│ • id: number                          │
│ • nome: string                        │
│ • perfil: number                      │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ ContaFuncionario                      │
│ • id: number                          │
│ • codigo_funcionario: number          │
│ • funcionario_nome: string | null     │
│ • cargo_oficial: string | null        │
│ • limite_credito: number | null       │
│ • alerta_credito: number | null       │
│ • total_em_aberto: number             │
│ • limite_disponivel: number | null    │
│ • ativo: number                       │
│ • dt_criacao: string                  │
│ • dt_alteracao: string                │
│ • observacoes?: string | null         │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ FiltrosContas                         │
│ • searchTerm: string                  │
│ • statusFilter: string                │
│ • cargoFilter: string                 │
│ • limiteMinFilter: string             │
│ • limiteMaxFilter: string             │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ ResumoContas                          │
│ • totalAberto: number                 │
│ • totalLimite: number                 │
│ • totalDisponivel: number             │
│ • contasCriticas: number              │
│ • contasAtivas: number                │
└───────────────────────────────────────┘
```

## 🎯 Princípios Aplicados

### ✅ Single Responsibility Principle (SRP)
- Cada arquivo tem uma única responsabilidade
- Cada função faz apenas uma coisa

### ✅ Don't Repeat Yourself (DRY)
- Funções utilitárias reutilizáveis
- Componentes extraídos e reutilizáveis

### ✅ Separation of Concerns (SoC)
- UI separada da lógica de negócio
- Lógica de negócio separada dos dados
- Dados separados da apresentação

### ✅ Keep It Simple, Stupid (KISS)
- Código simples e direto
- Nomes descritivos
- Estrutura clara

### ✅ You Aren't Gonna Need It (YAGNI)
- Apenas o necessário implementado
- Sem código especulativo

## 📚 Documentação

Cada arquivo tem uma responsabilidade clara e está documentado:

- **README.md** - Guia arquitetural completo
- **REFATORACAO.md** - Comparação e métricas
- **RESUMO.md** - Visão geral executiva
- **ESTRUTURA_VISUAL.md** - Este arquivo

## 🚀 Resultado Final

Um sistema **modular**, **testável**, **manutenível** e **escalável**!
