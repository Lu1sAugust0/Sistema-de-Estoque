<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Request.php';

class ProductController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = (new Database())->connect();
    }

    public function index()
    {
        $sql = "
            SELECT
                p.*,
                c.name AS category_name,
                s.name AS supplier_name,
                st.current_quantity
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id
            LEFT JOIN suppliers s ON s.id = p.supplier_id
            LEFT JOIN stock st ON st.product_id = p.id
            ORDER BY p.id DESC
        ";

        $stmt = $this->db->query($sql);
        Response::json($stmt->fetchAll());
    }

    public function show(int $id)
    {
        $stmt = $this->db->prepare("
            SELECT
                p.*,
                c.name AS category_name,
                s.name AS supplier_name,
                st.current_quantity
            FROM products p
            INNER JOIN categories c ON c.id = p.category_id
            LEFT JOIN suppliers s ON s.id = p.supplier_id
            LEFT JOIN stock st ON st.product_id = p.id
            WHERE p.id = ?
        ");
        $stmt->execute([$id]);
        $product = $stmt->fetch();

        if (!$product) {
            Response::json(['error' => 'Produto não encontrado'], 404);
        }

        Response::json($product);
    }

    public function store()
    {
        $data = Request::body();

        $requiredFields = ['name', 'sku', 'cost_price', 'sale_price', 'minimum_stock', 'category_id'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                Response::json(['error' => "Campo obrigatório: {$field}"], 422);
            }
        }

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                INSERT INTO products
                (name, sku, barcode, description, cost_price, sale_price, minimum_stock, category_id, supplier_id, active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['name'],
                $data['sku'],
                $data['barcode'] ?? null,
                $data['description'] ?? null,
                $data['cost_price'],
                $data['sale_price'],
                $data['minimum_stock'],
                $data['category_id'],
                $data['supplier_id'] ?? null,
                $data['active'] ?? 1
            ]);

            $productId = (int) $this->db->lastInsertId();

            $stmtStock = $this->db->prepare("
                INSERT INTO stock (product_id, current_quantity)
                VALUES (?, 0)
            ");
            $stmtStock->execute([$productId]);

            $this->db->commit();

            Response::json(['message' => 'Produto criado com sucesso', 'id' => $productId], 201);
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            Response::json([
                'error' => 'Erro ao criar produto',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function update(int $id)
    {
        $data = Request::body();

        if (empty($data['name']) || empty($data['sku']) || !isset($data['category_id'])) {
            Response::json(['error' => 'Nome, SKU e categoria são obrigatórios'], 422);
        }

        try {
            $stmt = $this->db->prepare("
                UPDATE products
                SET name = ?, sku = ?, barcode = ?, description = ?, cost_price = ?, sale_price = ?,
                    minimum_stock = ?, category_id = ?, supplier_id = ?, active = ?
                WHERE id = ?
            ");

            $stmt->execute([
                $data['name'],
                $data['sku'],
                $data['barcode'] ?? null,
                $data['description'] ?? null,
                $data['cost_price'] ?? 0,
                $data['sale_price'] ?? 0,
                $data['minimum_stock'] ?? 0,
                $data['category_id'],
                $data['supplier_id'] ?? null,
                $data['active'] ?? 1,
                $id
            ]);

            Response::json(['message' => 'Produto atualizado com sucesso']);
        } catch (Throwable $e) {
            Response::json([
                'error' => 'Erro ao atualizar produto',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->db->beginTransaction();

            $stmtCheckMovement = $this->db->prepare("
                SELECT COUNT(*) AS total
                FROM stock_movements
                WHERE product_id = ?
            ");
            $stmtCheckMovement->execute([$id]);
            $hasMovement = (int) $stmtCheckMovement->fetch()['total'] > 0;

            if ($hasMovement) {
                if ($this->db->inTransaction()) {
                    $this->db->rollBack();
                }

                Response::json([
                    'error' => 'Este produto já possui movimentações e não pode ser excluído. Deixe-o inativo.'
                ], 422);
            }

            $stmtDeleteStock = $this->db->prepare("DELETE FROM stock WHERE product_id = ?");
            $stmtDeleteStock->execute([$id]);

            $stmtDeleteProduct = $this->db->prepare("DELETE FROM products WHERE id = ?");
            $stmtDeleteProduct->execute([$id]);

            $this->db->commit();

            Response::json(['message' => 'Produto removido com sucesso']);
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            Response::json([
                'error' => 'Erro ao remover produto',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}