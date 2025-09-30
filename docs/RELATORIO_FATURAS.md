# Relatório de Faturas para Departamento Pessoal

## Descrição

Este módulo permite gerar relatórios em PDF das faturas dos funcionários da escola para envio ao Departamento Pessoal. O relatório contém todas as informações necessárias para realizar o desconto em folha de pagamento.

## Localização

- **Rota da API**: `/api/relatorios/faturas/pdf`
- **Interface Web**: `/financeiro/relatorios/faturas`

## Funcionalidades

### 1. Filtros Disponíveis

O relatório pode ser gerado com os seguintes filtros:

- **Mês Início**: Data inicial do período (formato: YYYY-MM)
- **Mês Fim**: Data final do período (formato: YYYY-MM)
- **Funcionário**: Código do funcionário específico (opcional)
- **Status**: Status da fatura (GERADA, ENVIADA, PAGA, VENCIDA, PARCIAL)

### 2. Conteúdo do Relatório

O PDF gerado contém:

- Cabeçalho com logo e título
- Informações dos filtros aplicados
- Data de emissão do relatório
- Tabela com as seguintes informações:
  - Dados do funcionário (nome e cargo)
  - Mês de referência
  - Quantidade de itens consumidos
  - Valor total da fatura
  - Status da fatura
  - Data de vencimento
  - Subtotal por funcionário
- **Resumo final com:**
  - Total de funcionários no relatório
  - Total de faturas
  - **VALOR TOTAL GERAL** (para desconto em folha)

### 3. Layout e Design

- Cores do sistema (Azul #253287, Vermelho #B20000)
- Cabeçalhos agrupados por funcionário
- Tabela com linhas alternadas para melhor legibilidade
- Subtotais por funcionário destacados
- Total geral em negrito e fonte maior
- Rodapé com numeração de páginas

## Como Usar

### Via Interface Web

1. Acesse: `/financeiro/relatorios/faturas`
2. Defina os filtros desejados:
   - Para relatório mensal: informe o mesmo mês em "Mês Início" e "Mês Fim"
   - Para funcionário específico: busque e selecione o funcionário
   - Para faturas pendentes: selecione status "Gerada" ou "Enviada"
3. Clique em "Gerar Relatório PDF"
4. O PDF será baixado automaticamente

### Via API

**Endpoint**: `GET /api/relatorios/faturas/pdf`

**Parâmetros Query String**:
- `mesInicio` (opcional): Mês inicial no formato YYYY-MM
- `mesFim` (opcional): Mês final no formato YYYY-MM
- `codigoFuncionario` (opcional): Código do funcionário
- `status` (opcional): Status da fatura

**Exemplo**:
```
GET /api/relatorios/faturas/pdf?mesInicio=2025-01&mesFim=2025-01&status=GERADA
```

**Resposta**:
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="relatorio-faturas-{timestamp}.pdf"`

## Casos de Uso

### 1. Relatório Mensal Completo
**Cenário**: Gerar relatório de todos os funcionários para um mês específico

**Filtros**:
- Mês Início: 2025-01
- Mês Fim: 2025-01
- Funcionário: (vazio)
- Status: Todos

**Resultado**: PDF com todas as faturas do mês 01/2025 agrupadas por funcionário

### 2. Relatório Individual
**Cenário**: Gerar relatório de um funcionário específico

**Filtros**:
- Mês Início: (vazio)
- Mês Fim: (vazio)
- Funcionário: João Silva
- Status: Todos

**Resultado**: PDF com todas as faturas de João Silva

### 3. Faturas Pendentes
**Cenário**: Gerar relatório apenas das faturas que ainda não foram pagas

**Filtros**:
- Mês Início: (vazio)
- Mês Fim: (vazio)
- Funcionário: (vazio)
- Status: GERADA

**Resultado**: PDF com todas as faturas pendentes de pagamento

### 4. Relatório Trimestral
**Cenário**: Gerar relatório de um trimestre completo

**Filtros**:
- Mês Início: 2025-01
- Mês Fim: 2025-03
- Funcionário: (vazio)
- Status: Todos

**Resultado**: PDF com todas as faturas do primeiro trimestre de 2025

## Fluxo de Trabalho Recomendado

1. **Fim do Mês**: Gerar relatório mensal completo com status "GERADA" ou "ENVIADA"
2. **Envio ao DP**: Encaminhar o PDF ao Departamento Pessoal
3. **DP Processa**: Departamento Pessoal utiliza o relatório para descontos
4. **Confirmação**: Após confirmação do DP, marcar faturas como "PAGA"
5. **Controle**: Usar filtro de status "PAGA" para verificar faturas já processadas

## Estrutura de Dados

### Tabelas Utilizadas

```sql
-- Tabela principal de faturas
cant_faturas_funcionarios (
  id, codigo_funcionario, mes_referencia, 
  valor_total, quantidade_itens, status, 
  dt_vencimento, dt_criacao
)

-- Tabela de funcionários (leitura)
funcionarios (
  codigo, nome, cargo
)
```

### Query Principal

```sql
SELECT 
  f.id,
  f.codigo_funcionario,
  func.nome AS funcionario_nome,
  func.cargo,
  f.mes_referencia,
  f.valor_total,
  f.quantidade_itens,
  f.status,
  DATE_FORMAT(f.dt_vencimento, '%d/%m/%Y') AS dt_vencimento,
  DATE_FORMAT(f.dt_criacao, '%d/%m/%Y') AS dt_criacao
FROM cant_faturas_funcionarios f
LEFT JOIN funcionarios func ON f.codigo_funcionario = func.codigo
WHERE [filtros]
ORDER BY f.mes_referencia DESC, func.nome ASC
```

## Tecnologias Utilizadas

- **jsPDF**: Biblioteca para geração de PDFs
- **jspdf-autotable**: Plugin para criar tabelas formatadas
- **Next.js API Routes**: Backend para processamento
- **React**: Interface de usuário
- **Bootstrap 5**: Estilização da interface

## Tratamento de Erros

### Erro: Nenhuma fatura encontrada
**Causa**: Filtros muito restritivos ou sem dados
**Solução**: Ajustar os filtros ou verificar se há faturas cadastradas

### Erro: Erro ao gerar relatório PDF
**Causa**: Erro no servidor ou dados inválidos
**Solução**: Verificar logs do servidor e integridade dos dados

## Manutenção

### Adicionar Novos Campos ao Relatório

1. Atualizar a query SQL em `/api/relatorios/faturas/pdf/route.ts`
2. Adicionar o campo na interface `FaturaRelatorio`
3. Incluir o campo na tabela do PDF (método `autoTable`)
4. Atualizar a documentação

### Personalizar Layout do PDF

Editar o arquivo `/api/relatorios/faturas/pdf/route.ts`:
- **Cores**: Modificar valores RGB nos métodos `setTextColor` e `fillColor`
- **Fonte**: Ajustar tamanho com `setFontSize()`
- **Colunas**: Alterar `columnStyles` no `autoTable`
- **Margens**: Modificar propriedade `margin`

## Segurança

- ✅ Autenticação obrigatória via JWT
- ✅ Validação de parâmetros de entrada
- ✅ Prevenção de SQL injection com queries parametrizadas
- ✅ Logs de acesso (via sistema de auditoria)

## Performance

- Otimizado para relatórios com até 1000 faturas
- Para volumes maiores, considerar:
  - Adicionar paginação
  - Gerar PDF em background
  - Implementar cache de relatórios frequentes

## Suporte

Para dúvidas ou problemas:
1. Verificar logs do sistema
2. Consultar esta documentação
3. Contatar o administrador do sistema
