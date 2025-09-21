# Sistema de Controle de Cantina Escolar

Este é um sistema completo para gestão de cantinas escolares, desenvolvido com Next.js, TypeScript e MySQL.

## Funcionalidades Implementadas

### ✅ Tela Inicial (Dashboard)

- **Verificação de autenticação automática**: Redireciona para login se usuário não estiver autenticado
- **Dashboard responsivo** com estatísticas principais:
  - Vendas do dia
  - Produtos em estoque
  - Alunos ativos
  - Alertas de estoque baixo
- **Ações rápidas** para funcionalidades principais
- **Design personalizado** com cores da cantina (#253287, #B20000, #FEA800)
- **Interface moderna** usando Bootstrap

### ✅ Autenticação (RF-001)

- Sistema de login com usuário e senha
- Sessões seguras com JWT
- Controle de perfis de acesso
- Logout automático

## Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **MySQL** - Banco de dados relacional
- **Bootstrap 5** - Framework CSS responsivo
- **JWT** - Autenticação stateless
- **bcryptjs** - Hash de senhas

## Cores do Sistema

- **Azul Principal**: #253287
- **Vermelho**: #B20000
- **Amarelo**: #FEA800
- **Escuro**: #333333
- **Claro**: #FFFFFF

## Como Executar

1. **Instalar dependências**:

```bash
pnpm install
```

2. **Configurar banco de dados**:

   - Criar banco MySQL
   - Executar script `bancodados.sql`
   - Configurar variáveis de ambiente em `.env.local`

3. **Executar aplicação**:

```bash
pnpm dev
```

4. **Acessar**: http://localhost:3001

## Estrutura do Projeto

```
app/
├── api/auth/          # APIs de autenticação
├── login/            # Página de login
├── layout.tsx        # Layout principal
├── page.tsx          # Dashboard inicial
└── globals.css       # Estilos globais

lib/
├── auth.ts           # Funções de autenticação
├── db.ts            # Conexão com banco
└── jwt.ts           # Utilitários JWT
```

## APIs Disponíveis

- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/logout` - Logout do usuário
- `GET /api/auth/me` - Verificar usuário autenticado

## Próximos Passos

- Implementar PDV (Ponto de Venda)
- Gestão de produtos e estoque
- Controle de contas de alunos
- Relatórios e dashboards avançados
