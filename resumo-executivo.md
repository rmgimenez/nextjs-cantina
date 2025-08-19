# Resumo Executivo - Sistema de Cantina Escolar

## Objetivo

Sistema de controle de cantina escolar com frontend Next.js/TypeScript e backend MySQL para gerenciar operações de vendas, estoque, usuários e relatórios.

## Tecnologias

- **Frontend**: Next.js + TypeScript + Chakra UI + react-icons
- **Backend**: Next.js API Routes
- **Banco**: MySQL (com triggers, views, stored procedures)
- **Gerenciador**: PNPM

## Cores do Sistema

- Azul: #253287
- Vermelho: #B20000  
- Amarelo: #FEA800
- Escuro: #333333
- Claro: #FFFFFF

## Atores do Sistema

1. **Funcionários da Cantina** (3 perfis):
   - Administrador: Acesso total
   - Atendente: Vendas e consulta estoque
   - Estoquista: Gerenciar estoque

2. **Alunos**: Clientes com saldo e pacotes de alimentação

3. **Funcionários da Escola**: Compras com faturamento mensal

## 34 Requisitos Funcionais Organizados

### 🔥 FASE 1 - INFRAESTRUTURA (9 tarefas)

**Banco de Dados & Autenticação & Interface Base**

- RF-029: Estrutura do banco (prefixo `cant_`)
- RF-030: Stored procedures e funções
- RF-031: Integração com tabelas existentes
- RF-001: Sistema de login
- RF-002: Controle de perfis
- RF-003: Sessão e logout
- RF-032: Design system (Chakra UI + cores)
- RF-033: Dashboard principal
- RF-034: Navegação por perfil

### 🔧 FASE 2 - GESTÃO DE DADOS (6 tarefas)

**Usuários & Produtos**

- RF-004: CRUD funcionários cantina
- RF-005: Integração alunos + fotos (`https://sistema.santanna.g12.br/carometr/$ra.jpg`)
- RF-006: Integração funcionários escola + preços por cargo
- RF-007: CRUD tipos produtos (incluir "por quilo")
- RF-008: CRUD produtos
- RF-009: Controle estoque (entrada/saída/alertas)

### 💰 FASE 3 - OPERAÇÕES BÁSICAS (5 tarefas)

**Caixa & Vendas Core**

- RF-015: Abertura de caixa
- RF-016: Fechamento de caixa
- RF-017: Sangria e reforço
- RF-011: Sistema PDV
- RF-014: Vendas avulsas (dinheiro/cartão)

### 🎯 FASE 4 - FUNCIONALIDADES AVANÇADAS (7 tarefas)

**Vendas Específicas & Saldo & Restrições**

- RF-012: Vendas para alunos (RA + saldo + foto)
- RF-013: Vendas funcionários escola (conta mensal)
- RF-018: Gestão saldo alunos
- RF-019: Pacotes alimentação (lanche+almoço por período)
- RF-020: Verificação pacotes ativos
- RF-021: Restrições consumo por aluno
- RF-022: Observações do aluno (alertas na venda)

### 📊 FASE 5 - RELATÓRIOS E CONTROLES (7 tarefas)

**Relatórios & Faturas & Contas**

- RF-010: Relatórios estoque
- RF-025: Histórico vendas alunos
- RF-026: Relatórios gerenciais
- RF-023: Relatório consumo funcionários
- RF-024: Geração faturas mensais
- RF-027: Contas a pagar
- RF-028: Contas a receber

## Funcionalidades-Chave

### Sistema de Vendas

- PDV com busca de produtos
- Vendas para alunos (com saldo e fotos)
- Vendas para funcionários (faturamento mensal)
- Vendas avulsas (dinheiro/cartão)

### Controle de Saldo

- Saldo dos alunos
- Pacotes de alimentação (ex: lanche+almoço por 1 mês)
- Restrições de consumo por aluno

### Gestão de Estoque

- Controle entrada/saída
- Alertas de estoque baixo
- Relatórios de movimentação

### Relatórios

- Consumo dos funcionários (fechamento mensal)
- Histórico dos alunos
- Relatórios gerenciais

## Regras Técnicas Importantes

### Banco de Dados

- Prefixo `cant_` para todas as novas tabelas
- NÃO alterar tabelas legadas existentes
- Máximo uso de views, triggers e stored procedures
- Centralizar lógica de negócio no MySQL

### Convenções de Código

- camelCase: variáveis
- PascalCase: classes  
- UPPER_SNAKE_CASE: constantes
- kebab-case: arquivos

### Integrações Especiais

- Fotos alunos: `https://sistema.santanna.g12.br/carometr/$ra.jpg`
- Produtos "por quilo" para refeições
- Valores de almoço variáveis por cargo do funcionário

## Status Atual

**Todos os 34 requisitos estão PENDENTES** 🔴

O sistema está pronto para desenvolvimento seguindo as fases propostas, com prioridade para infraestrutura básica antes de implementar funcionalidades específicas.
