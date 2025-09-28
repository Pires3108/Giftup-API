-- Script para adicionar coluna descricao_item
-- Execute este script no Google Cloud SQL

-- Adicionar coluna descricao_item à tabela itens
ALTER TABLE itens ADD COLUMN IF NOT EXISTS descricao_item TEXT NOT NULL DEFAULT '';

-- Atualizar registros existentes com descrições padrão
UPDATE itens SET descricao_item = 'Caneca personalizada com design exclusivo' WHERE nome_item = 'Caneca Personalizada';
UPDATE itens SET descricao_item = 'Porta retrato elegante para suas memórias' WHERE nome_item = 'Porta Retrato';
UPDATE itens SET descricao_item = 'Kit completo de canetas coloridas' WHERE nome_item = 'Kit Caneta';

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'itens' AND column_name = 'descricao_item';
