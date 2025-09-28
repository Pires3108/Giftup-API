# Script para executar migração no Google Cloud SQL
Write-Host "=== Executando Migração do Banco de Dados ===" -ForegroundColor Green

$PROJECT_ID = "project-4ff72848-5923-4058-b7a"
$INSTANCE_NAME = "giftup-db"
$DATABASE_NAME = "crud"

Write-Host "Projeto: $PROJECT_ID" -ForegroundColor Yellow
Write-Host "Instância: $INSTANCE_NAME" -ForegroundColor Yellow
Write-Host "Banco: $DATABASE_NAME" -ForegroundColor Yellow

# Conectar ao banco e executar a migração
Write-Host "Conectando ao banco de dados..." -ForegroundColor Cyan
gcloud sql connect $INSTANCE_NAME --user=nicolas --database=$DATABASE_NAME --project=$PROJECT_ID

Write-Host "Migração concluída!" -ForegroundColor Green
Write-Host "A coluna 'descricao_item' foi adicionada à tabela 'itens'" -ForegroundColor Yellow
