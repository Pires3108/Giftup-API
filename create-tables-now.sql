-- Criar tabelas do banco de dados
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome_cliente VARCHAR(100) NOT NULL,
    datanascimento_cliente DATE NOT NULL,
    email_cliente VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS itens (
    id SERIAL PRIMARY KEY,
    nome_item VARCHAR(100) NOT NULL,
    preco_item DECIMAL(10,2) NOT NULL,
    foto_item VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_pedido VARCHAR(50) DEFAULT 'Pendente',
    total_pedido DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS pedidoitens (
    id SERIAL PRIMARY KEY,
    pedidoid INTEGER NOT NULL,
    itemid INTEGER NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (pedidoid) REFERENCES pedidos(id),
    FOREIGN KEY (itemid) REFERENCES itens(id)
);

-- Inserir dados de exemplo
INSERT INTO itens (nome_item, preco_item, foto_item) VALUES 
('Caneca Personalizada', 25.90, 'CanecaP.png'),
('Porta Retrato', 15.50, 'PortaRetrato_imagem.jpg'),
('Kit Caneta', 12.00, '4a366c08-9f2e-47d4-86ba-8befaf42ab05_KitCanetetaImagem.png')
ON CONFLICT DO NOTHING;