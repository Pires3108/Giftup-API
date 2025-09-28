Write-Host "=== Deploy Simplificado no Cloud Run ===" -ForegroundColor Green

$PROJECT_ID = "project-4ff72848-5923-4058-b7a"
$SERVICE_NAME = "giftup-api"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

Write-Host "Projeto: $PROJECT_ID" -ForegroundColor Yellow

Write-Host "Fazendo build local da imagem..." -ForegroundColor Yellow
docker build -f ./APICRUD/Dockerfile.clean -t $SERVICE_NAME ./APICRUD

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no build local!" -ForegroundColor Red
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
Write-Host "Fazendo deploy no Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $SERVICE_NAME --image $IMAGE_NAME --platform managed --region $REGION --allow-unauthenticated --port 8080 --memory 512Mi --cpu 1 --max-instances 10 --set-env-vars "ASPNETCORE_ENVIRONMENT=Production"

Write-Host "Deploy concluido!" -ForegroundColor Green
Write-Host "Sua API esta disponivel em: https://$SERVICE_NAME-$REGION-$PROJECT_ID.a.run.app" -ForegroundColor Cyan
