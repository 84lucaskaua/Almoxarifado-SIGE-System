#!/usr/bin/env pwsh
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Output "Iniciando criação do backend Laravel (se não existir)..."
if (-not (Test-Path "$Root\..\backend\composer.json")) {
  docker-compose run --rm composer create-project --prefer-dist laravel/laravel backend
  Write-Output "Laravel criado em ./backend"
} else {
  Write-Output "Parece que o backend já existe. Pulando criação."
}

Write-Output "Iniciando criação do frontend Vue (se não existir)..."
if (-not (Test-Path "$Root\..\frontend\package.json")) {
  docker-compose run --rm node npx create-vite@latest frontend -- --template vue
  docker-compose run --rm node bash -lc "cd frontend && npm install"
  Write-Output "Frontend criado em ./frontend"
} else {
  Write-Output "Parece que o frontend já existe. Pulando criação."
}

Write-Output "Pronto. Ajuste .env e rode: docker-compose up -d --build"
