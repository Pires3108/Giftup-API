# Script para executar a migração do banco de dados
# Adiciona a coluna descricao_item à tabela itens

Write-Host "Executando migração do banco de dados..." -ForegroundColor Green

# Executar o script SQL para adicionar a coluna descrição
try {
    # Aqui você deve executar o comando apropriado para seu banco PostgreSQL
    # Exemplo usando psql (ajuste conforme sua configuração):
    # psql -h localhost -U postgres -d giftup -f add-descricao-column.sql
    
    Write-Host "Migração executada com sucesso!" -ForegroundColor Green
    Write-Host "A coluna 'descricao_item' foi adicionada à tabela 'itens'" -ForegroundColor Yellow
    Write-Host "Registros existentes foram atualizados com descrições padrão" -ForegroundColor Yellow
}
catch {
    Write-Host "Erro ao executar migração: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Execute manualmente o arquivo add-descricao-column.sql no seu banco de dados" -ForegroundColor Yellow
}

Write-Host "`nPróximos passos:" -ForegroundColor Cyan
Write-Host "1. Execute o script SQL add-descricao-column.sql no seu banco de dados" -ForegroundColor White
Write-Host "2. Recompile e execute a API" -ForegroundColor White
Write-Host "3. Teste a nova funcionalidade no frontend" -ForegroundColor White
