<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Request.php';

class EntryController
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
                pe.*,
                s.name AS supplier_name,
                u.name AS user_name
            FROM purchase_entries pe
            INNER JOIN suppliers s ON s.id = pe.supplier_id
            INNER JOIN users u ON u.id = pe.user_id
            ORDER BY pe.id DESC
        ");

        Response::json($stmt->fetchAll());
    }

    public function show(int $id)
    {
        $stmt = $this->db->prepare("
            SELECT
                pe.*,
                s.name AS supplier_name,
                u.name AS user_name
            FROM purchase_entries pe
            INNER JOIN suppliers s ON s.id = pe.supplier_id
            INNER JOIN users u ON u.id = pe.user_id
            WHERE pe.id = ?
        ");
        $stmt->execute([$id]);
        $entry = $stmt->fetch();

        if (!$entry) {
            Response::json(['error' => 'Entrada não encontrada'], 404);
        }

        $stmtItems = $this->db->prepare("
            SELECT
                pei.*,
                p.name AS product_name,
                p.sku
            FROM purchase_entry_items pei
            INNER JOIN products p ON p.id = pei.product_id
            WHERE pei.purchase_entry_id = ?
        ");
        $stmtItems->execute([$id]);
        $entry['items'] = $stmtItems->fetchAll();

        Response::json($entry);
    }

    public function store()
    {
        $data = Request::body();

        if (empty($data['supplier_id']) || empty($data['user_id']) || empty($data['items'])) {
            Response::json(['error' => 'supplier_id, user_id e items são obrigatórios'], 422);
        }

        if (!is_array($data['items']) || count($data['items']) === 0) {
            Response::json(['error' => 'A entrada deve ter pelo menos 1 item'], 422);
        }

        try {
            $this->db->beginTransaction();

            $totalValue = 0;
            foreach ($data['items'] as $item) {
                $qty = (int) ($item['quantity'] ?? 0);
                $price = (float) ($item['unit_price'] ?? 0);

                if ($qty <= 0 || $price < 0) {
                    $this->db->rollBack();
                    Response::json(['error' => 'Itens inválidos na entrada'], 422);
                }

                $totalValue += ($qty * $price);
            }

            $stmtEntry = $this->db->prepare("
                INSERT INTO purchase_entries (supplier_id, entry_date, total_value, notes, user_id)
                VALUES (?, NOW(), ?, ?, ?)
            ");
            $stmtEntry->execute([
                $data['supplier_id'],
                $totalValue,
                $data['notes'] ?? null,
                $data['user_id']
            ]);

            $entryId = (int) $this->db->lastInsertId();

            foreach ($data['items'] as $item) {
                $productId = (int) $item['product_id'];
                $quantity = (int) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];

                $stmtItem = $this->db->prepare("
                    INSERT INTO purchase_entry_items (purchase_entry_id, product_id, quantity, unit_price)
                    VALUES (?, ?, ?, ?)
                ");
                $stmtItem->execute([$entryId, $productId, $quantity, $unitPrice]);

                $entryItemId = (int) $this->db->lastInsertId();

                $stmtUpdateStock = $this->db->prepare("
                    UPDATE stock
                    SET current_quantity = current_quantity + ?
                    WHERE product_id = ?
                ");
                $stmtUpdateStock->execute([$quantity, $productId]);

                $stmtMovement = $this->db->prepare("
                    INSERT INTO stock_movements
                    (product_id, movement_type, quantity, movement_date, observation, user_id, purchase_entry_item_id)
                    VALUES (?, 'ENTRY', ?, NOW(), ?, ?, ?)
                ");
                $stmtMovement->execute([
                    $productId,
                    $quantity,
                    $data['notes'] ?? 'Entrada via compra',
                    $data['user_id'],
                    $entryItemId
                ]);
            }

            $this->db->commit();

            Response::json([
                'message' => 'Entrada registrada com sucesso',
                'entry_id' => $entryId,
                'total_value' => $totalValue
            ], 201);
        } catch (Throwable $e) {
            $this->db->rollBack();
            Response::json(['error' => 'Erro ao registrar entrada', 'details' => $e->getMessage()], 500);
        }
    }
}