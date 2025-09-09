APICRUD + Frontend (Docker)

### Pré-requisitos
- Docker e Docker Compose instalados

### 1) Configuração do .env
Crie o arquivo `.env` na raiz (mesmo nível do `docker-compose.yml`). Você pode usar o exemplo:

```
cp .env.example .env
```

Edite o `.env` e ajuste a sua senha:
```
POSTGRES_USER=nicolas
POSTGRES_PASSWORD=SuaSenhaSegura
POSTGRES_DB=crud
```

Importante: se o volume do Postgres já existir, a senha válida é a que foi usada quando o volume foi criado pela primeira vez.

### 2) Subir os serviços
```
docker-compose up -d
```

### 3) URLs
- API/Swagger: http://localhost:5000
- Frontend (Vite): http://localhost:5173

### 4) Parar / logs
- Parar tudo: `docker-compose down`
- Parar apenas backend: `docker-compose stop backend`
- Logs backend: `docker-compose logs -f backend`

### 5) Banco de dados (seed)
Um dump do banco foi exportado para `db/seed.sql`.

Para restaurar no container:
```
docker cp ./db/seed.sql apicrud-db:/tmp/seed.sql
docker-compose exec db psql -U %POSTGRES_USER% -d %POSTGRES_DB% -f /tmp/seed.sql
```

Para exportar novamente (opcional):
```
docker-compose exec db sh -lc 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /tmp/seed.sql'
docker cp apicrud-db:/tmp/seed.sql ./db/seed.sql
```

Persistência: o Postgres usa o volume `postgres_data`. Não use `docker-compose down -v` se deseja manter os dados.

### 6) Imagens dos itens
- As imagens atuais foram copiadas para `storage_export/` (para versionamento).
- Em runtime, uploads ficam em `/app/Storage` (mapeado no volume `storage_data`).
- Se desejar popular a pasta de runtime com as imagens exportadas, copie-as para o volume ou reenvie via endpoints.

### 7) Autenticação
- Endpoints públicos não exigem token.
- Login: `POST /api/v1/cliente/login` retorna um token (JWT) usado apenas nos endpoints com `[Authorize]`.
- No frontend, se houver `token` no `localStorage`, ele é enviado no header `Authorization` automaticamente.

### 8) Estrutura/Segredos
- Strings de conexão usam `${POSTGRES_*}` nos `appsettings.*.json`.
- Defina valores no `.env` (não versionar `.env`, apenas `.env.example`).

### 9) Git/GitHub (primeiro push)
```
git init
git add .
git commit -m "Initial Dockerized project"
git remote add origin https://github.com/SEU_USER/SEU_REPO.git
git branch -M main
git push -u origin main
```

### 10) Troubleshooting
- ERR_EMPTY_RESPONSE no frontend: verifique se o backend está `healthy` e se o `.env` bate com o volume do Postgres.
- CORS: chamadas devem ir para `http://localhost:5000/api/v1/...` (o frontend usa `VITE_API_URL`).
- Banco “zerado”: use o `db/seed.sql` para restaurar ou evite `down -v`.

