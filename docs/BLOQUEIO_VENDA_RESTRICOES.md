# Bloqueio de Venda por Restrições de Produtos - PDV

## 📋 Resumo

Implementação de validação preventiva de restrições no PDV, impedindo que o operador finalize uma venda que contenha produtos restritos para o aluno, com modal informativo detalhado.

## ✨ Funcionalidades Implementadas

### 1. **Validação Pré-Venda**
- Sistema valida automaticamente os produtos no carrinho antes de processar a venda
- Verifica restrições por produto específico
- Verifica restrições por tipo de produto
- Impede a finalização da venda se houver produtos bloqueados

### 2. **Modal de Bloqueio de Venda**
- Interface visual clara e informativa
- Lista todos os produtos bloqueados
- Mostra o tipo de restrição para cada produto
- Exibe o motivo da restrição (se cadastrado)
- Oferece ações para resolver o problema

### 3. **Remoção Automática**
- Botão para remover automaticamente todos os produtos bloqueados
- Confirmação visual com mensagem de sucesso
- Permite que o operador continue a venda com os produtos permitidos

## 🎯 Fluxo de Funcionamento

```
┌─────────────────────────────────────┐
│ 1. Operador adiciona produtos      │
│    ao carrinho                      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Operador clica em                │
│    "Finalizar Venda" (F9)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Sistema valida restrições        │
│    - Verifica produto específico    │
│    - Verifica tipo de produto       │
└──────────────┬──────────────────────┘
               │
               ├── SEM RESTRIÇÕES ────────────┐
               │                              │
               │                              ▼
               │                  ┌───────────────────────┐
               │                  │ Venda prossegue       │
               │                  │ normalmente           │
               │                  └───────────────────────┘
               │
               ├── COM RESTRIÇÕES ────────────┐
               │                              │
               │                              ▼
               │                  ┌───────────────────────┐
               │                  │ Modal de Bloqueio     │
               │                  │ é exibido             │
               │                  └───────┬───────────────┘
               │                          │
               │                          ├── Voltar ao Carrinho
               │                          │   (remove manualmente)
               │                          │
               │                          └── Remover Bloqueados
               │                              (remove automaticamente)
               │
               ▼
       Venda bloqueada
```

## 🎨 Características Visuais do Modal

### Cabeçalho (Vermelho/Danger)
- Ícone: 🚫 + `bi-x-circle-fill`
- Título: "VENDA BLOQUEADA - Produtos Restritos"
- Botão fechar (X) no canto

### Corpo do Modal
1. **Alerta do Aluno** (vermelho)
   - Ícone grande de pessoa bloqueada
   - Nome e RA do aluno

2. **Alerta de Atenção** (amarelo)
   - Mensagem explicando o bloqueio
   - Ícone de triângulo de alerta

3. **Lista de Produtos Bloqueados**
   - Cards individuais para cada produto
   - Ícone emoji do produto
   - Nome e tipo do produto em destaque
   - Borda lateral vermelha
   - Tipo de restrição claramente identificado
   - Motivo da restrição (quando disponível)
   - Numeração para fácil contagem

4. **Instruções** (azul/info)
   - O que fazer para resolver
   - Lista de ações possíveis

### Rodapé (Cinza claro)
- **Botão "Voltar ao Carrinho"** (secundário)
  - Fecha o modal
  - Permite remoção manual
  
- **Botão "Remover Produtos Bloqueados"** (vermelho/danger)
  - Remove automaticamente os produtos restritos
  - Fecha o modal
  - Mostra mensagem de confirmação

## 🔧 Detalhes Técnicos

### Novos Estados
```typescript
const [showBloqueioVendaModal, setShowBloqueioVendaModal] = useState(false);
const [produtosBloqueados, setProdutosBloqueados] = useState<Array<{
  produto: Produto;
  restricao: any;
}>>([]);
```

### Função de Validação
```typescript
function validarRestricoesVenda(): Array<{ produto: Produto; restricao: any }> {
  const bloqueados: Array<{ produto: Produto; restricao: any }> = [];

  // Itera sobre cada item do carrinho
  for (const item of itens) {
    const produto = produtos.find((p) => p.id === item.id_produto);
    if (!produto) continue;

    // Verifica restrição de produto específico
    const restricaoProduto = restricoesAluno.find(
      (r) => r.tipo_restricao === 'PRODUTO' && r.id_produto === produto.id
    );
    if (restricaoProduto) {
      bloqueados.push({ produto, restricao: restricaoProduto });
      continue;
    }

    // Verifica restrição de tipo de produto
    const restricaoTipo = restricoesAluno.find(
      (r) => r.tipo_restricao === 'TIPO_PRODUTO' && 
            r.tipo_produto_nome === produto.tipo_nome
    );
    if (restricaoTipo) {
      bloqueados.push({ produto, restricao: restricaoTipo });
    }
  }

  return bloqueados;
}
```

