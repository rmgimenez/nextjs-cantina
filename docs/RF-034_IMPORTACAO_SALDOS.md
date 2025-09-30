# RF-034 - Importação de Saldos de Alunos

## Descrição

Funcionalidade que permite a importação em lote de saldos de contas de alunos através de um arquivo CSV. Disponível apenas para usuários com perfil **Administrador**.

## Status

✅ **Concluído**

## Componentes Criados

### 1. API Route
- **Arquivo**: `/app/api/alunos/importar-saldos/route.ts`
- **Método**: POST
- **Autenticação**: Requerida (apenas Administradores)

### 2. Página de Interface
- **Arquivo**: `/app/alunos/importar-saldos/page.tsx`
- **Rota**: `/alunos/importar-saldos`
- **Acesso**: Menu lateral → Alunos → Importar Saldos

## Formato do Arquivo CSV

### Especificações
- **Sem cabeçalho**
- **Separador**: ponto e vírgula (`;`)
- **Formato**: `RA_DO_ALUNO;SALDO`
- **Codificação**: UTF-8 (recomendado)

### Formato do Saldo
- Aceita valores com **vírgula** ou **ponto** como separador decimal
- Exemplos válidos:
  - `123456;100,50`
  - `789012;250.00`
  - `345678;75.25`

### Arquivo Modelo

```csv
123456;100.50
789012;250.00
345678;75.25
```

Um botão para download do arquivo modelo está disponível na interface.

## Regras de Negócio

### 1. Validações
- ✅ Apenas administradores podem acessar
- ✅ RA deve existir na view `alunos` (alunos matriculados)
- ✅ RA deve ser um número inteiro positivo
- ✅ Saldo deve ser um número válido
- ✅ Formato da linha deve ser: `RA;SALDO`

### 2. Processamento
- Se o aluno **já possui conta ativa**: o saldo é **atualizado**
- Se o aluno **não possui conta**: uma nova conta é **criada** automaticamente
- Cada importação gera uma **movimentação de ajuste** preservando o saldo anterior
- Erros em linhas específicas **não interrompem** o processamento das demais

### 3. Movimentações Criadas
Para cada aluno processado com sucesso:
- **Tipo**: CREDITO ou DEBITO (conforme diferença entre saldo anterior e novo)
- **Valor**: diferença absoluta entre saldos
- **Descrição**: "Importação de saldo via arquivo: [nome_do_arquivo]"
- **Saldo anterior**: registrado
- **Saldo posterior**: registrado

### 4. Log de Auditoria
Cada importação gera um registro na tabela `cant_log_acoes` com:
- ID do usuário que realizou a importação
- Ação: `IMPORTACAO_SALDOS_ALUNOS`
- Tabela afetada: `cant_contas_alunos`
- Dados JSON contendo:
  - Nome do arquivo
  - Total de linhas processadas
  - Quantidade de contas criadas
  - Quantidade de contas atualizadas
  - Total de erros
  - Data e hora da importação

## Relatório de Importação

Após o processamento, a interface exibe um relatório completo com:

### Resumo Geral
- Total de linhas processadas
- Quantidade de contas criadas
- Quantidade de contas atualizadas
- Quantidade de erros encontrados

### Lista de Erros (se houver)
Tabela com:
- Número da linha
- RA informado
- Saldo informado
- Motivo do erro

Exemplos de erros:
- "Formato inválido. Esperado: RA;SALDO"
- "RA inválido. Deve ser um número inteiro positivo."
- "Saldo inválido. Deve ser um número válido."
- "Aluno não encontrado ou não está matriculado."

### Lista de Alunos Processados
Tabela detalhada com:
- RA do aluno
- Nome completo
- Saldo anterior
- Saldo novo
- Diferença (destacada em verde se positiva, vermelho se negativa)

## Exemplo de Uso

### 1. Acessar a Funcionalidade
1. Fazer login como Administrador
2. No menu lateral, expandir "Alunos"
3. Clicar em "Importar Saldos"

### 2. Preparar o Arquivo CSV
Criar arquivo `saldos_alunos.csv`:
```csv
123456;100.50
234567;200.00
345678;150.75
```

### 3. Realizar a Importação
1. Clicar em "Escolher arquivo" e selecionar o CSV
2. Verificar se o arquivo foi selecionado corretamente
3. Clicar em "Importar Saldos"
4. Aguardar o processamento
5. Analisar o relatório exibido

