<?php
// =========================================================
// /api/menu  -  the customer menu (no login needed)
// Active categories with their active items. Trash is hidden.
// =========================================================

if ($method === 'GET') {
    $categories = $pdo->query('SELECT * FROM categories WHERE is_active = 1 AND is_deleted = 0 ORDER BY id')->fetchAll();
    $items = $pdo->query('SELECT * FROM items WHERE is_active = 1 AND is_deleted = 0 ORDER BY id')->fetchAll();

    $menu = [];

    foreach ($categories as $category) {
        // The items of this category only
        $categoryItems = [];
        foreach ($items as $item) {
            if ($item['category_id'] == $category['id']) {
                $categoryItems[] = formatItem($item);
            }
        }

        $menu[] = [
            'name'  => $category['name'],
            'slug'  => $category['slug'],
            'items' => $categoryItems,
        ];
    }

    sendJson($menu);
}

sendJson(['message' => 'Not found'], 404);
