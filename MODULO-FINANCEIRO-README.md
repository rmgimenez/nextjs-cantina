# 📊 Módulo de Contas a Pagar e Receber

Este módulo implementa um sistema completo para controle financeiro da cantina escolar, permitindo o gerenciamento de despesas, receitas e fluxo de caixa.

## 🎯 Funcionalidades Implementadas

### ✅ RF-027 - Controle de contas a pagar
- ✅ Registro de despesas da cantina
- ✅ Controle de vencimentos
- ✅ Categorização por tipo de despesa
- ✅ Sistema de parcelas
- ✅ Histórico de pagamentos
- ✅ Alertas de vencimento

### ✅ RF-028 - Controle de contas a receber
- ✅ Registro de valores a receber
- ✅ Controle de inadimplência
- ✅ Categorização por tipo de receita
- ✅ Sistema de parcelas
- ✅ Histórico de recebimentos
- ✅ Alertas de vencimento

## 🚀 Como Usar

### 1. Instalação

Execute o script de instalação conforme seu sistema operacional:

**Windows:**
```cmd
instalar-modulo-financeiro.bat
```

**Linux/Mac:**
```bash
chmod +x instalar-modulo-financeiro.sh
./instalar-modulo-financeiro.sh
```

### 2. Configuração de Variáveis de Ambiente

Defina as variáveis de ambiente para conexão com o banco:

```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=sua_senha
export DB_NAME=cantina_db
```

Ou crie um arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=cantina_db
```

### 3. Acesso ao Sistema

- **URL:** `http://localhost:3000/dashboard/financeiro`
- **Perfil necessário:** ADMIN (acesso completo)

## 📋 Estrutura do Módulo

### Banco de Dados

#### Tabelas Principais
- `cant_categoria_financeira` - Categorias de receitas e despesas
- `cant_conta_pagar` - Contas a pagar
- `cant_conta_receber` - Contas a receber
- `cant_conta_pagar_parcela` - Parcelas das contas a pagar
- `cant_conta_receber_parcela` - Parcelas das contas a receber
- `cant_conta_pagar_pagamento` - Histórico de pagamentos
- `cant_conta_receber_recebimento` - Histórico de recebimentos

#### Views Criadas
- `cant_view_conta_pagar_resumo` - Resumo das contas a pagar
- `cant_view_conta_receber_resumo` - Resumo das contas a receber
- `cant_view_conta_pagar_parcela_resumo` - Resumo das parcelas a pagar
- `cant_view_conta_receber_parcela_resumo` - Resumo das parcelas a receber
- `cant_view_dashboard_financeiro` - Indicadores do dashboard

#### Stored Procedures
- `cant_sp_gerar_parcelas_conta_pagar` - Gera parcelas para conta a pagar
- `cant_sp_gerar_parcelas_conta_receber` - Gera parcelas para conta a receber
- `cant_sp_registrar_pagamento_conta` - Registra pagamento
- `cant_sp_registrar_recebimento_conta` - Registra recebimento

#### Triggers
- `trig_conta_pagar_after_pagamento` - Atualiza status após pagamento
- `trig_conta_receber_after_recebimento` - Atualiza status após recebimento

#### Events
- `evt_atualiza_status_contas_atrasadas` - Marca contas atrasadas (executa diariamente)

### API Endpoints

#### Categorias Financeiras
- `GET /api/financeiro/categorias` - Listar categorias
- `POST /api/financeiro/categorias` - Criar categoria

#### Contas a Pagar
- `GET /api/financeiro/contas-pagar` - Listar contas (com filtros e paginação)
- `POST /api/financeiro/contas-pagar` - Criar conta
- `GET /api/financeiro/contas-pagar/[id]` - Buscar conta específica
- `PUT /api/financeiro/contas-pagar/[id]` - Atualizar conta
- `DELETE /api/financeiro/contas-pagar/[id]` - Excluir conta
- `POST /api/financeiro/contas-pagar/[id]/pagamentos` - Registrar pagamento

#### Contas a Receber
- `GET /api/financeiro/contas-receber` - Listar contas (com filtros e paginação)
- `POST /api/financeiro/contas-receber` - Criar conta
- `GET /api/financeiro/contas-receber/[id]` - Buscar conta específica
- `PUT /api/financeiro/contas-receber/[id]` - Atualizar conta
- `DELETE /api/financeiro/contas-receber/[id]` - Excluir conta
- `POST /api/financeiro/contas-receber/[id]/recebimentos` - Registrar recebimento

