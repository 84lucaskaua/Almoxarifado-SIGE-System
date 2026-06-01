#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

echo "Iniciando criação do backend Laravel (se não existir)..."
if [ ! -f "$ROOT_DIR/backend/composer.json" ]; then
  docker-compose run --rm composer create-project --prefer-dist laravel/laravel backend
  echo "Laravel criado em ./backend"
else
  echo "Parece que o backend já existe (backend/composer.json encontrado). Pulando criação."
fi

echo "Iniciando criação do frontend Vue (se não existir)..."
if [ ! -f "$ROOT_DIR/frontend/package.json" ]; then
  docker-compose run --rm node npx create-vite@latest frontend -- --template vue
  docker-compose run --rm node bash -lc "cd frontend && npm install"
  echo "Frontend criado em ./frontend"
else
  echo "Parece que o frontend já existe (frontend/package.json encontrado). Pulando criação."
fi

echo "Pronto. Você pode agora ajustar arquivos .env e rodar 'docker-compose up -d --build'"
