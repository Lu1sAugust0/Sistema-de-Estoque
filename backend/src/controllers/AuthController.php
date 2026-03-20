<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../helpers/Response.php';

class AuthController
{
    private PDO $db;

    public function __construct()
    {
        $this->db = (new Database())->connect();
    }

    public function login()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            Response::json(['error' => 'Email e senha obrigatórios'], 400);
        }

        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            Response::json(['error' => 'Credenciais inválidas'], 401);
        }

        unset($user['password_hash']);

        Response::json([
            'message' => 'Login realizado com sucesso',
            'user' => $user
        ]);
    }

    public function register()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $confirmPassword = $data['confirm_password'] ?? '';

        if (!$name || !$email || !$password || !$confirmPassword) {
            Response::json(['error' => 'Todos os campos são obrigatórios'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(['error' => 'Email inválido'], 422);
        }

        if (strlen($password) < 6) {
            Response::json(['error' => 'A senha deve ter pelo menos 6 caracteres'], 422);
        }

        if ($password !== $confirmPassword) {
            Response::json(['error' => 'As senhas não coincidem'], 422);
        }

        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => $email]);
        $existingUser = $stmt->fetch();

        if ($existingUser) {
            Response::json(['error' => 'Já existe um usuário com esse email'], 409);
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $this->db->prepare("
            INSERT INTO users (name, email, password_hash)
            VALUES (:name, :email, :password_hash)
        ");

        $stmt->execute([
            'name' => $name,
            'email' => $email,
            'password_hash' => $passwordHash
        ]);

        $userId = (int) $this->db->lastInsertId();

        Response::json([
            'message' => 'Cadastro realizado com sucesso',
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email
            ]
        ], 201);
    }
}