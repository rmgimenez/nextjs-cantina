#!/usr/bin/env bash
# Script para rodar a aplicação Next.js em produção (Linux / macOS)
# Uso: chmod +x run-prod.sh && ./run-prod.sh

set -euo pipefail

export NODE_ENV=production
echo "NODE_ENV=$NODE_ENV"

if [ ! -d node_modules ]; then
  echo "Instalando dependências (pnpm install)..."
  pnpm install
fi

echo "Construindo aplicação (pnpm build)..."
pnpm build

echo "Iniciando servidor de produção (pnpm start)..."
pnpm start
