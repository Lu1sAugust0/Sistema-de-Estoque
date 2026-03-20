<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Request.php';

class StockController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = (new Database())->connect();
    }

    public function index()
    {
        $stmt = $this->db->query("
            SELECT
                p.id AS product_id,
                p.name,
                p.sku,
                p.minimum_stock,
                st.current_quantity,
                CASE
                    WHEN st.current_quantity <= p.minimum_stock THEN 'LOW'
                    ELSE 'NORMAL'
                END AS stock_status
            FROM stock st
            INNER JOIN products p ON p.id = st.product_id
            ORDER BY p.name ASC
        ");

        Response::json($stmt->fetchAll());
    }

    public function lowStock()
    {
        $stmt = $this->db->query("
            SELECT
                p.id AS product_id,
                p.name,
                p.sku,
                p.minimum_stock,
                st.current_quantity
            FROM stock st
            INNER JOIN products p ON p.id = st.product_id
            WHERE st.current_quantity <= p.minimum_stock
            ORDER BY st.current_quantity ASC
        ");

        Response::json($stmt->fetchAll());
    }

    public function movements()
    {
        $stmt = $this->db->query("
            SELECT
                sm.id,
                sm.movement_type,
                sm.quantity,
                sm.movement_date,
                sm.observation,
                p.name AS product_name,
                u.name AS user_name
            FROM stock_movements sm
            INNER JOIN products p ON p.id = sm.product_id
            INNER JOIN users u ON u.id = sm.user_id
            ORDER BY sm.id DESC
        ");

        Response::json($stmt->fetchAll());
    }

    public function registerExit()
    {
        $data = Request::body();

        $requiredFields = ['product_id', 'quantity', 'user_id'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                Response::json(['error' => "Campo obrigatório: {$field}"], 422);
            }
        }

        $productId = (int) $data['product_id'];
        $quantity = (int) $data['quantity'];
        $userId = (int) $data['user_id'];
        $observation = $data['observation'] ?? null;

        if ($quantity <= 0) {
            Response::json(['error' => 'Quantidade deve ser maior que zero'], 422);
        }

        try {
            $this->db->beginTransaction();

            $stmtStock = $this->db->prepare("SELECT current_quantity FROM stock WHERE product_id = ? FOR UPDATE");
            $stmtStock->execute([$productId]);
            $stock = $stmtStock->fetch();

            if (!$stock) {
                $this->db->rollBack();
                Response::json(['error' => 'Estoque do produto não encontrado'], 404);
            }

            if ((int) $stock['current_quantity'] < $quantity) {
                $this->db->rollBack();
                Response::json(['error' => 'Estoque insuficiente'], 422);
            }

            $stmtUpdate = $this->db->prepare("
                UPDATE stock
                SET current_quantity = current_quantity - ?
                WHERE product_id = ?
            ");
            $stmtUpdate->execute([$quantity, $productId]);

            $stmtMovement = $this->db->prepare("
                INSERT INTO stock_movements
                (product_id, movement_type, quantity, observation, user_id)
                VALUES (?, 'EXIT', ?, ?, ?)
            ");
            $stmtMovement->execute([$productId, $quantity, $observation, $userId]);

            $this->db->commit();

            Response::json(['message' => 'Saída registrada com sucesso']);
        } catch (Throwable $e) {
            $this->db->rollBack();
            Response::json(['error' => 'Erro ao registrar saída', 'details' => $e->getMessage()], 500);
        }
    }
}