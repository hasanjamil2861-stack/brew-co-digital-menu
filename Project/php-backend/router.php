<?php
// =========================================================
// ONLY FOR YOUR COMPUTER (not needed on the host)
// The host uses .htaccess. On your computer, run from the "Project" folder:
//   php -S localhost:8000 -t Digital-Menu php-backend/router.php
// =========================================================

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// /api/... => our PHP backend
if (str_starts_with($path, '/api/')) {
    require __DIR__ . '/api/index.php';
    return true;
}

// /uploads/... => the uploaded images
if (str_starts_with($path, '/uploads/')) {
    $file = __DIR__ . '/uploads/' . basename($path);
    if (is_file($file)) {
        header('Content-Type: ' . mime_content_type($file));
        readfile($file);
        return true;
    }
    http_response_code(404);
    return true;
}

// Anything else (HTML, CSS, JS, images) => normal files from Digital-Menu
return false;
