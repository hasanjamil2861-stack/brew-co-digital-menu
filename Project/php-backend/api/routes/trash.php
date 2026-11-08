<?php
// =========================================================
// /api/trash  (admin)
// /api/trash                          GET (all) / DELETE (empty)
// /api/trash/categories/5/restore     PATCH
// /api/trash/categories/5             DELETE (forever)
// /api/trash/items/5/restore          PATCH
// /api/trash/items/5                  DELETE (forever)
// =========================================================

$type = $parts[1] ?? null;   // "categories" or "items"
$id = $parts[2] ?? null;
$action = $parts[3] ?? null;

// Only these two tables are allowed (we put $type inside the SQL)
if ($type && !in_array($type, ['categories', 'items'])) {
    sendJson(['message' => 'Not found'], 404);
}

// Get everything in the trash (newest first)
if ($method === 'GET' && !$type) {
    $allCategories = getCategoriesById($pdo);

    $categoryRows = $pdo->query('SELECT * FROM categories WHERE is_deleted = 1 ORDER BY deleted_at DESC')->fetchAll();
    $itemRows = $pdo->query('SELECT * FROM items WHERE is_deleted = 1 ORDER BY deleted_at DESC')->fetchAll();

    $items = [];
    foreach ($itemRows as $row) {
        $items[] = formatItem($row, $allCategories);
    }

    sendJson([
        'categories' => array_map('formatCategory', $categoryRows),
        'items'      => $items,
    ]);
}

// Restore a category or an item
if ($method === 'PATCH' && $id && $action === 'restore') {
    $query = $pdo->prepare("UPDATE $type SET is_deleted = 0, deleted_at = NULL WHERE id = ?");
    $query->execute([$id]);

    sendJson(['message' => 'Restored']);
}

// Delete forever
// (deleting a category also deletes its items: "ON DELETE CASCADE" in database.sql)
if ($method === 'DELETE' && $id) {
    $query = $pdo->prepare("DELETE FROM $type WHERE id = ?");
    $query->execute([$id]);

    sendJson(['message' => 'Deleted forever']);
}

// Empty the trash
if ($method === 'DELETE' && !$type) {
    $pdo->exec('DELETE FROM items WHERE is_deleted = 1');
    $pdo->exec('DELETE FROM categories WHERE is_deleted = 1'); // + their items (CASCADE)

    sendJson(['message' => 'Trash emptied']);
}

sendJson(['message' => 'Not found'], 404);
