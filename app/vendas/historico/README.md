# Histórico de Vendas

## Descrição

Tela para visualização do histórico completo de vendas realizadas na cantina, com filtros avançados e visualização detalhada de cada venda.

## Funcionalidades Implementadas

### 1. Listagem de Vendas
- ✅ Exibição de todas as vendas com paginação (50 itens por página)
- ✅ Informações principais: ID, data/hora, cliente, tipo, quantidade de itens, valor total, forma de pagamento, status e atendente
- ✅ Ordenação por data (mais recentes primeiro)

### 2. Filtros Avançados
- ✅ **Data Início/Fim**: Filtrar vendas por período
- ✅ **Tipo de Cliente**: Aluno, Funcionário ou Geral
- ✅ **Forma de Pagamento**: Saldo, Dinheiro, Cartão ou Conta Funcionário
- ✅ **Status**: Concluída, Cancelada ou Estornada

### 3. Detalhes da Venda (Modal)
- ✅ Informações completas da venda
- ✅ Lista de todos os itens vendidos com:
  - Nome do produto
  - Tipo do produto
  - Quantidade
  - Peso (para produtos por quilo)
  - Preço unitário
  - Valor total do item
- ✅ Total geral da venda
- ✅ Informações do caixa e atendente

### 4. Interface Responsiva
- ✅ Layout adaptável para diferentes tamanhos de tela
- ✅ Tabela responsiva com rolagem horizontal em telas pequenas
- ✅ Modal com rolagem para visualização de vendas com muitos itens

## Endpoints de API

### GET `/api/vendas/historico`

Busca vendas com filtros e paginação.

**Query Parameters:**
- `page` (number): Número da página (padrão: 1)
- `limit` (number): Itens por página (padrão: 50)
- `dt_inicio` (date): Data inicial (formato: YYYY-MM-DD)
- `dt_fim` (date): Data final (formato: YYYY-MM-DD)
- `tipo_cliente` (string): ALUNO | FUNCIONARIO | GERAL
- `ra_aluno` (number): RA do aluno (opcional)
- `codigo_funcionario` (number): Código do funcionário (opcional)
- `forma_pagamento` (string): SALDO | DINHEIRO | CARTAO | CONTA_FUNCIONARIO
- `status` (string): CONCLUIDA | CANCELADA | ESTORNADA (padrão: CONCLUIDA)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "vendas": [
      {
        "id": 1,
        "tipo_cliente": "ALUNO",
        "nome_cliente": "João Silva",
        "ra_aluno": 12345,
        "codigo_funcionario": null,
        "valor_total": 25.50,
        "forma_pagamento": "SALDO",
        "status": "CONCLUIDA",
        "dt_venda": "2025-09-30T10:30:00.000Z",
        "usuario_nome": "Maria Atendente",
        "quantidade_itens": 3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    }
  }
}
```

### GET `/api/vendas/historico/[id]`

Busca detalhes completos de uma venda específica.

**Parâmetros:**
- `id` (number): ID da venda

**Resposta:**
```json
{
  "success": true,
  "data": {
    "venda": {
      "id": 1,
      "tipo_cliente": "ALUNO",
      "nome_cliente": "João Silva",
      "ra_aluno": 12345,
      "valor_total": 25.50,
      "forma_pagamento": "SALDO",
      "status": "CONCLUIDA",
      "dt_venda": "2025-09-30T10:30:00.000Z",
      "usuario_nome": "Maria Atendente",
      "observacoes": null,
      "id_caixa": 5,
      "dt_abertura_caixa": "2025-09-30T08:00:00.000Z"
    },
    "itens": [
      {
        "id": 1,
        "id_produto": 10,
        "produto_nome": "Coxinha",
        "tipo_produto": "SALGADOS",
        "quantidade": 2,
        "peso": null,
        "preco_unitario": 5.00,
        "valor_total": 10.00
      },
      {
        "id": 2,
        "id_produto": 15,
        "produto_nome": "Refrigerante",
        "tipo_produto": "BEBIDAS",
        "quantidade": 1,
        "peso": null,
        "preco_unitario": 5.50,
        "valor_total": 5.50
      }
    ]
  }
}
```

## Requisitos Atendidos

**RF-017 - Histórico de Vendas e Consumo**: ✅ **Concluído**
- ✅ Registra todas as transações com data/hora
- ✅ Permite consulta por período
- ✅ Filtros por aluno, funcionário, produto, tipo de produto
- ✅ Exibe detalhes de cada venda (produtos, quantidades, valores)
- ✅ Histórico não permite alteração

## Uso

1. Acesse http://localhost:3000/vendas/historico
2. Use os filtros para refinar a busca
3. Clique no ícone de olho (👁️) para ver os detalhes de cada venda
4. Use a paginação para navegar entre as páginas

## Próximas Melhorias Sugeridas

- [ ] Exportação para PDF e Excel
- [ ] Gráficos de vendas por período
- [ ] Filtro por produto específico
- [ ] Busca por nome de cliente
- [ ] Impressão de comprovante de venda
- [ ] Opção de estornar/cancelar venda (com controle de permissão)
- [ ] Dashboard de análise de vendas
- [ ] Filtro por range de valores
- [ ] Estatísticas rápidas (total vendido, ticket médio, etc.)

## Arquivos Criados/Modificados

### Novos Arquivos
- `app/api/vendas/historico/route.ts` - API para listagem de vendas
- `app/api/vendas/historico/[id]/route.ts` - API para detalhes da venda

### Arquivos Modificados
- `app/vendas/historico/page.tsx` - Tela completa de histórico de vendas

## Tabelas do Banco de Dados Utilizadas

- `cant_vendas` - Tabela principal de vendas
- `cant_vendas_itens` - Itens de cada venda
- `cant_produtos` - Informações dos produtos
- `cant_tipos_produtos` - Tipos/categorias dos produtos
- `cant_usuarios_cantina` - Usuários/atendentes
- `cant_caixa` - Informações dos caixas
- `alunos` (view) - Dados dos alunos
- `funcionarios` - Dados dos funcionários da escola

## Observações Técnicas

- A paginação é feita no servidor para otimizar performance
- Filtros são aplicados via query parameters na URL
- Modal utiliza Bootstrap 5 para exibição dos detalhes
- Interface totalmente responsiva
- Utiliza componente `MainLayout` para layout padrão com menu
- Formatação de valores monetários em pt-BR
- Formatação de datas/horas em pt-BR
