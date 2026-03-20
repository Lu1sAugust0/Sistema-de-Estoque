USE sistema_estoque;

INSERT INTO users (name, email, password_hash)
VALUES
('Administrador', 'admin@estoque.com', '$2y$10$abcdefghijklmnopqrstuv123456789012345678901234567890');

INSERT INTO categories (name, description)
VALUES
('Eletrônicos', 'Produtos eletrônicos em geral'),
('Bebidas', 'Bebidas diversas'),
('Peças', 'Peças e componentes');

INSERT INTO suppliers (name, cnpj, phone, email, address)
VALUES
('Fornecedor Alpha', '12.345.678/0001-99', '21999999999', 'contato@alpha.com', 'Rua A, 100'),
('Fornecedor Beta', '98.765.432/0001-11', '21988888888', 'vendas@beta.com', 'Rua B, 200');

INSERT INTO products (name, sku, barcode, description, cost_price, sale_price, minimum_stock, category_id, supplier_id)
VALUES
('Teclado USB', 'SKU-0001', '789000000001', 'Teclado padrão USB', 50.00, 89.90, 5, 1, 1),
('Mouse Óptico', 'SKU-0002', '789000000002', 'Mouse USB óptico', 25.00, 49.90, 10, 1, 1),
('Cabo HDMI', 'SKU-0003', '789000000003', 'Cabo HDMI 2 metros', 15.00, 29.90, 8, 3, 2);

INSERT INTO stock (product_id, current_quantity)
VALUES
(1, 20),
(2, 35),
(3, 12);

USE sistema_estoque;

SELECT * FROM stock;
SELECT * FROM stock_movements ORDER BY id DESC;
SELECT * FROM purchase_entries ORDER BY id DESC;
SELECT * FROM purchase_entry_items ORDER BY id DESC;

USE sistema_estoque;

SELECT * FROM stock;
SELECT * FROM stock_movements ORDER BY id DESC;


USE sistema_estoque;

ALTER TABLE suppliers
ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1;

USE sistema_estoque;
DESCRIBE suppliers;

ALTER TABLE suppliers
ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1;

USE sistema_estoque;

ALTER TABLE categories
ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1;
DESCRIBE categories;

ALTER TABLE users
ADD COLUMN password VARCHAR(255) NOT NULL;

UPDATE users
SET
  name = 'Luis Augusto',
  password = '$2y$10$wH2r4XcP5Qq8z6zP0dZQ.uZ1wYb1z4dC0JrXzF8h2Pz4dP1Vx6G9e'
WHERE email = 'admin@estoque.com';

DESCRIBE users;
ALTER TABLE users DROP COLUMN password;

SELECT id, name, email, password_hash
FROM users
WHERE email = 'admin@estoque.com';

Select * FROM users;