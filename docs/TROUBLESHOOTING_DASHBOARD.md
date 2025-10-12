# Solução de Problemas - Dashboard

## Erro: "Erro interno do servidor"

### Possíveis Causas

1. **Banco de dados não conectado**
2. **Views não criadas**
3. **Tabelas não existem**
4. **Credenciais incorretas**

### Diagnóstico

Acesse a página de diagnóstico do sistema:

```
http://localhost:3001/diagnostico
```

Esta página verificará:

- ✅ Conexão com o banco de dados
- ✅ Existência das views necessárias
- ✅ Configuração do ambiente

### Soluções

#### 1. Verificar arquivo .env.local

Certifique-se de que o arquivo `.env.local` existe na raiz do projeto com as seguintes variáveis:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha_aqui
MYSQL_DATABASE=sant31br
JWT_SECRET=seu_secret_jwt_aqui
```

#### 2. Criar as tabelas e views

Execute o script SQL no MySQL:

```bash
# Windows (cmd)
mysql -u root -p sant31br < bancodados.sql

# Windows (PowerShell)
Get-Content bancodados.sql | mysql -u root -p sant31br

# Linux/Mac
mysql -u root -p sant31br < bancodados.sql
```

#### 3. Verificar se o MySQL está rodando

```bash
# Windows
sc query MySQL80

# Linux
sudo systemctl status mysql

# Mac
brew services list | grep mysql
```

#### 4. Testar conexão manualmente

```bash
mysql -u root -p sant31br
```

Se conectar com sucesso, tente:

```sql
SHOW TABLES LIKE 'cant_%';
SHOW FULL TABLES WHERE Table_type = 'VIEW';
```

### Views Necessárias

O sistema precisa das seguintes views:

- `vw_cant_vendas_completa`
- `vw_cant_estoque_alertas`
- `vw_cant_contas_alunos_completa`
- `vw_cant_vendas_funcionarios`
- `vw_cant_contas_funcionarios`

### Erro Persistente?

Se o erro continuar mesmo após seguir os passos acima:

1. Verifique os logs do servidor Next.js no terminal
2. Acesse `/diagnostico` para ver detalhes técnicos
3. Verifique se há erros no console do navegador (F12)
4. Reinicie o servidor: `pnpm dev`

### Recuperação Rápida

Se precisar resetar o banco de dados:

```bash
# 1. Dropar tudo
mysql -u root -p sant31br < bancodados-drop.sql

# 2. Recriar tudo
mysql -u root -p sant31br < bancodados.sql
```

⚠️ **ATENÇÃO:** Isso apagará todos os dados!

## Contato para Suporte

Se o problema persistir, documente:

1. Mensagem de erro completa
2. Output do `/diagnostico`
3. Logs do servidor
4. Versão do MySQL: `mysql --version`
