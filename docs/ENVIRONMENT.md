# Configuração de Ambiente (.env)

Este documento descreve as variáveis de ambiente usadas pelo projeto **nextjs-cantina** e como configurar um arquivo `.env.local` para desenvolvimento.

## Passo a passo rápido

1. Copie o arquivo de exemplo para `.env.local`:

```bash
# No Windows (PowerShell ou cmd com ferramentas Unix instaladas)
copy .env.local.example .env.local
```

2. Atualize as variáveis sensíveis: `MYSQL_PASSWORD`, `JWT_SECRET`, `SMTP_PASS` etc.
3. Para gerar um JWT_SECRET forte, use um gerador seguro. Exemplos:

- OpenSSL (Linux/macOS/Windows com OpenSSL):

```bash
openssl rand -hex 32
```

- Node.js (quando tiver node):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o valor gerado e cole em `JWT_SECRET`.

## Variáveis principais

- MYSQL_HOST: host do servidor MySQL (ex: localhost)
- MYSQL_PORT: porta do MySQL (ex: 3306)
- MYSQL_USER: usuário do banco
- MYSQL_PASSWORD: senha do banco (mantenha secreta)
- MYSQL_DATABASE: nome do banco (ex: sant31br)

- JWT_SECRET: segredo usado para assinar tokens JWT. Use uma string longa e aleatória (mínimo 32 bytes).
- JWT_EXPIRES_IN: tempo de expiração do token (ex: 8h)

- COOKIE_NAME: nome do cookie que armazena o JWT
- COOKIE_SECURE: configure `true` em produção (HTTPS)
- COOKIE_SAME_SITE: `lax` ou `strict` dependendo do comportamento desejado

- NEXT_PUBLIC_APP_NAME: nome público da aplicação (usado no frontend)
- NEXT_PUBLIC_API_PREFIX: prefixo das rotas da API (padrão: `/api`)

- SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/EMAIL_FROM: usados para envio de e-mails (opcional)

## Boas práticas

- Nunca comite o `.env.local` no repositório. Adicione ao `.gitignore` se não estiver.
- Use variáveis diferentes entre `development`, `staging` e `production`.
- Em produção, prefira injetar variáveis via plataforma (Vercel, Docker, Kubernetes, etc.) em vez de arquivo `.env` em repositório.
- Verifique permissões do arquivo para que apenas usuários autorizados possam lê-lo em servidores compartilhados.

## Notas sobre Vercel e Docker

- Vercel: defina as variáveis de ambiente no painel do projeto (Settings > Environment Variables). Use os mesmos nomes que neste arquivo.
- Docker: passe variáveis via `docker run -e` ou use um `env_file` apontando para um arquivo `.env` que não esteja no repositório.

## Exemplo de uso no Windows (cmd.exe)

```cmd
rem Copiar o arquivo de exemplo
copy .env.local.example .env.local
rem Gerar segredo com Node.js (exemplo)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" > jwt_secret.txt
rem Abra jwt_secret.txt e copie o valor para JWT_SECRET em .env.local
```

## Segurança

- Rotacione `JWT_SECRET` se houver suspeita de vazamento.
- Use HTTPS em produção e ative `COOKIE_SECURE=true`.
- Não armazene segredos em backups públicos.

## Troubleshooting

- Erro ao conectar no MySQL: verifique `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER` e `MYSQL_PASSWORD`.
- Tokens inválidos: confirme que `JWT_SECRET` é o mesmo nas instâncias da aplicação.
- Emails não enviados: verifique credenciais SMTP e portas (587 para TLS, 465 para SSL).

Se precisar, posso ajustar o `.env.local.example` com variáveis adicionais detectadas no código do projeto (por exemplo Sentry, Redis, etc.).
