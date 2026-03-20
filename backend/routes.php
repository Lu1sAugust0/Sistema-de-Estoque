<?php

require_once __DIR__ . '/src/helpers/Response.php';
require_once __DIR__ . '/src/controllers/CategoryController.php';
require_once __DIR__ . '/src/controllers/SupplierController.php';
require_once __DIR__ . '/src/controllers/ProductController.php';
require_once __DIR__ . '/src/controllers/StockController.php';
require_once __DIR__ . '/src/controllers/EntryController.php';
require_once __DIR__ . '/src/controllers/DashboardController.php';
require_once __DIR__ . '/src/controllers/AuthController.php';


$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$uri = rtrim($uri, '/');
$uri = $uri === '' ? '/' : $uri;

$categoryController = new CategoryController();
$supplierController = new SupplierController();
$productController = new ProductController();
$stockController = new StockController();
$entryController = new EntryController();
$dashboardController = new DashboardController();
$authController = new AuthController();

if ($uri === '/' && $method === 'GET') {
    Response::json(['message' => 'API do sistema de estoque funcionando']);
}

if ($uri === '/login' && $method === 'POST') {
    $authController->login();
}

if ($uri === '/register' && $method === 'POST') {
    $authController->register();
}

/* Health */
if ($uri === '/health' && $method === 'GET') {
    Response::json(['status' => 'ok']);
}

/* Dashboard */
if ($uri === '/dashboard/summary' && $method === 'GET') {
    $dashboardController->summary();
}

/* Categories */
if ($uri === '/categories' && $method === 'GET') {
    $categoryController->index();
}
if ($uri === '/categories' && $method === 'POST') {
    $categoryController->store();
}
if (preg_match('#^/categories/(\d+)$#', $uri, $matches) && $method === 'GET') {
    $categoryController->show((int) $matches[1]);
}
if (preg_match('#^/categories/(\d+)$#', $uri, $matches) && $method === 'PUT') {
    $categoryController->update((int) $matches[1]);
}
if (preg_match('#^/categories/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
    $categoryController->destroy((int) $matches[1]);
}

/* Suppliers */
if ($uri === '/suppliers' && $method === 'GET') {
    $supplierController->index();
}
if ($uri === '/suppliers' && $method === 'POST') {
    $supplierController->store();
}
if (preg_match('#^/suppliers/(\d+)$#', $uri, $matches) && $method === 'GET') {
    $supplierController->show((int) $matches[1]);
}
if (preg_match('#^/suppliers/(\d+)$#', $uri, $matches) && $method === 'PUT') {
    $supplierController->update((int) $matches[1]);
}
if (preg_match('#^/suppliers/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
    $supplierController->destroy((int) $matches[1]);
}

/* Products */
if ($uri === '/products' && $method === 'GET') {
    $productController->index();
}
if ($uri === '/products' && $method === 'POST') {
    $productController->store();
}
if (preg_match('#^/products/(\d+)$#', $uri, $matches) && $method === 'GET') {
    $productController->show((int) $matches[1]);
}
if (preg_match('#^/products/(\d+)$#', $uri, $matches) && $method === 'PUT') {
    $productController->update((int) $matches[1]);
}
if (preg_match('#^/products/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
    $productController->destroy((int) $matches[1]);
}

/* Stock */
if ($uri === '/stock' && $method === 'GET') {
    $stockController->index();
}
if ($uri === '/stock/low' && $method === 'GET') {
    $stockController->lowStock();
}
if ($uri === '/stock/movements' && $method === 'GET') {
    $stockController->movements();
}
if ($uri === '/stock/exit' && $method === 'POST') {
    $stockController->registerExit();
}

/* Entries */
if ($uri === '/entries' && $method === 'GET') {
    $entryController->index();
}
if ($uri === '/entries' && $method === 'POST') {
    $entryController->store();
}
if (preg_match('#^/entries/(\d+)$#', $uri, $matches) && $method === 'GET') {
    $entryController->show((int) $matches[1]);
}

Response::json(['error' => 'Rota não encontrada'], 404);