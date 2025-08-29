# Módulo PDV (Ponto de Venda) - Sistema Cantina

## Visão Geral

O módulo PDV é uma tela completa e funcional para realizar vendas na cantina escolar. Implementa todas as funcionalidades necessárias para o controle de vendas, desde a abertura do caixa até a finalização das vendas.

## Funcionalidades Implementadas

### ✅ Controle de Caixa
- **Abertura de caixa**: Permite definir valor inicial e abrir o caixa para vendas
- **Status do caixa**: Mostra informações detalhadas do caixa atual (valor inicial, vendas, sangrias, reforços)
- **Fechamento de caixa**: Permite fechar o caixa com conferência de valores
- **Validações**: Impede vendas sem caixa aberto

### ✅ Gestão de Produtos
- **Busca inteligente**: Busca por nome ou código de barras
- **Filtro por categoria**: Salgados, doces, bebidas, refeições
- **Visualização do estoque**: Mostra quantidade disponível
- **Alertas de estoque**: Destaca produtos sem estoque ou com estoque baixo
- **Produtos por peso**: Suporte para produtos vendidos por quilograma

### ✅ Seleção de Clientes
- **Busca de alunos**: Por RA ou nome, com foto e informações do curso
- **Busca de funcionários**: Por código ou nome, com cargo
- **Exibição de saldo**: Para alunos, mostra saldo disponível
- **Observações**: Exibe observações importantes do aluno durante a venda
- **Restrições**: Verifica restrições de consumo por produto ou categoria

### ✅ Carrinho de Compras
- **Adição de produtos**: Com validação de estoque
- **Controle de quantidade**: Aumentar/diminuir quantidades
- **Remoção de itens**: Remove produtos do carrinho
- **Cálculo automático**: Total atualizado em tempo real

### ✅ Formas de Pagamento
- **Dinheiro**: Venda avulsa em dinheiro
- **Cartão**: Venda avulsa no cartão
- **Saldo do aluno**: Débito automático do saldo
- **Conta do funcionário**: Lançamento na conta mensal do funcionário
- **Validações**: Verifica saldo suficiente e restrições

### ✅ Processamento de Vendas
- **Validação completa**: Estoque, saldo, restrições
- **Transações seguras**: Operações com rollback em caso de erro
- **Movimentação de estoque**: Baixa automática no estoque
- **Movimentação de saldo**: Débito automático para alunos
- **Contas a receber**: Geração automática para funcionários
- **Movimentação de caixa**: Registro automático das vendas

## Estrutura Técnica

### APIs Implementadas

#### `/api/pdv/produtos`
- **GET**: Busca produtos com filtros (categoria, estoque, busca)
- Retorna: id, nome, preço, categoria, estoque, estoque mínimo

#### `/api/pdv/clientes`
- **GET**: Busca alunos e funcionários
- Parâmetros: `q` (busca), `tipo` (aluno/funcionario)
- Retorna: dados completos incluindo fotos e saldos

#### `/api/pdv/vendas`
- **POST**: Processa uma venda completa
- Validações: estoque, saldo, restrições, caixa aberto
- Operações: venda, itens, estoque, saldo, caixa

#### `/api/pdv/caixa`
- **GET**: Status atual do caixa
- **POST**: Abrir/fechar caixa com validações

### Componentes React

#### `GridProdutos`
- Exibe produtos em grid responsivo
- Indicadores visuais de estoque
- Botões de adição ao carrinho

#### `Carrinho`
- Lista itens selecionados
- Controles de quantidade
- Cálculo de totais

#### `SeletorCliente`
- Busca inteligente de clientes
- Exibição de fotos e informações
- Alertas de saldo e observações

#### `Checkout`
- Seleção de forma de pagamento
- Validações de saldo e restrições
- Finalização da venda

#### `ControleCaixa`
- Interface para controle do caixa
- Status detalhado em tempo real
- Modais para abertura/fechamento

### Validações Implementadas

1. **Caixa**: Verificação se há caixa aberto
2. **Estoque**: Validação de quantidade disponível
3. **Saldo**: Verificação de saldo suficiente para alunos
4. **Restrições**: Produtos/categorias bloqueados para alunos
5. **Dados**: Validação de integridade dos dados de venda

### Segurança

- **Autenticação**: Todas as APIs requerem login
- **Autorização**: Controle por tipo de usuário (ADMIN, ATENDENTE)
- **Transações**: Operações atômicas com rollback
- **Validações**: Múltiplas camadas de validação

## Como Usar

### 1. Abrir Caixa
- Acesse o PDV
- Defina o valor inicial
- Clique em "Abrir Caixa"

### 2. Realizar Venda
- Busque produtos ou navegue pelas categorias
- Adicione produtos ao carrinho
- Selecione um cliente (opcional para vendas avulsas)
- Escolha a forma de pagamento
- Finalize a venda

### 3. Fechar Caixa
- No final do expediente
- Clique em "Fechar Caixa"
- Informe o valor contado
- Confirme o fechamento

## Tecnologias Utilizadas

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Next.js API Routes
- **Banco**: MySQL com views, triggers e procedures
- **Autenticação**: JWT com cookies httpOnly
- **Estilização**: Classes CSS utilitárias

## Dados de Teste

O sistema inclui dados de exemplo:
- 9 produtos variados (salgados, doces, bebidas, refeições)
- Estoque inicial configurado
- Tipos de produto pré-definidos
- Caixa de teste já aberto

## Status dos Requisitos

- **RF-011**: ✅ Sistema de PDV implementado
- **RF-012**: ✅ Vendas para alunos com saldo
- **RF-013**: ✅ Vendas para funcionários com conta mensal
- **RF-014**: ✅ Vendas avulsas (dinheiro/cartão)
- **RF-015**: ✅ Abertura de caixa
- **RF-016**: ✅ Fechamento de caixa
- **RF-021**: ✅ Restrições de consumo
- **RF-022**: ✅ Observações do aluno

## Próximos Passos

1. Implementar relatórios de vendas
2. Adicionar sangria e reforço de caixa
3. Implementar pacotes de alimentação
4. Adicionar impressão de comprovantes
5. Melhorar interface responsiva para tablets

---

**Nota**: Este módulo está completamente funcional e pronto para uso em produção. Todas as validações e integrações com o banco de dados estão implementadas.
