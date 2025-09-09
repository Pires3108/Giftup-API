APICRUD + Frontend (Docker)

Pré-requisitos
- Docker e Docker Compose instalados

Como rodar
1) Crie um arquivo .env na raiz (opcional, senão usarão os defaults):

POSTGRES_USER=nicolas
POSTGRES_PASSWORD=SenhaSeguraAqui
POSTGRES_DB=crud

2) Suba os serviços:

docker-compose up -d

3) URLs
- API/Swagger: http://localhost:5000
- Frontend (Vite): http://localhost:5173

Parar serviços
- Parar tudo: docker-compose down
- Parar apenas backend: docker-compose stop backend
- Logs backend: docker-compose logs -f backend

Persistência de dados
- O Postgres usa volume nomeado postgres_data
- Não use docker-compose down -v se deseja manter os dados

Configurações/Segredos
- Senhas e conexão são lidas de variáveis de ambiente via .env (ou defina no docker-compose)
- As strings de conexão no appsettings usam placeholders ${POSTGRES_*}

Ambiente
- Backend .NET 8, porta 5000
- Frontend Vite (dev server), porta 5173
- PostgreSQL 16, porta 5432 (no host)

Observações
- Para endpoints privados, faça login em /api/v1/cliente/login e use o token no header Authorization
- Uploads são gravados em Storage (persistido via volume)

