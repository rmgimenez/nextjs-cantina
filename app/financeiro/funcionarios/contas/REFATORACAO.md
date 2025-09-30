# Refatoração: Contas de Funcionários

## 📊 Comparação Antes vs Depois

### ❌ Antes da Refatoração

**Estrutura:**
```
app/financeiro/funcionarios/contas/
└── page.tsx (739 linhas - TUDO em um arquivo)
```

**Problemas:**
- ❌ Arquivo único com 739 linhas de código
- ❌ Lógica de negócio misturada com apresentação
- ❌ Difícil de testar individualmente
- ❌ Difícil de manter e entender o fluxo
- ❌ Repetição de código (formatadores, validações)
- ❌ Estados e lógica complexa no componente principal
- ❌ Componente modal acoplado ao componente principal

### ✅ Depois da Refatoração

**Estrutura:**
```
app/financeiro/funcionarios/contas/
├── page.tsx (94 linhas - Orquestrador limpo)
├── README.md (Documentação completa)
├── types/
│   └── index.ts (Tipos centralizados)
├── utils/
│   ├── formatters.ts (Funções de formatação)
│   └── index.ts (Exports)
├── hooks/
│   ├── useAuth.ts (Autenticação)
│   ├── useContas.ts (Gerenciamento de contas)
│   ├── useContaForm.ts (Lógica do formulário)
│   └── index.ts (Exports)
└── components/
    ├── HeaderBar.tsx (Cabeçalho)
    ├── FiltrosCard.tsx (Filtros)
    ├── ResumoCards.tsx (Estatísticas)
    ├── TabelaContas.tsx (Tabela)
    ├── ContaModal.tsx (Modal)
    └── index.ts (Exports)
```

**Benefícios:**
- ✅ Código organizado em 13 arquivos especializados
- ✅ Componente principal com apenas 94 linhas
- ✅ Lógica de negócio isolada em hooks
- ✅ Componentes reutilizáveis e testáveis
- ✅ Tipos bem definidos e centralizados
- ✅ Funções auxiliares puras e documentadas
- ✅ Fácil manutenção e adição de features
- ✅ Padrão consistente com o resto do sistema (PDV)

## 📈 Métricas de Melhoria

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Linhas por arquivo | 739 | ~80 (média) | 89% redução |
| Arquivos | 1 | 13 | Melhor organização |
| Responsabilidades | Misturadas | Separadas | 100% |
| Testabilidade | Baixa | Alta | ⬆️ |
| Reutilização | Impossível | Fácil | ⬆️ |
| Manutenibilidade | Difícil | Fácil | ⬆️ |

## 🎯 Detalhamento dos Arquivos

### page.tsx (94 linhas)
```typescript
// ANTES: 739 linhas com tudo misturado
// DEPOIS: 94 linhas focadas em orquestração

export default function ContasFuncionariosPage() {
  // Hooks customizados encapsulam toda a lógica
  const { user, loading } = useAuth();
  const { contas, filtros, resumo, ... } = useContas(user);
  
  // Apenas gerencia estado local do modal
  const [showModal, setShowModal] = useState(false);
  
  // Renderiza componentes organizados
  return (
    <MainLayout>
      <HeaderBar onNovaConta={...} />
      <FiltrosCard filtros={...} />
      <ResumoCards resumo={...} />
      <TabelaContas contas={...} />
      {showModal && <ContaModal ... />}
    </MainLayout>
  );
}
```

### types/index.ts
```typescript
// Centralize todos os tipos TypeScript
export interface User { ... }
export interface ContaFuncionario { ... }
export interface FuncionarioBusca { ... }
export interface ResumoContas { ... }
export interface FiltrosContas { ... }
```

### utils/formatters.ts
```typescript
// Funções puras e reutilizáveis
export function formatCurrency(value) { ... }
export function formatDate(dateIso) { ... }
export function normalizeDecimalInput(value) { ... }
export function toDecimal(value) { ... }
```

### hooks/useAuth.ts
```typescript
// Encapsula lógica de autenticação
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Verifica autenticação
    // Redireciona se necessário
  }, []);
  
  return { user, loading };
}
```

### hooks/useContas.ts
```typescript
// Encapsula lógica de gerenciamento de contas
export function useContas(user) {
  const [contas, setContas] = useState([]);
  const [filtros, setFiltros] = useState({...});
  
  // Carrega contas com filtros
  const loadContas = async () => { ... };
  
  // Calcula resumo estatístico
  const resumo = useMemo(() => { ... }, [contas]);
  
  // Alterna status da conta
  const handleToggleStatus = async (conta) => { ... };
  
  return { contas, filtros, resumo, loadContas, ... };
}
```

