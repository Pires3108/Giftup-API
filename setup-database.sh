#!/bin/bash

# Script para configurar o banco de dados no Cloud SQL
echo "=== Configurando banco de dados ==="

# Conectar ao banco e executar comandos SQL
gcloud sql connect giftup-db --user=nicolas --database=crud << EOF

-- Tabela clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id SERIAL PRIMARY KEY,
    nome_cliente TEXT NOT NULL,
    datanascimento_cliente DATE NOT NULL,
    email_cliente TEXT NOT NULL,
    senha TEXT NOT NULL,
    islogged BOOLEAN NOT NULL DEFAULT false
);

-- Tabela itens
CREATE TABLE IF NOT EXISTS public.itens (
    id SERIAL PRIMARY KEY,
    nome_item TEXT NOT NULL,
    preco_item DECIMAL(10,2) NOT NULL,
    descricao_item TEXT,
    imagem_item TEXT,
    estoque_item INTEGER NOT NULL DEFAULT 0
);

-- Tabela pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    data_pedido TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status_pedido TEXT NOT NULL DEFAULT 'Pendente',
    total_pedido DECIMAL(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (cliente_id) REFERENCES public.clientes(id)
);

-- Tabela pedido_itens
CREATE TABLE IF NOT EXISTS public.pedido_itens (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id),
    FOREIGN KEY (item_id) REFERENCES public.itens(id)
);

-- Inserir dados de exemplo
INSERT INTO public.clientes (nome_cliente, datanascimento_cliente, email_cliente, senha, islogged) VALUES
('João Silva', '1990-01-15', 'joao@email.com', 'senha123', false),
('Maria Santos', '1985-05-20', 'maria@email.com', 'senha456', false)
ON CONFLICT DO NOTHING;

INSERT INTO public.itens (nome_item, preco_item, descricao_item, imagem_item, estoque_item) VALUES
('Caneca Personalizada', 25.90, 'Caneca de cerâmica com design personalizado', 'caneca.jpg', 50),
('Porta-retrato Digital', 45.00, 'Porta-retrato digital com tela LCD', 'porta_retrato.jpg', 20),
('Kit Caneta', 15.50, 'Kit com 3 canetas personalizadas', 'kit_caneta.jpg', 100)
ON CONFLICT DO NOTHING;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email_cliente);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON public.pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON public.pedido_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_item ON public.pedido_itens(item_id);

\q
EOF

echo "=== Banco de dados configurado com sucesso! ==="