### Validação na Finalização
```typescript
async function finalizarVenda() {
  // ... validações anteriores ...
  
  // Validar restrições para alunos
  if (tipoCliente === 'ALUNO' && aluno && restricoesAluno.length > 0) {
    const bloqueados = validarRestricoesVenda();
    if (bloqueados.length > 0) {
      setProdutosBloqueados(bloqueados);
      setShowBloqueioVendaModal(true);
      return; // Bloqueia a venda
    }
  }
  
  // ... continua com a venda ...
}
```

## 🛡️ Segurança em Camadas

### 1ª Camada - Frontend (PDV)
- Validação preventiva antes de enviar para o backend
- Interface visual clara e informativa
- Impede ações acidentais

### 2ª Camada - Backend (API)
- Validação adicional em `/api/pdv/venda/route.ts`
- Garante integridade mesmo se o frontend for burlado
- Retorna erro detalhado se houver restrição

## 📊 Tipos de Restrições Detectadas

### 1. Restrição por Produto Específico
```
Exemplo: "Refrigerante Cola-Cola 2L"
- Bloqueia apenas este produto específico
- Outros produtos do mesmo tipo são permitidos
```

### 2. Restrição por Tipo de Produto
```
Exemplo: "BEBIDAS"
- Bloqueia todos os produtos do tipo BEBIDAS
- Inclui refrigerantes, sucos, água, etc.
```

## 💡 Casos de Uso

### Cenário 1: Restrição Médica
```
Aluno: João Silva (RA: 12345)
Restrição: TIPO_PRODUTO - DOCES
Motivo: Diabético - não pode consumir açúcar

Carrinho:
✅ Salgado (Coxinha) - PERMITIDO
❌ Brigadeiro - BLOQUEADO (tipo DOCES)
❌ Bolo de Chocolate - BLOQUEADO (tipo DOCES)
✅ Suco Natural - PERMITIDO

Resultado: Modal exibe 2 produtos bloqueados
```

### Cenário 2: Restrição Alimentar
```
Aluno: Maria Santos (RA: 67890)
Restrição: PRODUTO - "Pizza de Calabresa"
Motivo: Alergia a calabresa

Carrinho:
✅ Pizza de Mussarela - PERMITIDO
❌ Pizza de Calabresa - BLOQUEADO
✅ Refrigerante - PERMITIDO

Resultado: Modal exibe 1 produto bloqueado
```

## 🎨 Componentes Bootstrap Utilizados

- **Modal**: `modal`, `modal-dialog`, `modal-content`
- **Modal Backdrop**: `modal-backdrop`
- **Alertas**: `alert-danger`, `alert-warning`, `alert-info`
- **Lista**: `list-group`, `list-group-item`
- **Badges**: `badge bg-danger`
- **Botões**: `btn btn-danger`, `btn btn-outline-secondary`
- **Ícones**: Bootstrap Icons (`bi-*`)

## 📝 Melhorias Futuras Sugeridas

- [ ] Destaque visual nos produtos restritos na grade de produtos
- [ ] Filtro "Ocultar produtos restritos" na grade
- [ ] Log de tentativas de venda de produtos restritos
- [ ] Notificação ao responsável sobre tentativas bloqueadas
- [ ] Relatório de produtos mais restritos
- [ ] Sugestão de produtos alternativos similares
- [ ] Som de alerta ao adicionar produto restrito

## 📚 Arquivos Modificados

- `app/pdv/page.tsx`
  - Adicionados estados: `showBloqueioVendaModal`, `produtosBloqueados`
  - Nova função: `validarRestricoesVenda()`
  - Modificada função: `finalizarVenda()` - adiciona validação
  - Modificada função: `limparVenda()` - limpa novos estados
  - Novo componente: Modal de Bloqueio de Venda

## 🔗 Referências

- **RF-005**: Restrições de Consumo para Alunos
- **API**: `/api/alunos/restricoes/[ra]`
- **API**: `/api/pdv/venda`
- **Bootstrap Modal**: https://getbootstrap.com/docs/5.0/components/modal/
- **Bootstrap Icons**: https://icons.getbootstrap.com/

## ✅ Benefícios da Implementação

1. **Prevenção de Erros**: Impede vendas indevidas antes de processar
2. **Experiência do Usuário**: Interface clara e intuitiva
3. **Eficiência**: Remoção automática de produtos bloqueados
4. **Segurança**: Dupla camada de validação (frontend + backend)
5. **Conformidade**: Garante respeito às restrições cadastradas
6. **Informação**: Operador entende o motivo do bloqueio
7. **Produtividade**: Resolve problema rapidamente sem abandonar a venda
