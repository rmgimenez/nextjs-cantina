# 🚀 Guia Rápido - Contas de Funcionários

## 🎯 Início Rápido

### Acessar a Página
```
http://localhost:3000/financeiro/funcionarios/contas
```

---

## 📁 Onde está cada coisa?

### Preciso adicionar um novo filtro?
👉 `components/FiltrosCard.tsx`

### Preciso mudar a lógica de busca?
👉 `hooks/useContas.ts`

### Preciso adicionar um campo no formulário?
👉 `components/ContaModal.tsx` e `hooks/useContaForm.ts`

### Preciso adicionar um novo tipo?
👉 `types/index.ts`

### Preciso formatar dados?
👉 `utils/formatters.ts`

### Preciso mudar a tabela?
👉 `components/TabelaContas.tsx`

### Preciso mudar as estatísticas?
👉 `components/ResumoCards.tsx` e `hooks/useContas.ts` (função resumo)

---

## 🔧 Tarefas Comuns

### Adicionar uma nova coluna na tabela

1. **Adicione o tipo** em `types/index.ts`:
```typescript
export interface ContaFuncionario {
  // ... existentes
  nova_coluna: string; // NOVO
}
```

2. **Atualize a tabela** em `components/TabelaContas.tsx`:
```typescript
<thead>
  <tr>
    {/* ... colunas existentes */}
    <th>Nova Coluna</th> {/* NOVO */}
  </tr>
</thead>
<tbody>
  {contas.map((conta) => (
    <tr key={conta.id}>
      {/* ... colunas existentes */}
      <td>{conta.nova_coluna}</td> {/* NOVO */}
    </tr>
  ))}
</tbody>
```

---

### Adicionar um novo filtro

1. **Adicione o tipo** em `types/index.ts`:
```typescript
export interface FiltrosContas {
  // ... existentes
  novoFiltro: string; // NOVO
}
```

2. **Atualize o hook** em `hooks/useContas.ts`:
```typescript
const [filtros, setFiltros] = useState<FiltrosContas>({
  // ... existentes
  novoFiltro: '', // NOVO
});

// Na função loadContas:
if (filtros.novoFiltro.trim()) {
  params.append('novo_filtro', filtros.novoFiltro.trim());
}
```

3. **Adicione o campo** em `components/FiltrosCard.tsx`:
```typescript
<div className='col-md-3'>
  <label className='form-label'>Novo Filtro</label>
  <input
    type='text'
    className='form-control'
    value={filtros.novoFiltro}
    onChange={(e) => handleChange('novoFiltro', e.target.value)}
  />
</div>
```

---

### Adicionar campo no formulário

1. **Atualize o hook** em `hooks/useContaForm.ts`:
```typescript
const [novoCampo, setNovoCampo] = useState('');

return {
  // ... existentes
  novoCampo,
  setNovoCampo,
};
```

2. **Adicione no modal** em `components/ContaModal.tsx`:
```typescript
const { novoCampo, setNovoCampo } = useContaForm(conta);

<div className='col-md-6'>
  <label className='form-label'>Novo Campo</label>
  <input
    type='text'
    className='form-control'
    value={novoCampo}
    onChange={(e) => setNovoCampo(e.target.value)}
  />
</div>
```

---

### Adicionar nova estatística

1. **Atualize o tipo** em `types/index.ts`:
```typescript
export interface ResumoContas {
  // ... existentes
  novaEstatistica: number; // NOVO
}
```

2. **Calcule no hook** em `hooks/useContas.ts`:
```typescript
const resumo: ResumoContas = useMemo(() => {
  // ... cálculos existentes
  const novaEstatistica = contas.filter(...).length;
  
  return {
    // ... existentes
    novaEstatistica,
  };
}, [contas]);
```

3. **Exiba no componente** em `components/ResumoCards.tsx`:
```typescript
<div className='col-md-3'>
  <div className='card border-0 shadow-sm h-100'>
    <div className='card-body'>
      <h6 className='text-muted'>Nova Estatística</h6>
      <h4 className='mb-0'>{resumo.novaEstatistica}</h4>
    </div>
  </div>
</div>
```

---

### Reutilizar um componente em outra página

```typescript
// Em qualquer outra página
import { TabelaContas } from '../funcionarios/contas/components';
import { formatCurrency } from '../funcionarios/contas/utils';

function MinhaOutraPagina() {
  const contas = [...]; // suas contas
  
  return (
    <TabelaContas
      contas={contas}
      loading={false}
      onEdit={(conta) => console.log('Editar', conta)}
      onToggleStatus={(conta) => console.log('Toggle', conta)}
    />
  );
}
```

---

### Testar um hook isoladamente

```typescript
// Em um arquivo de teste
import { renderHook, waitFor } from '@testing-library/react-hooks';
import { useContas } from './hooks/useContas';

test('deve carregar contas', async () => {
  const mockUser = { id: 1, nome: 'Teste', perfil: 1 };
  
  const { result } = renderHook(() => useContas(mockUser));
  
  await waitFor(() => {
    expect(result.current.contas).toHaveLength(10);
  });
});
```

---

## 💡 Dicas

### Imports organizados
```typescript
// Sempre use os barrel exports
import { ContaFuncionario, FiltrosContas } from './types';
import { useAuth, useContas } from './hooks';
import { HeaderBar, TabelaContas } from './components';
import { formatCurrency } from './utils';

// Evite:
import { ContaFuncionario } from './types/index';
import { useAuth } from './hooks/useAuth';
```

### Type Safety
```typescript
// Sempre defina tipos para props
interface MinhaPropsInterface {
  dados: ContaFuncionario[];
  onEdit: (conta: ContaFuncionario) => void;
}

function MeuComponente({ dados, onEdit }: MinhaPropsInterface) {
  // ...
}
```

### Hooks customizados
```typescript
// Hooks devem retornar objetos com nomes claros
function useMeuHook() {
  return {
    dados,
    loading,
    error,
    handleAction,
  };
}

// Use assim:
const { dados, loading, handleAction } = useMeuHook();
```

---

## 🐛 Problemas Comuns

### Erro: "Cannot find module './types'"
✅ **Solução:** Verifique se existe `types/index.ts`

### Erro: "Hook called outside component"
✅ **Solução:** Hooks só podem ser usados em componentes ou outros hooks

### Erro: "Property does not exist on type"
✅ **Solução:** Atualize a interface em `types/index.ts`

### Componente não atualiza após mudança
✅ **Solução:** Verifique se está usando `useState` ou se o hook está retornando o valor atualizado

---

## 📞 Precisa de Ajuda?

Consulte a documentação completa:

1. **README.md** - Arquitetura e guia completo
2. **REFATORACAO.md** - Comparação antes/depois
3. **ESTRUTURA_VISUAL.md** - Diagramas e fluxos
4. **STATUS.md** - Status da refatoração

---

## ✅ Checklist antes de commitar

- [ ] Código sem erros TypeScript
- [ ] Componentes testados manualmente
- [ ] Imports organizados
- [ ] Código formatado
- [ ] Documentação atualizada (se necessário)
- [ ] Nomes descritivos e em português
- [ ] Seguindo padrão da estrutura

---

**Dica:** Este arquivo é um guia rápido. Para referência completa, consulte README.md
