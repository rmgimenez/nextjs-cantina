# PDV - Estrutura Refatorada

## 📁 Estrutura de Arquivos

```
app/pdv/
├── components/          # Componentes React reutilizáveis
│   ├── index.ts        # Exportação centralizada
│   ├── HeaderBar.tsx   # Cabeçalho com status do caixa
│   ├── SeletorTipoCliente.tsx  # Seletor de tipo de cliente (Aluno/Funcionário/Geral)
│   ├── ClienteCard.tsx         # Card principal de cliente (container)
│   ├── AlunoCard.tsx           # Detalhes do aluno selecionado
│   ├── FuncionarioCard.tsx     # Detalhes do funcionário selecionado
│   ├── BuscaCliente.tsx        # Campo de busca com sugestões
│   ├── ProdutosGrid.tsx        # Grid de produtos disponíveis
│   ├── CarrinhoCompras.tsx     # Carrinho de compras
│   ├── Alertas.tsx             # Mensagens e alertas
│   ├── AtalhosTeclado.tsx      # Legenda de atalhos
│   ├── ModalRestricoes.tsx     # Modal de restrições do aluno
│   └── ModalBloqueioVenda.tsx  # Modal de bloqueio por restrição
│
├── hooks/               # Hooks customizados
│   ├── index.ts        # Exportação centralizada
│   ├── usePDVAuth.ts   # Gerenciamento de autenticação
│   ├── useCaixaStatus.ts       # Status do caixa
│   ├── useProdutos.ts          # Carregamento de produtos
│   ├── useBuscaCliente.ts      # Busca de alunos e funcionários
│   ├── useCarrinho.ts          # Lógica do carrinho
│   └── useDadosCliente.ts      # Gerenciamento de dados do cliente
│
├── types/               # Definições de tipos TypeScript
│   └── index.ts        # Todas as interfaces e tipos
│
├── utils/               # Funções utilitárias
│   └── index.ts        # Helpers diversos
│
├── page.tsx            # Página principal (refatorada)
├── pdv.module.css      # Estilos do PDV
└── README_ESTRUTURA.md # Este arquivo

```

## 🎯 Objetivos da Refatoração

1. **Separação de Responsabilidades**: Cada componente tem uma única responsabilidade
2. **Reutilização**: Componentes menores podem ser facilmente reutilizados
3. **Manutenibilidade**: Mais fácil encontrar e corrigir bugs
4. **Testabilidade**: Componentes isolados são mais fáceis de testar
5. **Legibilidade**: Código mais limpo e organizado

## 📦 Componentes

### HeaderBar
**Responsabilidade**: Exibir informações do caixa e link para gerenciamento  
**Props**: `statusCaixa`

### SeletorTipoCliente
**Responsabilidade**: Permitir seleção do tipo de cliente (Aluno/Funcionário/Geral)  
**Props**: `tipoCliente`, `onChangeTipoCliente`, `onLimparVenda`

### ClienteCard
**Responsabilidade**: Container principal para exibição de dados do cliente  
**Props**: Múltiplas props para alunos, funcionários e busca  
**Subcomponentes**: `AlunoCard`, `FuncionarioCard`, `BuscaCliente`

### ProdutosGrid
**Responsabilidade**: Exibir grid de produtos com busca  
**Props**: `produtos`, `busca`, `onBuscaChange`, `onAddItem`, `tipoCliente`, `precosCargo`

### CarrinhoCompras
**Responsabilidade**: Exibir e gerenciar itens do carrinho  
**Props**: `itens`, `produtos`, `totais`, handlers diversos

### Modais
- **ModalRestricoes**: Exibe restrições do aluno ao selecioná-lo
- **ModalBloqueioVenda**: Bloqueia venda quando há produtos restritos no carrinho

## 🎣 Hooks Customizados

### usePDVAuth
**Responsabilidade**: Gerenciar autenticação e redirecionamento  
**Retorna**: `{ user, carregando }`

### useCaixaStatus
**Responsabilidade**: Verificar status do caixa e redirecionar se fechado  
**Retorna**: `{ statusCaixa }`

### useProdutos
**Responsabilidade**: Carregar lista de produtos ativos  
**Retorna**: `{ produtos, carregando }`

### useBuscaAlunos / useBuscaFuncionarios
**Responsabilidade**: Gerenciar busca com debounce  
**Retorna**: Estados e setters para busca e sugestões

### useCarrinho
**Responsabilidade**: Gerenciar estado e cálculos do carrinho  
**Retorna**: `{ itens, totais, addItem, updateItem, removerItem, limparCarrinho }`

### useDadosCliente
**Responsabilidade**: Gerenciar todos os dados do cliente (aluno ou funcionário)  
**Retorna**: Estados e funções para ambos os tipos de cliente

## 🔧 Utilitários

- `getProdutoIcon(tipo)`: Retorna emoji do produto baseado no tipo
- `getTipoRefeicaoLabel(tipo)`: Formata label de tipo de refeição
- `formatarMoeda(valor)`: Formata valores monetários
- `isNumeroValido(valor)`: Valida números positivos

## 📝 Types

Todos os tipos estão centralizados em `types/index.ts`:
- Interfaces de entidades (User, Produto, Aluno, etc.)
- Tipos auxiliares (FormaPagamento, TipoCliente, etc.)
- Interfaces de estado (StatusCaixa, ResumoVenda, etc.)

## 🚀 Benefícios

### Antes da Refatoração
- ❌ 1 arquivo com 1500+ linhas
- ❌ Difícil encontrar bugs
- ❌ Código duplicado
- ❌ Difícil testar

### Depois da Refatoração
- ✅ 20+ arquivos organizados
- ✅ Componentes com 50-200 linhas cada
- ✅ Código reutilizável
- ✅ Fácil manutenção
- ✅ Testável e escalável

## 🔄 Fluxo de Dados

```
page.tsx (Container)
    ↓
Hooks (usePDVAuth, useCaixaStatus, etc.)
    ↓
Componentes (HeaderBar, ClienteCard, etc.)
    ↓
Subcomponentes (AlunoCard, FuncionarioCard, etc.)
```

## 💡 Próximos Passos

1. **Testes Unitários**: Adicionar testes para hooks e componentes
2. **Storybook**: Documentar componentes visualmente
3. **Performance**: Adicionar memoization onde necessário
4. **Acessibilidade**: Melhorar ARIA labels e navegação por teclado
5. **Responsividade**: Melhorar layout em dispositivos móveis

## 📚 Documentação Adicional

- [README Principal](../../README.md)
- [Melhorias do PDV](./README_MELHORIAS.md)
- [Sobre o Sistema](../../sobre.md)
