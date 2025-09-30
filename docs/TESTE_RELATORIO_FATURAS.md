# Guia de Teste - Relatório de Faturas

## Pré-requisitos

Antes de testar, certifique-se de que:

1. ✅ O servidor Next.js está rodando (`pnpm dev`)
2. ✅ Você tem faturas cadastradas no banco de dados
3. ✅ Você está autenticado no sistema
4. ✅ As bibliotecas jsPDF e jspdf-autotable estão instaladas

## Instalação das Dependências

```bash
pnpm add jspdf jspdf-autotable
```

## Testes Via Interface Web

### Teste 1: Acesso à Página

1. Abra o navegador e acesse: `http://localhost:3001/financeiro/relatorios/faturas`
2. ✅ Verificar se a página carrega sem erros
3. ✅ Verificar se os filtros são exibidos corretamente
4. ✅ Verificar se o layout está correto (Bootstrap)

### Teste 2: Buscar Funcionário

1. No campo "Funcionário", digite pelo menos 3 caracteres
2. ✅ Verificar se a lista de funcionários aparece
3. ✅ Clicar em um funcionário da lista
4. ✅ Verificar se o funcionário é selecionado
5. ✅ Clicar no botão X para limpar a seleção

### Teste 3: Gerar PDF - Relatório Mensal

1. Preencher os filtros:
   - Mês Início: `2025-01`
   - Mês Fim: `2025-01`
   - Funcionário: (deixar vazio)
   - Status: `Todos os status`
2. Clicar em "Gerar Relatório PDF"
3. ✅ Verificar se o botão mostra "Gerando PDF..."
4. ✅ Verificar se o PDF é baixado automaticamente
5. ✅ Abrir o PDF e verificar:
   - Cabeçalho com título
   - Informações dos filtros
   - Tabela com dados das faturas
   - Agrupamento por funcionário
   - Subtotais por funcionário
   - Total geral em destaque
   - Rodapé com numeração

### Teste 4: Gerar PDF - Funcionário Específico

1. Preencher os filtros:
   - Mês Início: (deixar vazio)
   - Mês Fim: (deixar vazio)
   - Funcionário: Selecionar um funcionário da lista
   - Status: `Todos os status`
2. Clicar em "Gerar Relatório PDF"
3. ✅ Verificar se o PDF contém apenas as faturas do funcionário selecionado
4. ✅ Verificar se o nome do funcionário aparece no cabeçalho do PDF

### Teste 5: Gerar PDF - Status Específico

1. Preencher os filtros:
   - Mês Início: (deixar vazio)
   - Mês Fim: (deixar vazio)
   - Funcionário: (deixar vazio)
   - Status: `Gerada`
2. Clicar em "Gerar Relatório PDF"
3. ✅ Verificar se o PDF contém apenas faturas com status "Gerada"
4. ✅ Verificar se o status aparece no cabeçalho do PDF

### Teste 6: Sem Resultados

1. Preencher os filtros com valores que não retornam resultados:
   - Mês Início: `2030-01`
   - Mês Fim: `2030-01`
2. Clicar em "Gerar Relatório PDF"
3. ✅ Verificar se um alerta é exibido: "Nenhuma fatura encontrada..."

### Teste 7: Validação - Sem Filtros

1. Deixar todos os filtros vazios
2. Clicar em "Gerar Relatório PDF"
3. ✅ Verificar se um alerta é exibido pedindo para selecionar pelo menos um filtro

## Testes Via API (Postman/Thunder Client)

### Teste API 1: Requisição Básica

```
GET http://localhost:3001/api/relatorios/faturas/pdf?mesInicio=2025-01&mesFim=2025-01
```

✅ Verificar:
- Status: 200 OK
- Content-Type: application/pdf
- Arquivo PDF é retornado

### Teste API 2: Com Todos os Filtros

```
GET http://localhost:3001/api/relatorios/faturas/pdf?mesInicio=2025-01&mesFim=2025-03&codigoFuncionario=123&status=GERADA
```

