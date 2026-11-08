<?php
// =========================================================
// /api/categories  (admin)
// =========================================================

$id = $parts[1] ?? null;
$action = $parts[2] ?? null;

// Get one category (used after add / edit / toggle)
function findCategory($pdo, $id)
{
    $query = $pdo->prepare('SELECT * FROM categories WHERE id = ?');
    $query->execute([$id]);
    $row = $query->fetch();
    return $row ? formatCategory($row) : null;
}

// Get all categories (not in the trash)
if ($method === 'GET' && !$id) {
    $rows = $pdo->query('SELECT * FROM categories WHERE is_deleted = 0 ORDER BY id')->fetchAll();
    sendJson(array_map('formatCategory', $rows));
}

// Add a category
if ($method === 'POST' && !$id) {
    $name = trim(getJsonBody()['name'] ?? '');
    if ($name === '') {
        sendJson(['message' => 'Name is required'], 400);
    }

    $query = $pdo->prepare('INSERT INTO categories (name, slug, created_at, updated_at) VALUES (?, ?, ?, ?)');
    $query->execute([$name, makeSlug($name), now(), now()]);

    sendJson(findCategory($pdo, $pdo->lastInsertId()));
}

// Edit a category
if ($method === 'PUT' && $id) {
    $name = trim(getJsonBody()['name'] ?? '');
    if ($name === '') {
        sendJson(['message' => 'Name is required'], 400);
    }

    $query = $pdo->prepare('UPDATE categories SET name = ?, slug = ?, updated_at = ? WHERE id = ?');
    $query->execute([$name, makeSlug($name), now(), $id]);

    sendJson(findCategory($pdo, $id));
}

// Activate / deactivate (1 becomes 0, 0 becomes 1)
if ($method === 'PATCH' && $id && $action === 'toggle') {
    $query = $pdo->prepare('UPDATE categories SET is_active = 1 - is_active, updated_at = ? WHERE id = ?');
    $query->execute([now(), $id]);

    sendJson(findCategory($pdo, $id));
}

// Move a category to the trash
if ($method === 'DELETE' && $id) {
    $query = $pdo->prepare('UPDATE categories SET is_deleted = 1, deleted_at = ? WHERE id = ?');
    $query->execute([now(), $id]);

    sendJson(['message' => 'Moved to trash']);
}

sendJson(['message' => 'Not found'], 404);
