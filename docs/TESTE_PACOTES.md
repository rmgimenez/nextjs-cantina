# Guia de Teste - Sistema de Pacotes de Alimentação

## Pré-requisitos

1. Servidor Next.js rodando (`pnpm dev`)
2. Banco de dados MySQL configurado
3. Usuário autenticado no sistema
4. Pelo menos um aluno cadastrado na tabela `alunos`

## Passo a Passo para Teste Completo

### 1. Inserir Dados de Teste

Execute o script SQL de dados de teste:

```bash
mysql -u root -p sant31br < docs/dados_teste_pacotes.sql
```

Ou execute manualmente no MySQL Workbench/HeidiSQL.

### 2. Testar Cadastro de Pacotes

1. Acesse: `http://localhost:3000/alunos/pacotes`
2. Clique em "Novo Pacote"
3. Preencha os dados:
   - **Nome**: Teste Lanche Especial
   - **Tipo de Refeição**: Lanche da Manhã
   - **Descrição**: Pacote de teste com lanche especial
   - **Quantidade de Refeições**: 10
   - **Validade (dias)**: 15
   - **Valor (R$)**: 100.00
4. Clique em "Criar Pacote"
5. Verifique que aparece na listagem

**Resultado esperado:** Pacote criado com sucesso e listado na tabela.

### 3. Testar Edição de Pacote

1. Na listagem de pacotes, clique no ícone de lápis (editar)
2. Altere o valor para R$ 120,00
3. Clique em "Salvar Alterações"
4. Verifique que o valor foi atualizado na listagem

**Resultado esperado:** Alterações salvas com sucesso.

### 4. Testar Contratação de Pacote para Aluno

1. Na tela de pacotes, clique em "Contratar Pacote para Aluno"
2. Digite o RA de um aluno válido (ex: 12345)
3. Clique no botão de busca (🔍)
4. Confirme que o nome do aluno aparece
5. Selecione o pacote "Teste Lanche Especial" no dropdown
6. Defina a data de início como hoje
7. Clique em "Contratar Pacote"

**Resultado esperado:** 
- Mensagem "Pacote contratado com sucesso"
- Modal fecha automaticamente

### 5. Testar Consulta de Pacotes do Aluno

1. Acesse: `http://localhost:3000/alunos/pacotes/consultar`
2. Digite o RA do aluno que contratou o pacote
3. Clique em "Buscar"
4. Verifique a seção "Pacotes Ativos"

**Resultado esperado:**
- Pacote listado com todas as informações
- Mostra "10 / 10" em Utilizado
- Mostra "10" em Restante
- Status "ATIVO"
- Botão "Usar" habilitado

### 6. Testar Uso de Pacote

1. Na mesma tela de consulta, clique em "Usar" no pacote
2. Confirme que o tipo de refeição está correto (Lanche da Manhã)
3. Opcionalmente, adicione observações: "Teste de uso"
4. Clique em "Confirmar Uso"

**Resultado esperado:**
- Mensagem "Uso de pacote registrado com sucesso! Restam 9 refeições."
- Modal fecha
- Quantidade atualiza para "1 / 10" utilizado
- Quantidade restante: 9
- Aparece no histórico de uso

### 7. Testar Validação de Uso Duplicado

1. Tente usar o mesmo pacote novamente
2. Clique em "Usar" e confirme

**Resultado esperado:**
- Erro: "Já foi utilizado um pacote desta refeição hoje"

### 8. Testar Integração com PDV

1. Acesse: `http://localhost:3000/pdv`
2. Busque o aluno pelo RA
3. Observe a lateral esquerda

**Resultado esperado:**
- Exibe card verde "Pacotes Disponíveis"
- Mostra o pacote "Teste Lanche Especial"
- Mostra "9 refeições restantes"
- Mostra validade do pacote
- Botão "Usar Pacote" disponível

### 9. Testar Pacote Esgotado

