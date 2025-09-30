# Sistema de Pacotes de Alimentação

## Visão Geral

O sistema de pacotes de alimentação permite que a cantina ofereça pacotes pré-pagos de refeições para os alunos. Isso facilita o controle e pagamento antecipado de alimentação escolar.

## Funcionalidades Implementadas

### 1. Cadastro de Pacotes de Alimentação
**Tela:** `http://localhost:3000/alunos/pacotes`

Permite criar e gerenciar tipos de pacotes de alimentação com:
- Nome do pacote
- Tipo de refeição (Lanche Manhã, Almoço, Lanche Tarde, Jantar, Personalizado)
- Descrição
- Quantidade de refeições incluídas
- Validade em dias (opcional)
- Valor do pacote
- Período de vigência (opcional)

**Exemplo de pacote:**
- Nome: "Lanche Escolar Mensal"
- Tipo: Lanche da Manhã
- Quantidade: 20 refeições
- Validade: 30 dias
- Valor: R$ 150,00

### 2. Contratação de Pacotes para Alunos
**Tela:** `http://localhost:3000/alunos/pacotes` (botão "Contratar Pacote para Aluno")

Permite vincular um pacote a um aluno específico:
- Buscar aluno por RA
- Selecionar o pacote desejado
- Definir data de início
- Data de fim calculada automaticamente (se o pacote tiver validade em dias)

### 3. Consulta e Uso de Pacotes
**Tela:** `http://localhost:3000/alunos/pacotes/consultar`

Interface para:
- Buscar aluno por RA
- Ver todos os pacotes ativos do aluno
- Ver quantidade restante de refeições
- Registrar uso de uma refeição
- Ver histórico de utilização

### 4. Integração com PDV
**Tela:** `http://localhost:3000/pdv`

Quando um aluno é identificado no PDV, o sistema:
- Verifica automaticamente se há pacotes válidos
- Exibe os pacotes disponíveis na lateral esquerda
- Mostra quantidade restante de refeições
- Permite acesso rápido à tela de uso de pacotes

## APIs REST Implementadas

### Pacotes de Alimentação
- `GET /api/pacotes` - Listar todos os pacotes
- `POST /api/pacotes` - Criar novo pacote
- `GET /api/pacotes/[id]` - Buscar pacote específico
- `PUT /api/pacotes/[id]` - Atualizar pacote
- `DELETE /api/pacotes/[id]` - Inativar pacote

### Pacotes de Alunos
- `GET /api/alunos/pacotes/[ra]` - Listar pacotes de um aluno
- `POST /api/alunos/pacotes/[ra]` - Contratar pacote para aluno
- `GET /api/alunos/pacotes/[ra]/[id]` - Buscar pacote específico do aluno
- `PUT /api/alunos/pacotes/[ra]/[id]` - Atualizar pacote do aluno
- `DELETE /api/alunos/pacotes/[ra]/[id]` - Cancelar pacote

### Uso de Pacotes
- `POST /api/alunos/pacotes/uso` - Registrar uso de refeição
- `GET /api/alunos/pacotes/uso` - Ver histórico de uso

### Verificação (PDV)
- `GET /api/alunos/pacotes/verificar/[ra]` - Verificar pacotes válidos do aluno

## Regras de Negócio

### 1. Tipos de Refeição
- **Lanche da Manhã**: Para lanches matutinos
- **Almoço**: Para almoço
- **Lanche da Tarde**: Para lanches vespertinos
- **Jantar**: Para jantar
- **Personalizado**: Pode ser usado para qualquer tipo de refeição

### 2. Validação de Uso
O sistema valida:
- Se o pacote está ativo
- Se ainda há refeições disponíveis
- Se o pacote não está vencido
- Se o tipo de refeição corresponde ao pacote (exceto personalizado)
- Se já não foi usado no mesmo dia para o mesmo tipo de refeição

### 3. Controle de Quantidade
- A cada uso, decrementa automaticamente a quantidade restante
- Quando atinge zero refeições, o pacote é inativado automaticamente
- Não permite uso além da quantidade contratada

### 4. Controle de Validade
- Se o pacote tem validade em dias, é calculada a data fim automaticamente
- Não permite uso de pacotes vencidos
- Alerta quando o pacote está vencendo (7 dias ou menos)

## Fluxo de Uso Completo

### Cenário: Escola contrata pacote de lanche para aluno