✅ Verificar:
- Status: 200 OK
- PDF com dados filtrados corretamente

### Teste API 3: Sem Resultados

```
GET http://localhost:3001/api/relatorios/faturas/pdf?mesInicio=2030-01&mesFim=2030-01
```

✅ Verificar:
- Status: 404 Not Found
- JSON: `{ "error": "Nenhuma fatura encontrada..." }`

## Checklist de Validação do PDF

Ao abrir o PDF gerado, verificar:

### Layout Geral
- [ ] Cabeçalho com título "Relatório de Faturas - Departamento Pessoal"
- [ ] Cores do sistema aplicadas (azul e vermelho)
- [ ] Texto legível e bem formatado
- [ ] Margens adequadas

### Informações do Cabeçalho
- [ ] Período do relatório (se aplicável)
- [ ] Nome do funcionário (se filtrado)
- [ ] Status das faturas (se filtrado)
- [ ] Data de emissão do relatório

### Tabela de Dados
- [ ] Cabeçalho da tabela com colunas: Mês, Itens, Valor Total, Status, Vencimento
- [ ] Linhas agrupadas por funcionário
- [ ] Nome e cargo do funcionário em destaque
- [ ] Valores monetários formatados corretamente (R$ 0.00)
- [ ] Datas formatadas (dd/mm/yyyy)
- [ ] Status traduzidos para português

### Totalizadores
- [ ] Subtotal por funcionário após cada grupo
- [ ] Linha em branco entre funcionários
- [ ] Resumo final com:
  - Total de funcionários
  - Total de faturas
  - VALOR TOTAL GERAL em destaque

### Rodapé
- [ ] Numeração de páginas (Página X de Y)
- [ ] Texto "Sistema de Controle de Cantina Escolar"

## Testes de Performance

### Teste com Muitas Faturas

1. Criar 500+ faturas no banco de dados
2. Gerar relatório sem filtros
3. ✅ Verificar tempo de geração (deve ser < 10 segundos)
4. ✅ Verificar se o PDF tem várias páginas
5. ✅ Verificar se a numeração está correta em todas as páginas

### Teste com Dados Inválidos

1. Tentar gerar com mês inválido: `2025-13`
2. ✅ Verificar tratamento de erro

## Logs e Debug

Durante os testes, verificar no console do servidor:

```bash
# Comandos úteis
pnpm dev  # Ver logs em tempo real
```

Verificar:
- Erros de TypeScript/JavaScript
- Erros de SQL
- Warnings de performance
- Logs de autenticação

## Correção de Problemas Comuns

### Problema: "Cannot find module 'jspdf'"

**Solução**:
```bash
pnpm install
# ou
pnpm add jspdf jspdf-autotable
```

### Problema: PDF em branco ou com erro

**Solução**:
1. Verificar se há faturas no banco de dados
2. Verificar se a query SQL está correta
3. Ver logs do console do servidor

### Problema: Não está autenticado

**Solução**:
1. Fazer login no sistema primeiro
2. Verificar se o cookie JWT está presente
3. Verificar se a sessão não expirou

## Testes Automatizados (Futuro)

Para implementar testes automatizados:

```typescript
// Exemplo com Jest
describe('Relatório de Faturas', () => {
  test('deve gerar PDF com sucesso', async () => {
    const response = await fetch('/api/relatorios/faturas/pdf?mesInicio=2025-01');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');
  });
});
```

## Conclusão dos Testes

Ao concluir todos os testes com sucesso:

- ✅ Funcionalidade implementada corretamente
- ✅ Interface responsiva e intuitiva
- ✅ PDF gerado com layout profissional
- ✅ Filtros funcionando corretamente
- ✅ Tratamento de erros adequado
- ✅ Performance aceitável

## Próximos Passos

Após testes bem-sucedidos:

1. Treinar usuários no uso do sistema
2. Definir processo de envio ao DP
3. Estabelecer rotina mensal de geração
4. Implementar melhorias baseadas no feedback
5. Documentar casos de uso específicos da escola
