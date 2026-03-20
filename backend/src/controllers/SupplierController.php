<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Request.php';

class SupplierController
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
                FROM suppliers
                WHERE active = 1
                ORDER BY id DESC
            ");
        } else {
            $stmt = $this->db->query("
                SELECT *
                FROM suppliers
                ORDER BY id DESC
            ");
        }

        Response::json($stmt->fetchAll());
    }

    public function show(int $id)
    {
        $stmt = $this->db->prepare("SELECT * FROM suppliers WHERE id = ?");
        $stmt->execute([$id]);
        $supplier = $stmt->fetch();

        if (!$supplier) {
            Response::json(['error' => 'Fornecedor não encontrado'], 404);
        }

        Response::json($supplier);
    }

    public function store()
    {
        $data = Request::body();

        if (empty($data['name'])) {
            Response::json(['error' => 'Nome é obrigatório'], 422);
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO suppliers (name, cnpj, phone, email, address, active)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['name'],
                $data['cnpj'] ?? null,
                $data['phone'] ?? null,
                $data['email'] ?? null,
                $data['address'] ?? null,
                isset($data['active']) ? (int) $data['active'] : 1
            ]);

            Response::json(['message' => 'Fornecedor criado com sucesso'], 201);
        } catch (Throwable $e) {
            Response::json([
                'error' => 'Erro ao criar fornecedor',
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
                UPDATE suppliers
                SET name = ?, cnpj = ?, phone = ?, email = ?, address = ?, active = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $data['name'],
                $data['cnpj'] ?? null,
                $data['phone'] ?? null,
                $data['email'] ?? null,
                $data['address'] ?? null,
                isset($data['active']) ? (int) $data['active'] : 1,
                $id
            ]);

            Response::json(['message' => 'Fornecedor atualizado com sucesso']);
        } catch (Throwable $e) {
            Response::json([
                'error' => 'Erro ao atualizar fornecedor',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(int $id)
    {
        Response::json([
            'error' => 'Exclusão física de fornecedor não é permitida. Use ativar/desativar.'
        ], 422);
    }
}