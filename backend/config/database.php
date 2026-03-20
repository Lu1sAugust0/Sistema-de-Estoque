<?php

class Database
{
    private string $host = '127.0.0.1';
    private string $dbname = 'sistema_estoque';
    private string $username = 'root';
    private string $password = '';
    private string $port = '3306';

    public function connect(): PDO
    {
        $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->dbname};charset=utf8mb4";

        $pdo = new PDO($dsn, $this->username, $this->password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        return $pdo;
    }
}