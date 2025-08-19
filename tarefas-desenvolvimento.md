# Tarefas de Desenvolvimento - Sistema de Cantina Escolar

Este documento organiza os requisitos funcionais em tarefas específicas para desenvolvimento por agente de IA.

## Legenda de Status

- 🔴 Pendente
- 🟡 Em Desenvolvimento
- 🟢 Concluído

## Prioridade de Desenvolvimento

### Fase 1 - Infraestrutura Básica

#### Banco de Dados

- **RF-029** - Estrutura do banco de dados (🔴 Pendente)
- **RF-030** - Stored procedures (🔴 Pendente)
- **RF-031** - Integração com tabelas existentes (🔴 Pendente)

#### Autenticação

- **RF-001** - Sistema de login para funcionários da cantina (🔴 Pendente)
- **RF-002** - Controle de perfis de usuário (🔴 Pendente)
- **RF-003** - Controle de sessão e logout (🔴 Pendente)

#### Interface Base

- **RF-032** - Design system (🔴 Pendente)
- **RF-033** - Dashboard principal (🔴 Pendente)
- **RF-034** - Navegação e usabilidade (🔴 Pendente)

### Fase 2 - Gestão de Dados

#### Usuários

- **RF-004** - Cadastro de funcionários da cantina (🔴 Pendente)
- **RF-005** - Integração com dados de alunos (🔴 Pendente)
- **RF-006** - Integração com dados de funcionários da escola (🔴 Pendente)

#### Produtos

- **RF-007** - Cadastro de tipos de produtos (🔴 Pendente)
- **RF-008** - Cadastro de produtos (🔴 Pendente)
- **RF-009** - Controle de estoque (🔴 Pendente)

### Fase 3 - Operações Básicas

#### Caixa

- **RF-015** - Abertura de caixa (🔴 Pendente)
- **RF-016** - Fechamento de caixa (🔴 Pendente)
- **RF-017** - Sangria e reforço de caixa (🔴 Pendente)

#### Vendas Core

- **RF-011** - Sistema de PDV (Ponto de Venda) (🔴 Pendente)
- **RF-014** - Vendas avulsas (dinheiro/cartão) (🔴 Pendente)

### Fase 4 - Funcionalidades Avançadas

#### Vendas Específicas

- **RF-012** - Vendas para alunos (🔴 Pendente)
- **RF-013** - Vendas para funcionários da escola (🔴 Pendente)

#### Saldo e Pacotes
- **RF-018** - Gestão de saldo dos alunos (🔴 Pendente)
- **RF-019** - Pacotes de alimentação (🔴 Pendente)
- **RF-020** - Verificação de pacotes ativos (🔴 Pendente)

#### Restrições
- **RF-021** - Restrições de consumo (🔴 Pendente)
- **RF-022** - Observações do aluno (🔴 Pendente)

### Fase 5 - Relatórios e Controles

#### Relatórios Operacionais
- **RF-010** - Relatórios de estoque (🔴 Pendente)
- **RF-025** - Histórico de vendas dos alunos (🔴 Pendente)
- **RF-026** - Relatórios gerenciais (🔴 Pendente)

#### Faturas e Fechamentos
- **RF-023** - Relatório de consumo dos funcionários (🔴 Pendente)
- **RF-024** - Geração de faturas mensais (🔴 Pendente)

#### Contas
- **RF-027** - Controle de contas a pagar (✅ Concluído)
- **RF-028** - Controle de contas a receber (✅ Concluído)

## Tarefas Detalhadas por Módulo

### Módulo de Autenticação e Autorização

**RF-001 - Sistema de login para funcionários da cantina**
- Criar tela de login com campos usuário e senha
- Implementar validação no backend via MySQL
- Configurar sessão de usuário
- Definir redirecionamentos após login

**RF-002 - Controle de perfis de usuário**
- Criar sistema de permissões
- Implementar middleware de autorização
- Configurar menus por perfil (Administrador, Atendente, Estoquista)

**RF-003 - Controle de sessão e logout**
- Implementar gerenciamento de sessão
- Criar função de logout
- Configurar timeout de sessão

### Módulo de Gestão de Usuários

**RF-004 - Cadastro de funcionários da cantina**
- Criar CRUD completo para funcionários
- Implementar seleção de perfil
- Validações de dados

**RF-005 - Integração com dados de alunos**
- Conectar com tabelas existentes
- Implementar busca por RA
- Configurar exibição de fotos via URL

**RF-006 - Integração com dados de funcionários da escola**
- Conectar com tabelas existentes
- Configurar valores de almoço por cargo

### Módulo de Produtos e Estoque

**RF-007 - Cadastro de tipos de produtos**
- Criar CRUD para categorias
- Incluir categoria especial "por quilo"

**RF-008 - Cadastro de produtos**
- Criar CRUD completo para produtos
- Vincular com categorias
- Controle de status ativo/inativo