### 4. Verificar Resultados
- Conferir resumo de contas criadas/atualizadas
- Verificar se há erros e corrigi-los se necessário
- Revisar a lista de alunos afetados
- Confirmar os saldos no sistema

## Tabelas Afetadas

### Criação/Atualização
- `cant_contas_alunos`: Cria ou atualiza contas
- `cant_movimentacoes_alunos`: Registra movimentação de ajuste
- `cant_log_acoes`: Registra auditoria da importação

### Consultas
- `alunos` (view): Valida existência do aluno

## Segurança

### Controles Implementados
- ✅ Verificação de autenticação
- ✅ Verificação de perfil (apenas Administrador)
- ✅ Validação de formato do arquivo
- ✅ Validação de dados (RA e saldo)
- ✅ Transações isoladas por linha (erro em uma não afeta outras)
- ✅ Log completo de auditoria
- ✅ Preservação de histórico (saldo anterior registrado)

### Permissões
- **Perfil necessário**: ADMINISTRADOR (id_perfil = 1)
- **Operadores**: Não têm acesso a esta funcionalidade

## Limitações e Considerações

### Limitações
- Apenas formato CSV com separador `;`
- Não suporta atualização de outros campos além do saldo
- Não processa arquivos com cabeçalho
- Tamanho do arquivo limitado pela configuração do servidor

### Recomendações
- Testar com arquivo pequeno antes de importar grandes volumes
- Fazer backup dos dados antes de importações grandes
- Revisar o arquivo CSV antes da importação
- Verificar se todos os RAs existem no sistema
- Conferir o relatório de erros após cada importação
- Manter cópia dos arquivos importados para auditoria

## Testes Sugeridos

### Casos de Teste

#### 1. Importação Bem-Sucedida
- Arquivo com 3 alunos válidos
- Verificar criação de contas
- Verificar movimentações criadas
- Verificar log de auditoria

#### 2. Aluno com Conta Existente
- Aluno já possui conta com saldo R$ 50,00
- Importar saldo R$ 100,00
- Verificar atualização do saldo
- Verificar movimentação de ajuste (CREDITO de R$ 50,00)

#### 3. Aluno Sem Conta
- Aluno matriculado sem conta
- Importar saldo R$ 75,00
- Verificar criação da conta
- Verificar movimentação inicial (CREDITO de R$ 75,00)

#### 4. Erros de Validação
- Linha com formato incorreto: `123456,100.50` (vírgula ao invés de ponto e vírgula)
- RA inexistente: `999999;100.00`
- RA inválido: `ABC;100.00`
- Saldo inválido: `123456;XYZ`
- Verificar que erros são reportados corretamente
- Verificar que outras linhas são processadas

#### 5. Valores com Vírgula e Ponto
- `123456;100,50` (vírgula)
- `234567;200.75` (ponto)
- Verificar que ambos são aceitos

#### 6. Tentativa de Acesso por Operador
- Fazer login como Operador
- Tentar acessar `/alunos/importar-saldos`
- Verificar que o menu não exibe a opção
- Tentar acesso direto via API
- Verificar retorno de erro 403 (Forbidden)

## Manutenção Futura

### Melhorias Possíveis
- [ ] Suporte a outros formatos (Excel, JSON)
- [ ] Importação agendada/automática
- [ ] Validação prévia sem processar
- [ ] Importação de outros campos (limite de crédito, etc.)
- [ ] Envio de notificações por email após importação
- [ ] Histórico de importações anteriores
- [ ] Rollback de importação
- [ ] Progress bar durante processamento de arquivos grandes

### Monitoramento
- Verificar logs de auditoria periodicamente
- Monitorar quantidade de erros em importações
- Revisar performance com arquivos grandes
- Validar integridade dos dados após importações

## Código-Fonte

### Localização dos Arquivos
```
app/
├── alunos/
│   └── importar-saldos/
│       └── page.tsx              # Interface de usuário
└── api/
    └── alunos/
        └── importar-saldos/
            └── route.ts          # Processamento backend
```

### Dependências
- Next.js 15
- React
- Bootstrap 5
- MySQL (mysql2)
- TypeScript

## Conclusão

A funcionalidade RF-034 foi implementada com sucesso, atendendo todos os requisitos especificados:

✅ Upload de arquivo CSV  
✅ Validação de perfil de administrador  
✅ Processamento linha por linha  
✅ Validação de dados  
✅ Criação/atualização de contas  
✅ Registro de movimentações  
✅ Log de auditoria  
✅ Relatório detalhado  
✅ Tratamento de erros  
✅ Interface amigável  

A solução está pronta para uso em produção.
