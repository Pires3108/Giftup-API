-- Adicionar coluna descricao_item à tabela itens
ALTER TABLE itens ADD COLUMN IF NOT EXISTS descricao_item TEXT NOT NULL DEFAULT '';

-- Atualizar registros existentes com descrições padrão
UPDATE itens SET descricao_item = 'Caneca personalizada com design exclusivo' WHERE nome_item = 'Caneca Personalizada';
UPDATE itens SET descricao_item = 'Porta retrato elegante para suas memórias' WHERE nome_item = 'Porta Retrato';
UPDATE itens SET descricao_item = 'Kit completo de canetas coloridas' WHERE nome_item = 'Kit Caneta';