1. **Administrador cadastra o pacote** (tela /alunos/pacotes)
   - Nome: "Lanche Mensal Premium"
   - Tipo: Lanche da Manhã
   - Quantidade: 22 refeições
   - Valor: R$ 220,00
   - Validade: 30 dias

2. **Responsável compra o pacote para o aluno** (tela /alunos/pacotes)
   - Busca o aluno pelo RA: 12345
   - Seleciona o pacote "Lanche Mensal Premium"
   - Define data início: 01/10/2025
   - Sistema calcula data fim: 31/10/2025

3. **Aluno usa o pacote diariamente** (tela /alunos/pacotes/consultar)
   - Atendente busca aluno por RA
   - Vê que tem pacote ativo com 22 refeições
   - Clica em "Usar"
   - Confirma tipo: Lanche da Manhã
   - Sistema registra uso e decrementa para 21 refeições

4. **PDV exibe informação do pacote**
   - Quando aluno é identificado no PDV
   - Mostra card verde com "Pacotes Disponíveis"
   - Exibe: "Lanche Mensal Premium - 21 refeições restantes"
   - Link rápido para usar o pacote

## Tabelas do Banco de Dados

### cant_pacotes_alimentacao
Armazena os tipos de pacotes disponíveis:
```sql
- id
- nome
- tipo_refeicao (enum)
- descricao
- quantidade_refeicoes
- validade_dias
- valor
- ativo
- dt_inicio_vigencia
- dt_fim_vigencia
```

### cant_pacotes_alunos
Armazena os pacotes contratados pelos alunos:
```sql
- id
- id_pacote (FK)
- ra_aluno
- quantidade_total
- quantidade_utilizada
- data_inicio
- data_fim
- ativo
```

### cant_uso_pacotes
Registra cada utilização de refeição:
```sql
- id
- id_pacote_aluno (FK)
- data_utilizacao
- tipo_refeicao
- observacoes
- usuario (FK)
```

## Próximas Melhorias Sugeridas

1. **Relatórios**
   - Relatório de pacotes mais vendidos
   - Relatório de utilização por período
   - Faturamento de pacotes

2. **Notificações**
   - Email/SMS quando pacote está vencendo
   - Alerta quando restam poucas refeições
   - Notificação de compra para responsável

3. **Pagamento Online**
   - Integração com gateway de pagamento
   - Responsável pode comprar pacotes pelo portal

4. **Controle de Estoque**
   - Vincular produtos específicos aos pacotes
   - Controlar estoque ao usar pacote

5. **Múltiplos Usos Diários**
   - Configurar se pode usar mais de uma vez por dia
   - Controle por horário (manhã, tarde, noite)

## Requisitos Funcionais Atendidos

- ✅ **RF-015** - Pacotes de Alimentação
- ✅ **RF-016** - Controle de Uso de Pacotes
- 🔄 **RF-009** - PDV (integração com pacotes adicionada)

## Teste da Funcionalidade

### Passo 1: Criar um Pacote
1. Acesse `http://localhost:3000/alunos/pacotes`
2. Clique em "Novo Pacote"
3. Preencha:
   - Nome: "Teste Lanche"
   - Tipo: Lanche da Manhã
   - Quantidade: 5
   - Valor: 50.00
4. Salve

### Passo 2: Contratar para um Aluno
1. Na mesma tela, clique em "Contratar Pacote para Aluno"
2. Digite um RA válido de teste
3. Busque o aluno
4. Selecione o pacote criado
5. Defina data início (hoje)
6. Confirme

### Passo 3: Usar o Pacote
1. Acesse `http://localhost:3000/alunos/pacotes/consultar`
2. Busque o mesmo aluno
3. Veja o pacote listado
4. Clique em "Usar"
5. Confirme o uso
6. Verifique que decrementou para 4 refeições

### Passo 4: Verificar no PDV
1. Acesse `http://localhost:3000/pdv`
2. Busque o mesmo aluno
3. Veja na lateral esquerda o card verde "Pacotes Disponíveis"
4. Deve mostrar "Teste Lanche - 4 refeições restantes"

## Suporte e Documentação

Para dúvidas ou problemas:
1. Consulte este documento
2. Verifique os logs no console do navegador (F12)
3. Verifique os logs da API no terminal do servidor
4. Consulte o arquivo `bancodados.sql` para estrutura das tabelas
