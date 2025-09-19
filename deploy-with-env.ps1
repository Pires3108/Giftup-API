# Script completo de deploy com variáveis de ambiente
# Execute este script DEPOIS de alterar a senha no banco

param(
    [Parameter(Mandatory=$true)]
    [string]$DB_PASSWORD
)

Write-Host "🚀 Iniciando deploy com variáveis de ambiente..." -ForegroundColor Yellow

# 1. Build do backend
Write-Host "📦 Fazendo build do backend..." -ForegroundColor Cyan
cd APICRUD
dotnet build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build do backend!" -ForegroundColor Red
    exit 1
}

# 2. Build e push da imagem
Write-Host "🐳 Fazendo build da imagem Docker..." -ForegroundColor Cyan
gcloud builds submit --tag gcr.io/project-4ff72848-5923-4058-b7a/giftup-api
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build da imagem!" -ForegroundColor Red
    exit 1
}

# 3. Deploy com variáveis de ambiente
Write-Host "🚀 Fazendo deploy com variáveis de ambiente..." -ForegroundColor Cyan
gcloud run deploy giftup-api `
    --image gcr.io/project-4ff72848-5923-4058-b7a/giftup-api `
    --region us-central1 `
    --platform managed `
    --allow-unauthenticated `
    --port 8080 `
    --set-env-vars="DB_HOST=34.134.158.190" `
    --set-env-vars="DB_PORT=5432" `
    --set-env-vars="DB_NAME=crud" `
    --set-env-vars="DB_USER=nicolas" `
    --set-env-vars="DB_PASSWORD=Mwn@310826" `
    --set-env-vars="JWT_KEY=Zk4sJf8wQ2uN9rX1vB7pE3aT6mC0yH5dR2oL8uK1nF4xS7tM9vP3qW6zY0bD2hJ" `
    --set-env-vars="JWT_ISSUER=MinhaAPI" `
    --set-env-vars="JWT_AUDIENCE=MinhaAPIUsers" `
    --set-env-vars="JWT_EXPIRES_IN_MINUTES=60"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "🌐 URL: https://giftup-api-12260072068.us-central1.run.app" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erro no deploy!" -ForegroundColor Red
    exit 1
}

cd ..
