<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Request.php';

class CategoryController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = (new Database())->connect();
    }

    public function index()
    {
        $onlyActive = isset($_GET['active']) && $_GET['active'] === '1';

        if ($onlyActive) {
            $stmt = $this->db->query("
                SELECT *
                FROM categories
                WHERE active = 1
                ORDER BY id DESC
            ");
        } else {
            $stmt = $this->db->query("
                SELECT *
                FROM categories
                ORDER BY id DESC
            ");
        }

        Response::json($stmt->fetchAll());
    }

    public function show(int $id)
    {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        $category = $stmt->fetch();

        if (!$category) {
            Response::json(['error' => 'Categoria não encontrada'], 404);
        }

        Response::json($category);
    }

    public function store()
    {
        $data = Request::body();

        if (empty($data['name'])) {
            Response::json(['error' => 'Nome é obrigatório'], 422);
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO categories (name, description, active)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([
                $data['name'],
                $data['description'] ?? null,
                isset($data['active']) ? (int) $data['active'] : 1
            ]);

            Response::json(['message' => 'Categoria criada com sucesso'], 201);
        } catch (Throwable $e) {
            Response::json([
                'error' => 'Erro ao criar categoria',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function update(int $id)
    {
        $data = Request::body();

        if (empty($data['name'])) {
            Response::json(['error' => 'Nome é obrigatório'], 422);
        }

        try {
            $stmt = $this->db->prepare("
                UPDATE categories
                SET name = ?, description = ?, active = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $data['name'],
                $data['description'] ?? null,
                isset($data['active']) ? (int) $data['active'] : 1,
                $id
            ]);

            Response::json(['message' => 'Categoria atualizada com sucesso']);
        } catch (Throwable $e) {
            Response::json([
                'error' => 'Erro ao atualizar categoria',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(int $id)
    {
        Response::json([
            'error' => 'Exclusão física de categoria não é permitida. Use ativar/desativar.'
        ], 422);
    }
}