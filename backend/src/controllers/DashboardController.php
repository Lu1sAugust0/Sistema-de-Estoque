<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';

class DashboardController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = (new Database())->connect();
    }

    public function summary()
    {
        $totalProducts = $this->db->query("
            SELECT COUNT(*) AS total
            FROM products
        ")->fetch()['total'];

        $activeProducts = $this->db->query("
            SELECT COUNT(*) AS total
            FROM products
            WHERE active = 1
        ")->fetch()['total'];

        $lowStockProducts = $this->db->query("
            SELECT COUNT(*) AS total
            FROM stock st
            INNER JOIN products p ON p.id = st.product_id
            WHERE p.active = 1
              AND st.current_quantity <= p.minimum_stock
        ")->fetch()['total'];

        $totalEntries = $this->db->query("
            SELECT COUNT(*) AS total
            FROM stock_movements
            WHERE movement_type = 'ENTRY'
        ")->fetch()['total'];

        $totalExits = $this->db->query("
            SELECT COUNT(*) AS total
            FROM stock_movements
            WHERE movement_type = 'EXIT'
        ")->fetch()['total'];

        $lastMovements = $this->db->query("
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
            LIMIT 5
        ")->fetchAll();

        $topEntryProducts = $this->db->query("
            SELECT
                p.id,
                p.name,
                p.sku,
                SUM(sm.quantity) AS total_entry
            FROM stock_movements sm
            INNER JOIN products p ON p.id = sm.product_id
            WHERE sm.movement_type = 'ENTRY'
            GROUP BY p.id, p.name, p.sku
            ORDER BY total_entry DESC
            LIMIT 5
        ")->fetchAll();

        $lowStockList = $this->db->query("
            SELECT
                p.id,
                p.name,
                p.sku,
                p.minimum_stock,
                st.current_quantity
            FROM stock st
            INNER JOIN products p ON p.id = st.product_id
            WHERE p.active = 1
              AND st.current_quantity <= p.minimum_stock
            ORDER BY st.current_quantity ASC, p.name ASC
            LIMIT 5
        ")->fetchAll();

        Response::json([
            'totals' => [
                'products' => (int) $totalProducts,
                'active_products' => (int) $activeProducts,
                'low_stock_products' => (int) $lowStockProducts,
                'entries' => (int) $totalEntries,
                'exits' => (int) $totalExits,
            ],
            'last_movements' => $lastMovements,
            'top_entry_products' => $topEntryProducts,
            'low_stock_list' => $lowStockList,
        ]);
    }
}