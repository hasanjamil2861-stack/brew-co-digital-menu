<?php
// =========================================================
// /api/items  (admin)
// =========================================================

$id = $parts[1] ?? null;
$action = $parts[2] ?? null;

// Get one item (used after add / edit / toggle)
function findItem($pdo, $id)
{
    $query = $pdo->prepare('SELECT * FROM items WHERE id = ?');
    $query->execute([$id]);
    $row = $query->fetch();
    return $row ? formatItem($row) : null;
}

// Check the form data (name, price, category are required)
function checkItemForm()
{
    if (trim($_POST['name'] ?? '') === '' || !is_numeric($_POST['price'] ?? '') || $_POST['price'] < 0 || empty($_POST['category'])) {
        sendJson(['message' => 'Name, price and category are required'], 400);
    }
}

// Get all items (not in the trash) with their category
if ($method === 'GET' && !$id) {
    $categories = getCategoriesById($pdo);
    $rows = $pdo->query('SELECT * FROM items WHERE is_deleted = 0 ORDER BY id')->fetchAll();

    $items = [];
    foreach ($rows as $row) {
        $items[] = formatItem($row, $categories);
    }

    sendJson($items);
}

// Add an item (the form is sent with FormData, so we use $_POST and $_FILES)
if ($method === 'POST' && !$id) {
    checkItemForm();
    $image = saveImage() ?? '';

    $query = $pdo->prepare(
        'INSERT INTO items (name, description, price, image, category_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $query->execute([
        trim($_POST['name']),
        $_POST['description'] ?? '',
        $_POST['price'],
        $image,
        $_POST['category'],
        now(),
        now(),
    ]);

    sendJson(findItem($pdo, $pdo->lastInsertId()));
}

// Edit an item
if ($method === 'PUT' && $id) {
    readPutForm(); // fill $_POST and $_FILES (PHP does not do it for PUT)
    checkItemForm();

    $query = $pdo->prepare(
        'UPDATE items SET name = ?, description = ?, price = ?, category_id = ?, updated_at = ? WHERE id = ?'
    );
    $query->execute([
        trim($_POST['name']),
        $_POST['description'] ?? '',
        $_POST['price'],
        $_POST['category'],
        now(),
        $id,
    ]);

    // Change the image only if a new one was chosen
    $image = saveImage();
    if ($image) {
        $pdo->prepare('UPDATE items SET image = ? WHERE id = ?')->execute([$image, $id]);
    }

    sendJson(findItem($pdo, $id));
}

// Activate / deactivate
if ($method === 'PATCH' && $id && $action === 'toggle') {
    $query = $pdo->prepare('UPDATE items SET is_active = 1 - is_active, updated_at = ? WHERE id = ?');
    $query->execute([now(), $id]);

    sendJson(findItem($pdo, $id));
}

// Move an item to the trash
if ($method === 'DELETE' && $id) {
    $query = $pdo->prepare('UPDATE items SET is_deleted = 1, deleted_at = ? WHERE id = ?');
    $query->execute([now(), $id]);

    sendJson(['message' => 'Moved to trash']);
}

sendJson(['message' => 'Not found'], 404);
