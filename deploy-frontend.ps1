# Script para deploy do frontend no Google Cloud Run
Write-Host "=== Deploy do Frontend no Google Cloud Run ===" -ForegroundColor Green

# Configurar variaveis
$PROJECT_ID = "project-4ff72848-5923-4058-b7a"
$SERVICE_NAME = "giftup-frontend"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host "Projeto: $PROJECT_ID" -ForegroundColor Yellow

# Fazer build local primeiro
Write-Host "Fazendo build local da imagem do frontend..." -ForegroundColor Yellow
docker build -t $SERVICE_NAME ./giftup-frontend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no build local do frontend!" -ForegroundColor Red
    exit 1
}

# Fazer tag para o registry
Write-Host "Fazendo tag da imagem..." -ForegroundColor Yellow
docker tag $SERVICE_NAME $IMAGE_NAME

# Fazer push para o registry
Write-Host "Fazendo push para o registry..." -ForegroundColor Yellow
docker push $IMAGE_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no push!" -ForegroundColor Red
    exit 1
}

# Deploy no Cloud Run
Write-Host "Fazendo deploy do frontend no Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME --image $IMAGE_NAME --platform managed --region $REGION --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1 --max-instances 10

Write-Host "Deploy do frontend concluido!" -ForegroundColor Green
Write-Host "Seu frontend esta disponivel em: https://$SERVICE_NAME-$REGION-$PROJECT_ID.a.run.app" -ForegroundColor Cyan
