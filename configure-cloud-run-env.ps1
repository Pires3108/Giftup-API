# Script para configurar variáveis de ambiente no Cloud Run
# Execute este script ANTES do deploy

Write-Host "🔧 Configurando variáveis de ambiente no Cloud Run..." -ForegroundColor Yellow

# Configurar variáveis de ambiente para o serviço giftup-api
gcloud run services update giftup-api `
    --region=us-central1 `
    --set-env-vars="DB_HOST=34.134.158.190" `
    --set-env-vars="DB_PORT=5432" `
    --set-env-vars="DB_NAME=crud" `
    --set-env-vars="DB_USER=nicolas" `
    --set-env-vars="DB_PASSWORD=SUA_NOVA_SENHA_AQUI" `
    --set-env-vars="JWT_KEY=Zk4sJf8wQ2uN9rX1vB7pE3aT6mC0yH5dR2oL8uK1nF4xS7tM9vP3qW6zY0bD2hJ" `
    --set-env-vars="JWT_ISSUER=MinhaAPI" `
    --set-env-vars="JWT_AUDIENCE=MinhaAPIUsers" `
    --set-env-vars="JWT_EXPIRES_IN_MINUTES=60"

Write-Host "✅ Variáveis de ambiente configuradas!" -ForegroundColor Green
Write-Host "⚠️  IMPORTANTE: Altere 'SUA_NOVA_SENHA_AQUI' para a senha real do banco!" -ForegroundColor Red
Write-Host "📝 Depois execute o deploy normalmente" -ForegroundColor Cyan
