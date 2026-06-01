# Instruções rápidas Docker + Scaffold

1. Inicializar (vai criar o backend Laravel e o frontend Vue se estiverem ausentes):

```bash
chmod +x scripts/init.sh
./scripts/init.sh
# ou no Windows PowerShell
./scripts/init.ps1
```

2. Depois de criados, configure `backend/.env` para apontar para o MySQL:

```
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=sige
DB_USERNAME=sige
DB_PASSWORD=sige
```

3. Subir containers:

```bash
docker-compose up -d --build
```

4. Executar migrations e seeders (usar o container `php` ou `composer`):

```bash
docker-compose run --rm php bash -lc "cd /var/www/html && composer install && php artisan key:generate && php artisan migrate --seed"
```

5. O backend ficará disponível em `http://localhost:8000` e o frontend Vue em `http://localhost:5173`.

6. O `docker-compose.yml` já inclui o serviço Node para executar o frontend Vue em `5173`.

7. Se precisar criar o backend ou frontend do zero, use os scripts de scaffold em `./scripts/init.sh` ou `./scripts/init.ps1`.