#### Dashboard
- `GET /api/financeiro/dashboard` - Indicadores e alertas do dashboard

### Páginas Frontend

#### Dashboard Financeiro (`/dashboard/financeiro`)
- Resumo geral de contas a pagar e receber
- Alertas de vencimento
- Contas atrasadas
- Fluxo de caixa dos próximos 30 dias

#### Categorias (`/dashboard/financeiro/categorias`)
- Listagem de categorias de receita e despesa
- Criação de novas categorias
- Filtros por tipo

#### Contas a Pagar (`/dashboard/financeiro/contas-pagar`)
- Listagem com filtros avançados
- Criação de novas contas
- Sistema de parcelas
- Registro de pagamentos
- Controle de status

#### Contas a Receber (`/dashboard/financeiro/contas-receber`)
- Listagem com filtros avançados
- Criação de novas contas
- Sistema de parcelas
- Registro de recebimentos
- Controle de status

## 🔐 Controle de Acesso

### Perfis e Permissões

| Funcionalidade                    | ADMIN | ESTOQUISTA | ATENDENTE |
| --------------------------------- | ----- | ---------- | --------- |
| Ver dashboard financeiro          | ✅     | ❌          | ❌         |
| Criar categorias                  | ✅     | ❌          | ❌         |
| Criar contas a pagar/receber      | ✅     | ✅          | ❌         |
| Editar contas                     | ✅     | ✅          | ❌         |
| Excluir contas                    | ✅     | ❌          | ❌         |
| Registrar pagamentos/recebimentos | ✅     | ✅          | ✅         |
| Ver relatórios                    | ✅     | ✅          | ❌         |

## 🧪 Dados de Teste

O script de instalação oferece a opção de criar dados de teste que incluem:

### Categorias
- Fornecedores de Alimentos (Despesa)
- Energia Elétrica (Despesa)
- Água e Esgoto (Despesa)
- Aluguel (Despesa)
- Vendas à Vista (Receita)
- Mensalidades Pacotes (Receita)
- Outras Receitas (Receita)

### Contas de Exemplo
- Contas a pagar com diferentes status
- Contas a receber com diferentes situações
- Exemplos de parcelas
- Histórico de pagamentos e recebimentos

## 📊 Recursos Avançados

### Alertas Automáticos
- Contas que vencem hoje
- Contas que vencem na semana
- Contas em atraso
- Indicadores de inadimplência

### Sistema de Parcelas
- Geração automática de parcelas
- Controle individual por parcela
- Pagamentos/recebimentos parciais
- Cálculo de juros e descontos

### Relatórios
- Fluxo de caixa projetado
- Resumo por categoria
- Análise de vencimentos
- Histórico de movimentações

### Status Automático
- Atualização automática de status
- Controle de atrasos
- Cálculo de valores pendentes
- Monitoramento de inadimplência

## 🔧 Manutenção

### Backup
Recomenda-se fazer backup regular das tabelas:
```sql
-- Backup das tabelas financeiras
mysqldump -u user -p database_name cant_categoria_financeira cant_conta_pagar cant_conta_receber cant_conta_pagar_parcela cant_conta_receber_parcela cant_conta_pagar_pagamento cant_conta_receber_recebimento > backup_financeiro.sql
```

### Limpeza de Dados
Para remover dados antigos:
```sql
-- Remover contas canceladas antigas (mais de 1 ano)
DELETE FROM cant_conta_pagar WHERE status = 'CANCELADO' AND created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
DELETE FROM cant_conta_receber WHERE status = 'CANCELADO' AND created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verifique as variáveis de ambiente
   - Confirme se o MySQL está rodando
   - Teste a conexão manualmente

2. **Permissões negadas**
   - Verifique se o usuário tem perfil adequado
   - Confirme se está logado corretamente

3. **Views não encontradas**
   - Execute novamente o script de instalação
   - Verifique se todas as tabelas foram criadas

4. **Triggers não funcionando**
   - Confirme se o usuário do banco tem permissão para criar triggers
   - Verifique os logs do MySQL

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs da aplicação
2. Consulte este README
3. Execute os scripts de teste
4. Verifique a estrutura do banco de dados

## 🔄 Atualizações Futuras

Funcionalidades planejadas:
- Integração com sistema de vendas
- Relatórios mais detalhados
- Exportação para Excel/PDF
- Notificações por email
- API para integração externa
- Dashboard com gráficos interativos