### hooks/useContaForm.ts
```typescript
// Encapsula lógica do formulário
export function useContaForm(conta) {
  const [codigo, setCodigo] = useState('');
  const [funcionario, setFuncionario] = useState(null);
  // ... outros estados
  
  const handleBuscarFuncionario = async () => { ... };
  const handleSubmit = async (onSaved) => { ... };
  
  return { codigo, funcionario, handleBuscarFuncionario, ... };
}
```

### components/HeaderBar.tsx
```typescript
// Componente simples e focado
export function HeaderBar({ onNovaConta }) {
  return (
    <div className='d-flex justify-content-between'>
      <div>
        <h1>Contas de Funcionários</h1>
        <p>Configure limites de crédito...</p>
      </div>
      <button onClick={onNovaConta}>Nova conta</button>
    </div>
  );
}
```

### components/FiltrosCard.tsx
```typescript
// Gerencia todos os filtros de forma organizada
export function FiltrosCard({ filtros, onFiltrosChange }) {
  return (
    <div className='card'>
      <div className='row'>
        <input /> {/* Busca */}
        <select /> {/* Status */}
        <input /> {/* Cargo */}
        <input /> {/* Limite min */}
        <input /> {/* Limite max */}
      </div>
    </div>
  );
}
```

### components/ResumoCards.tsx
```typescript
// Exibe estatísticas de forma visual
export function ResumoCards({ resumo }) {
  return (
    <div className='row'>
      <Card titulo='Contas ativas' valor={resumo.contasAtivas} />
      <Card titulo='Total em aberto' valor={resumo.totalAberto} />
      <Card titulo='Limite total' valor={resumo.totalLimite} />
      <Card titulo='Contas no limite' valor={resumo.contasCriticas} />
    </div>
  );
}
```

### components/TabelaContas.tsx
```typescript
// Renderiza tabela com loading e empty state
export function TabelaContas({ contas, loading, onEdit, onToggleStatus }) {
  if (loading) return <Spinner />;
  
  return (
    <table>
      <thead>...</thead>
      <tbody>
        {contas.map(conta => (
          <tr key={conta.id}>
            <td>{conta.funcionario_nome}</td>
            ...
            <td>
              <button onClick={() => onEdit(conta)}>✏️</button>
              <button onClick={() => onToggleStatus(conta)}>⏸️</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### components/ContaModal.tsx
```typescript
// Modal isolado com sua própria lógica
export function ContaModal({ conta, onClose, onSaved }) {
  const {
    codigo, funcionario, limite, alerta,
    handleBuscarFuncionario, handleSubmit
  } = useContaForm(conta);
  
  return (
    <div className='modal'>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSaved); }}>
        <input value={codigo} ... />
        <input value={limite} ... />
        <button>Salvar</button>
      </form>
    </div>
  );
}
```

## 🔄 Padrão de Responsabilidades

```
┌─────────────────────────────────────────────┐
│           page.tsx (Orquestrador)           │
│  - Gerencia estado de modal                │
│  - Coordena componentes                     │
│  - Define layout da página                  │
└─────────────────────────────────────────────┘
              ↓           ↓           ↓
    ┌─────────────┐  ┌──────────┐  ┌──────────┐
    │    Hooks    │  │  Types   │  │  Utils   │
    │  - useAuth  │  │  - User  │  │  - format│
    │  - useContas│  │  - Conta │  │  - parse │
    │  - useForm  │  │  - Filtro│  │  - valid │
    └─────────────┘  └──────────┘  └──────────┘
              ↓
    ┌─────────────────────────────────────────┐
    │          Components (Visuais)           │
    │  - HeaderBar  - FiltrosCard            │
    │  - ResumoCards - TabelaContas          │
    │  - ContaModal                           │
    └─────────────────────────────────────────┘
```

## 🚀 Próximos Passos

1. ✅ Refatoração concluída
2. ⏳ Testar funcionalidade completa
3. ⏳ Aplicar mesmo padrão em outras páginas
4. ⏳ Adicionar testes unitários
5. ⏳ Documentar componentes com Storybook

## 📝 Lições Aprendidas

1. **Separação de responsabilidades** é fundamental
2. **Hooks customizados** encapsulam lógica complexa perfeitamente
3. **Componentes pequenos** são mais fáceis de manter
4. **Types centralizados** evitam duplicação
5. **Utils reutilizáveis** economizam código
6. **Documentação** facilita entendimento futuro
7. **Padrões consistentes** aceleram desenvolvimento

## 🎓 Referências

- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Best Practices](https://typescript-eslint.io/)
- [PDV Pattern](../../../pdv/README_ESTRUTURA.md)