1. Volte para `/alunos/pacotes/consultar`
2. Use o pacote 9 vezes consecutivas (mudando a data no banco se necessário para testar)
3. Tente usar pela 11ª vez

**Resultado esperado:**
- Erro: "Pacote já foi totalmente utilizado"
- Pacote automaticamente inativado
- Não aparece mais como disponível no PDV

### 10. Testar Inativação de Pacote

1. Volte para `/alunos/pacotes`
2. Clique no ícone de lixeira em um pacote sem contratos ativos
3. Confirme a inativação

**Resultado esperado:**
- Pacote marcado como "Inativo"
- Não aparece mais para seleção na contratação

### 11. Testar Validação de Pacote com Contratos Ativos

1. Tente inativar um pacote que tem contratos ativos
2. Clique no ícone de lixeira

**Resultado esperado:**
- Erro: "Não é possível inativar pacote com contratos ativos"

## Testes de API (Opcional)

### Usando cURL ou Postman

#### 1. Listar Pacotes
```bash
curl http://localhost:3000/api/pacotes
```

#### 2. Criar Pacote
```bash
curl -X POST http://localhost:3000/api/pacotes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "API Test Package",
    "tipo_refeicao": "ALMOCO",
    "quantidade_refeicoes": 15,
    "valor": 300
  }'
```

#### 3. Verificar Pacotes do Aluno
```bash
curl http://localhost:3000/api/alunos/pacotes/verificar/12345
```

## Verificação no Banco de Dados

### Ver pacotes criados
```sql
SELECT * FROM cant_pacotes_alimentacao;
```

### Ver pacotes contratados
```sql
SELECT 
  pa.*,
  a.nome as aluno_nome,
  p.nome as pacote_nome
FROM cant_pacotes_alunos pa
INNER JOIN alunos a ON pa.ra_aluno = a.ra
INNER JOIN cant_pacotes_alimentacao p ON pa.id_pacote = p.id;
```

### Ver histórico de uso
```sql
SELECT 
  up.*,
  a.nome as aluno_nome,
  p.nome as pacote_nome
FROM cant_uso_pacotes up
INNER JOIN cant_pacotes_alunos pa ON up.id_pacote_aluno = pa.id
INNER JOIN alunos a ON pa.ra_aluno = a.ra
INNER JOIN cant_pacotes_alimentacao p ON pa.id_pacote = p.id
ORDER BY up.data_utilizacao DESC;
```

## Checklist de Funcionalidades

- [ ] Cadastro de pacote
- [ ] Edição de pacote
- [ ] Listagem de pacotes
- [ ] Inativação de pacote
- [ ] Contratação de pacote para aluno
- [ ] Consulta de pacotes do aluno
- [ ] Uso de pacote (registro de refeição)
- [ ] Validação de uso duplicado no mesmo dia
- [ ] Validação de pacote esgotado
- [ ] Validação de pacote vencido
- [ ] Exibição no PDV
- [ ] Histórico de uso
- [ ] Cálculo automático de data fim
- [ ] Decremento automático de quantidade
- [ ] Inativação automática ao esgotar

## Problemas Comuns

### "Aluno não encontrado"
- Verifique se o RA existe na view `alunos`
- Use apenas RAs de alunos atualmente matriculados

### "Não autenticado"
- Faça login em `/login` antes de testar
- Verifique se o cookie de autenticação está presente

### Pacote não aparece no PDV
- Verifique se o pacote está ativo
- Verifique se ainda tem refeições disponíveis
- Verifique se não está vencido
- Recarregue a página do PDV

### Erro ao criar pacote
- Verifique os tipos de dados (valor deve ser decimal)
- Quantidade deve ser inteiro positivo
- Tipo de refeição deve ser um dos valores válidos

## Logs para Debug

Abra o console do navegador (F12) para ver:
- Requisições à API
- Respostas de erro
- Dados carregados

No terminal do servidor Next.js:
- Erros de banco de dados
- Validações falhadas
- Stack traces
