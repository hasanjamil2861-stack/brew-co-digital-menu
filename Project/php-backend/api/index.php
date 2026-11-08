<?php
// =========================================================
// ALL THE /api REQUESTS COME HERE (thanks to .htaccess)
// Like server.js: it sends each request to the right route file
// =========================================================

require __DIR__ . '/config.php';
require __DIR__ . '/helpers.php';

// We always answer with JSON
header('Content-Type: application/json; charset=utf-8');

// All the dates are saved in UTC
date_default_timezone_set('UTC');

// If something breaks, answer with a JSON error (not an HTML page)
set_exception_handler(function ($error) {
    error_log($error->getMessage()); // the real error goes to the host error log
    sendJson(['message' => 'Server error'], 500);
});

require __DIR__ . '/db.php';

// The request method: GET, POST, PUT, PATCH, DELETE
$method = $_SERVER['REQUEST_METHOD'];

// Cut the URL into parts:
// "/api/items/5/toggle" => ["items", "5", "toggle"]
$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$parts = explode('/', $path);
$parts = array_slice($parts, array_search('api', $parts) + 1);

$route = $parts[0] ?? '';

// Public routes (no login needed)
if ($route === 'auth') {
    require __DIR__ . '/routes/auth.php';
} elseif ($route === 'menu') {
    require __DIR__ . '/routes/menu.php';
}

// Admin routes (login needed: requireAuth() checks the token first)
elseif ($route === 'categories') {
    requireAuth();
    require __DIR__ . '/routes/categories.php';
} elseif ($route === 'items') {
    requireAuth();
    require __DIR__ . '/routes/items.php';
} elseif ($route === 'trash') {
    requireAuth();
    require __DIR__ . '/routes/trash.php';
} elseif ($route === 'stats') {
    requireAuth();
    require __DIR__ . '/routes/stats.php';
}

// Nothing matched (each route file also ends with this line)
sendJson(['message' => 'Not found'], 404);
