# Configuração Inicial do Sistema

## Pré-requisitos

- Node.js 18+ instalado
- MySQL 8.0+ instalado e rodando
- PNPM instalado (`npm install -g pnpm`)

## Passo a Passo

### 1. Instalar Dependências

```bash
pnpm install
```

### 2. Configurar Banco de Dados

#### 2.1. Criar o banco de dados

```sql
CREATE DATABASE sant31br CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2.2. Executar o script SQL

**Windows (CMD):**

```bash
mysql -u root -p sant31br < bancodados.sql
```

**Windows (PowerShell):**

```powershell
Get-Content bancodados.sql | mysql -u root -p sant31br
```

**Linux/Mac:**

```bash
mysql -u root -p sant31br < bancodados.sql
```

Ou use o script helper no Windows:

```bash
verificar-sistema.bat
```

### 3. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Configurações do MySQL
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=sua_senha_aqui
MYSQL_DATABASE=sant31br

# Segurança JWT
JWT_SECRET=seu_secret_jwt_super_secreto_aqui
```

⚠️ **Importante:** Nunca commite o arquivo `.env.local` no Git!

### 4. Verificar Instalação

Execute o diagnóstico do sistema:

```bash
# Inicie o servidor
pnpm dev

# Acesse no navegador
http://localhost:3001/diagnostico
```

Esta página verificará:

- ✅ Conexão com banco de dados
- ✅ Existência das views necessárias
- ✅ Configuração do ambiente

### 5. Acessar o Sistema

1. Abra: `http://localhost:3001`
2. Faça login com as credenciais padrão:
   - **Usuário:** `admin`
   - **Senha:** `password`

⚠️ **IMPORTANTE:** Altere a senha padrão após o primeiro acesso!

## Estrutura do Banco de Dados

O script `bancodados.sql` cria:

### Tabelas Principais

- `cant_usuarios_cantina` - Usuários do sistema
- `cant_produtos` - Produtos da cantina
- `cant_tipos_produtos` - Categorias de produtos
- `cant_estoque` - Controle de estoque
- `cant_vendas` - Registro de vendas
- `cant_caixa` - Controle de caixa
- `cant_contas_alunos` - Contas dos alunos
- E muitas outras...

### Views

- `vw_cant_vendas_completa` - Vendas com dados completos
- `vw_cant_estoque_alertas` - Alertas de estoque
- `vw_cant_contas_alunos_completa` - Contas de alunos com dados pessoais
- `vw_cant_vendas_funcionarios` - Vendas de funcionários
- `vw_cant_contas_funcionarios` - Contas de funcionários

### Dados Iniciais

- 2 perfis de acesso (ADMINISTRADOR, OPERADOR)
- 1 usuário admin padrão
- 5 tipos de produtos básicos
- 8 produtos de exemplo com estoque

## Solução de Problemas

### Erro: "Não foi possível conectar ao banco de dados"

1. Verifique se o MySQL está rodando:

   ```bash
   # Windows
   sc query MySQL80

   # Iniciar se não estiver rodando
   sc start MySQL80
   ```

2. Teste a conexão manualmente:

   ```bash
   mysql -u root -p
   ```

3. Verifique as credenciais no `.env.local`

### Erro: "Views não encontradas"

Execute novamente o script SQL:

```bash
mysql -u root -p sant31br < bancodados.sql
```

### Erro: "Table doesn't exist"

O banco de dados não foi criado corretamente. Execute:

```bash
# Resetar banco
mysql -u root -p sant31br < bancodados-drop.sql
mysql -u root -p sant31br < bancodados.sql
```

⚠️ **ATENÇÃO:** Isso apagará todos os dados!

### Porta 3000 já está em uso

O Next.js tentará usar a porta 3001 automaticamente. Se precisar especificar:

```bash
pnpm dev -p 3002
```

## Comandos Úteis

```bash
# Desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Iniciar produção
pnpm start

# Verificar erros de TypeScript
pnpm build

# Limpar cache do Next.js
Remove-Item -Recurse -Force .next
```

## Próximos Passos

1. ✅ Alterar senha do admin
2. ✅ Criar usuários operadores
3. ✅ Cadastrar produtos
4. ✅ Configurar tipos de produtos
5. ✅ Registrar estoque inicial
6. ✅ Configurar contas de alunos
7. ✅ Abrir primeiro caixa

## Documentação Adicional

- [Solução de Problemas do Dashboard](./docs/TROUBLESHOOTING_DASHBOARD.md)
- [Estrutura do Projeto](./sobre.md)
- [Requisitos Funcionais](./sobre.md#requisitos-funcionais)

## Suporte

Se precisar de ajuda:

1. Consulte `/diagnostico` no navegador
2. Verifique os logs do servidor no terminal
3. Leia a documentação em `/docs`