**RF-009 - Controle de estoque**
- Implementar movimentações de entrada/saída
- Criar alertas de estoque baixo
- Histórico de movimentações

### Módulo de Vendas e PDV

**RF-011 - Sistema de PDV**
- Criar interface de vendas
- Implementar busca de produtos
- Cálculo automático de totais
- Integração com impressora (futuro)

**RF-012 - Vendas para alunos**
- Busca por RA do aluno
- Verificação de saldo
- Exibição de foto
- Desconto automático

**RF-013 - Vendas para funcionários da escola**
- Identificação de funcionário
- Aplicação de preços específicos
- Registro em conta mensal

**RF-014 - Vendas avulsas**
- Venda sem identificação
- Controle de forma de pagamento

### Módulo de Controle de Caixa

**RF-015 - Abertura de caixa**
- Registro de valor inicial
- Identificação do operador
- Validações de caixa já aberto

**RF-016 - Fechamento de caixa**
- Cálculo de vendas do período
- Conferência de valores
- Relatório de fechamento

**RF-017 - Sangria e reforço**
- Registro de movimentações de dinheiro
- Justificativas obrigatórias

### Módulo de Saldo e Pacotes

**RF-018 - Gestão de saldo dos alunos**
- Consulta de saldo atual
- Histórico de movimentações
- Funcionalidade de recarga

**RF-019 - Pacotes de alimentação**
- Criação de tipos de pacotes
- Venda para responsáveis
- Controle de utilização

**RF-020 - Verificação de pacotes ativos**
- Consulta em tempo real
- Validação por tipo de refeição

### Módulo de Restrições e Observações

**RF-021 - Restrições de consumo**
- Bloqueio por produto específico
- Bloqueio por categoria
- Validação no momento da venda

**RF-022 - Observações do aluno**
- Cadastro de observações
- Exibição durante venda
- Alertas visuais

### Módulo de Relatórios e Faturas

**RF-023 - Relatório de consumo dos funcionários**
- Listagem por funcionário
- Filtros por período
- Exportação para Excel/PDF

**RF-024 - Geração de faturas mensais**
- Fechamento automático mensal
- Geração de arquivo para RH

**RF-025 - Histórico de vendas dos alunos**
- Consulta por aluno
- Filtros diversos
- Gráficos de consumo

**RF-026 - Relatórios gerenciais**
- Dashboard com métricas
- Análises de performance
- Produtos mais vendidos

### Módulo de Contas a Pagar e Receber

**RF-027 - Controle de contas a pagar** ✅ Concluído
- Cadastro de fornecedores
- Controle de vencimentos
- Baixa de pagamentos
- Sistema de parcelas
- Histórico completo
- Alertas de vencimento

**RF-028 - Controle de contas a receber** ✅ Concluído
- Registro de recebíveis
- Controle de inadimplência
- Sistema de parcelas
- Histórico completo
- Alertas de vencimento

**Implementação completa:**
- Dashboard financeiro com indicadores
- CRUD completo para contas a pagar e receber
- Sistema de categorias financeiras
- Controle de parcelas automático
- Triggers para atualização de status
- Views para relatórios
- Interface Bootstrap responsiva
- Filtros avançados e paginação
- Controle de acesso por perfil

### Banco de Dados

**RF-029 - Estrutura do banco de dados**
- Criar script completo em `bancodados.sql`
- Todas as tabelas com prefixo `cant_`
- Implementar triggers necessários
- Criar views para consultas complexas

**RF-030 - Stored procedures**
- Procedures para vendas
- Procedures para relatórios
- Funções auxiliares

**RF-031 - Integração com tabelas existentes**
- Mapear relacionamentos
- Criar views de integração

### Interface do Sistema

**RF-032 - Design system**
- Configurar Tailwind CSS
- Implementar cores do projeto
- Criar componentes base

**RF-033 - Dashboard principal**
- Métricas principais
- Acesso rápido às funcionalidades
- Indicadores visuais

**RF-034 - Navegação e usabilidade**
- Menu responsivo
- Breadcrumbs
- Navegação contextual

## Considerações Técnicas

### Tecnologias

- Frontend: Next.js + TypeScript + Chakra UI
- Backend: Next.js API Routes
- Banco: MySQL
- Gerenciador: PNPM

### Convenções

- camelCase para variáveis
- PascalCase para classes
- UPPER_SNAKE_CASE para constantes
- kebab-case para arquivos
- Prefixo `cant_` para todas as tabelas

### Cores do Sistema

- Azul: #253287
- Vermelho: #B20000
- Amarelo: #FEA800
- Escuro: #333333
- Claro: #FFFFFF

### Observações Importantes

- Fotos dos alunos: `https://sistema.santanna.g12.br/carometr/$ra.jpg`
- Não alterar tabelas legadas existentes
- Máximo uso de views, triggers e stored procedures
- Centralizar lógica de negócio no MySQL
