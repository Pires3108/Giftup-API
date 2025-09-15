# Script para configurar o banco de dados remoto
$PROJECT_ID = "project-4ff72848-5923-4058-b7a"
$INSTANCE_NAME = "giftup-db"
$DATABASE_NAME = "giftup"
$USER_NAME = "postgres"
$PASSWORD = "postgres123"

Write-Host "=== Configurando Banco de Dados Remoto ==="

# Obter o IP do banco
$IP_ADDRESS = gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format="value(ipAddresses[0].ipAddress)"
Write-Host "IP do banco: $IP_ADDRESS"

# Criar o banco de dados se não existir
Write-Host "Criando banco de dados se não existir..."
gcloud sql databases create $DATABASE_NAME --instance=$INSTANCE_NAME --project=$PROJECT_ID 2>$null

# Usar o Cloud SQL Proxy para executar o SQL
Write-Host "Iniciando Cloud SQL Proxy..."
$PROXY_PID = Start-Process -FilePath "gcloud" -ArgumentList "sql", "connect", $INSTANCE_NAME, "--user=$USER_NAME", "--project=$PROJECT_ID" -PassThru -NoNewWindow

# Aguardar um pouco para o proxy conectar
Start-Sleep -Seconds 5

# Executar o script SQL usando psql se disponível
Write-Host "Executando script SQL..."
$SQL_FILE = "create-tables-simple.sql"
if (Test-Path $SQL_FILE) {
    Write-Host "Arquivo SQL encontrado: $SQL_FILE"
    # Tentar executar com psql se disponível
    try {
        $env:PGPASSWORD = $PASSWORD
        psql -h $IP_ADDRESS -p 5432 -U $USER_NAME -d $DATABASE_NAME -f $SQL_FILE
    } catch {
        Write-Host "psql não disponível. Tentando outra abordagem..."
        # Usar o Cloud SQL Admin API
        gcloud sql import sql $INSTANCE_NAME $SQL_FILE --database=$DATABASE_NAME --project=$PROJECT_ID
    }
} else {
    Write-Host "Arquivo SQL não encontrado: $SQL_FILE"
}

Write-Host "Configuração do banco concluída!"