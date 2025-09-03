@echo off
REM Script para rodar a aplicação Next.js em produção no Windows
REM Uso: execute este arquivo a partir da raiz do projeto

SETLOCAL
SET NODE_ENV=production
echo NODE_ENV=%NODE_ENV%

REM Instala dependências em produção apenas se node_modules não existir
IF NOT EXIST node_modules (
  echo Instalando dependências (pnpm install)...
  pnpm install
)

echo Construindo aplicação (next build)...
pnpm build
IF %ERRORLEVEL% NEQ 0 (
  echo Erro durante o build. Abortando.
  EXIT /B %ERRORLEVEL%
)

echo Iniciando servidor de produção (next start)...
pnpm start

ENDLOCAL
