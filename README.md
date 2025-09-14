APICRUD + Frontend

Guia para clonar, configurar e consumir a API (com exemplos práticos).

### Pré-requisitos
- .NET 8.0 SDK
- Node.js (versão 18 ou superior)
- PostgreSQL

### 1) Clonar o projeto
```
git clone <URL_DO_REPOSITORIO>
cd APICRUD
```

### 2) Configurar o banco de dados
Configure a string de conexão no arquivo `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=crud;Username=nicolas;Password=SuaSenhaSegura"
  }
}
```

### 3) Executar o projeto

**Backend (API):**
```
cd APICRUD
dotnet run
```

**Frontend:**
```
cd giftup-frontend
npm install
npm run dev
```

URLs após subir:
- API/Swagger: http://localhost:5000
- Frontend (dev): http://localhost:5173

### 3) Consumindo a API (exemplos)

Base URL: `http://localhost:5000/api/v1`

Itens
1) Listar itens (público)
```
curl http://localhost:5000/api/v1/item
```

2) Criar item (público) – multipart/form-data com imagem
```
curl -X POST http://localhost:5000/api/v1/item \
  -F "nome_item=Caneca" \
  -F "preco_item=29.9" \
  -F "foto_item=@./storage_export/CanecaP.png"
```

3) Atualizar item (público)
```
curl -X PUT http://localhost:5000/api/v1/item/1 \
  -F "nome_item=Caneca Nova" \
  -F "preco_item=34.9" \
  -F "foto_item=@./storage_export/CanecaP.png"
```

Clientes
1) Criar cliente (público)
```
curl -X POST http://localhost:5000/api/v1/cliente \
  -H "Content-Type: application/json" \
  -d '{
    "nome_cliente":"João",
    "datanascimento_cliente":"1990-01-01",
    "email_cliente":"joao@example.com",
    "senha":"123456"
  }'
```

2) Login (público) – retorna token JWT
```
curl -X POST http://localhost:5000/api/v1/cliente/login \
  -H "Content-Type: application/json" \
  -d '{"Email":"joao@example.com","Senha":"123456"}'
```
Resposta (exemplo): `{ token: "<JWT>", cliente: { id, nome, email } }`

Pedidos (privados – exigem token no header Authorization)
1) Criar pedido para o cliente logado
```
curl -X POST http://localhost:5000/api/v1/pedido \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "itens": [
      { "item_id": 1, "quantidade": 2 },
      { "item_id": 3, "quantidade": 1 }
    ]
  }'
```

2) Listar meus pedidos
```
curl -H "Authorization: Bearer <JWT>" http://localhost:5000/api/v1/pedido/Cliente
```

3) Atualizar meu pedido
```
curl -X PUT http://localhost:5000/api/v1/pedido/Cliente \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "itens": [
      { "item_id": 1, "quantidade": 1 }
    ]
  }'
```

### 4) Seeds e imagens
- Dump do banco: `db/seed.sql`
  - Restaurar:
    ```
    psql -U nicolas -d crud -f db/seed.sql
    ```
- Imagens de exemplo: `storage_export/`
  - Em runtime, uploads ficam na pasta `Storage` do projeto.

### 5) Autenticação (resumo)
- Endpoints públicos: não exigem token
- Login retorna JWT com o id do cliente
- Endpoints com `[Authorize]` exigem `Authorization: Bearer <JWT>`

### 6) Observações importantes
- Configure as variáveis de ambiente necessárias no `appsettings.json`
- As imagens são salvas na pasta `Storage` do projeto

