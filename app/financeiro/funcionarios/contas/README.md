# Contas de Funcionários - Estrutura Refatorada

## 📁 Estrutura de Arquivos

```
app/financeiro/funcionarios/contas/
├── page.tsx              # Componente principal (orquestrador)
├── types/
│   └── index.ts          # Definições de tipos TypeScript
├── utils/
│   ├── formatters.ts     # Funções de formatação (moeda, data, decimal)
│   └── index.ts          # Barrel export
├── hooks/
│   ├── useAuth.ts        # Hook de autenticação
│   ├── useContas.ts      # Hook para gerenciar contas
│   ├── useContaForm.ts   # Hook para lógica do formulário
│   └── index.ts          # Barrel export
└── components/
    ├── HeaderBar.tsx     # Barra de cabeçalho com título e botão
    ├── FiltrosCard.tsx   # Card de filtros de busca
    ├── ResumoCards.tsx   # Cards com resumo estatístico
    ├── TabelaContas.tsx  # Tabela de listagem de contas
    ├── ContaModal.tsx    # Modal de criação/edição
    └── index.ts          # Barrel export
```

## 🎯 Padrão de Arquitetura

Esta refatoração segue o mesmo padrão do PDV (`app/pdv/`):

### 1. **Separação de Responsabilidades**
- **page.tsx**: Orquestrador principal, gerencia estado e coordena componentes
- **components/**: Componentes visuais reutilizáveis e isolados
- **hooks/**: Lógica de negócio encapsulada em hooks customizados
- **types/**: Definições de tipos centralizadas
- **utils/**: Funções auxiliares puras e reutilizáveis

### 2. **Hooks Customizados**

#### `useAuth()`
- Verifica autenticação do usuário
- Redireciona para login se não autenticado
- Retorna: `{ user, loading }`

#### `useContas(user)`
- Gerencia listagem e filtros das contas
- Carrega dados da API
- Calcula resumo estatístico
- Retorna: `{ contas, loading, errorMessage, filtros, setFiltros, resumo, loadContas, handleToggleStatus }`

#### `useContaForm(conta)`
- Gerencia estado do formulário
- Lógica de busca de funcionário
- Validação e envio de dados
- Retorna: Todos os estados e handlers do formulário

### 3. **Componentes**

#### `<HeaderBar />`
- Título da página e descrição
- Botão "Nova conta"

#### `<FiltrosCard />`
- Filtros de busca (nome, código, status, cargo, limites)
- Controle unificado de filtros

#### `<ResumoCards />`
- 4 cards com estatísticas:
  - Contas ativas
  - Total em aberto
  - Limite total configurado
  - Contas no limite

#### `<TabelaContas />`
- Listagem completa das contas
- Ações de edição e ativação/desativação
- Estado de loading e empty state

#### `<ContaModal />`
- Formulário de criação/edição
- Busca de funcionário
- Validação de dados
- Feedback de erros

### 4. **Utils**

#### Formatadores
- `formatCurrency(value)`: Formata valores em R$
- `formatDate(dateIso)`: Formata datas no padrão BR
- `normalizeDecimalInput(value)`: Remove caracteres inválidos
- `toDecimal(value)`: Converte string para número decimal

## 🔄 Fluxo de Dados

```
page.tsx (Estado Global)
    ↓
useAuth() → Verifica autenticação
    ↓
useContas() → Carrega e gerencia contas
    ↓
Components → Renderizam dados
    ↓
useContaForm() → Gerencia formulário no modal
```

## ✅ Benefícios da Refatoração

1. **Manutenibilidade**: Código organizado e fácil de localizar
2. **Testabilidade**: Hooks e utils podem ser testados isoladamente
3. **Reutilização**: Componentes e hooks podem ser usados em outras páginas
4. **Legibilidade**: Responsabilidades claras e bem definidas
5. **Escalabilidade**: Fácil adicionar novos componentes ou features
6. **Type Safety**: TypeScript com tipos bem definidos

## 🚀 Como Adicionar Novas Features

### Adicionar um novo filtro:
1. Adicione o campo em `types/index.ts` (interface `FiltrosContas`)
2. Atualize o hook `useContas` para incluir o novo filtro
3. Adicione o campo no componente `FiltrosCard`

### Adicionar um novo campo no formulário:
1. Atualize a interface `ContaFuncionario` em `types/index.ts`
2. Adicione o estado no hook `useContaForm`
3. Adicione o campo no componente `ContaModal`

### Adicionar um novo componente:
1. Crie o arquivo em `components/NomeComponente.tsx`
2. Exporte em `components/index.ts`
3. Importe e use em `page.tsx`

## 📝 Convenções

- **Nomes de arquivos**: PascalCase para componentes, camelCase para hooks e utils
- **Exports**: Use barrel exports (index.ts) para facilitar imports
- **Props**: Sempre defina interfaces para props de componentes
- **Hooks**: Prefixe com `use` e encapsule lógica complexa
- **Comentários**: Use JSDoc para funções utilitárias

## 🎨 Consistência com o Sistema

Esta estrutura mantém consistência com:
- PDV (`app/pdv/`)
- Padrões do Next.js 15 com App Router
- TypeScript strict mode
- Bootstrap 5 para estilização
