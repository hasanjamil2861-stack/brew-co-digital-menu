<?php
// =========================================================
// /api/stats  -  all the numbers for the dashboard (admin)
// =========================================================

if ($method === 'GET') {
    $allCategories = getCategoriesById($pdo);

    // Categories and items (not in the trash), newest items first
    $categoryRows = $pdo->query('SELECT * FROM categories WHERE is_deleted = 0 ORDER BY id')->fetchAll();
    $itemRows = $pdo->query('SELECT * FROM items WHERE is_deleted = 0 ORDER BY created_at DESC, id DESC')->fetchAll();

    $categories = array_map('formatCategory', $categoryRows);
    $items = [];
    foreach ($itemRows as $row) {
        $items[] = formatItem($row, $allCategories);
    }

    // How many things are in the trash
    $trashCount = $pdo->query('SELECT COUNT(*) FROM categories WHERE is_deleted = 1')->fetchColumn()
                + $pdo->query('SELECT COUNT(*) FROM items WHERE is_deleted = 1')->fetchColumn();

    // Counters
    $activeCategories = 0;
    foreach ($categories as $category) {
        if ($category['isActive']) $activeCategories++;
    }

    $activeItems = 0;
    $visibleItems = 0;
    $itemsWithoutImage = 0;
    $totalPrice = 0;

    foreach ($items as $item) {
        if ($item['isActive']) $activeItems++;
        if (!$item['image']) $itemsWithoutImage++;
        $totalPrice += $item['price'];

        // Items the customer can really see (item active + category active and not in trash)
        $category = $item['category'];
        if ($item['isActive'] && $category && $category['isActive'] && !$category['isDeleted']) {
            $visibleItems++;
        }
    }

    // Sort by price (most expensive first)
    $byPrice = $items;
    usort($byPrice, fn($a, $b) => $b['price'] <=> $a['price']);

    // Number of items in each category (biggest first)
    $perCategory = [];
    foreach ($categories as $category) {
        $count = 0;
        foreach ($items as $item) {
            if ($item['category'] && $item['category']['_id'] === $category['_id']) $count++;
        }

        $perCategory[] = [
            'name'     => $category['name'],
            'isActive' => $category['isActive'],
            'count'    => $count,
        ];
    }
    usort($perCategory, fn($a, $b) => $b['count'] <=> $a['count']);

    // Menu growth: how many items were on the menu at the end of each of the last 90 days
    $growth = [];
    for ($daysAgo = 89; $daysAgo >= 0; $daysAgo--) {
        $day = date('Y-m-d', strtotime("-$daysAgo days"));
        $endOfDay = strtotime("$day 23:59:59");

        $total = 0;
        foreach ($items as $item) {
            if (strtotime($item['createdAt']) <= $endOfDay) $total++;
        }

        $growth[] = ['date' => $day, 'total' => $total];
    }

    $totalItems = count($items);

    sendJson([
        'totalCategories'    => count($categories),
        'activeCategories'   => $activeCategories,
        'inactiveCategories' => count($categories) - $activeCategories,

        'totalItems'        => $totalItems,
        'activeItems'       => $activeItems,
        'inactiveItems'     => $totalItems - $activeItems,
        'visibleItems'      => $visibleItems,
        'itemsWithoutImage' => $itemsWithoutImage,
        'trashCount'        => (int) $trashCount,

        'averagePrice'  => $totalItems ? $totalPrice / $totalItems : 0,
        'mostExpensive' => $byPrice[0] ?? null,
        'cheapest'      => $byPrice[$totalItems - 1] ?? null,

        'perCategory' => $perCategory,
        'latestItems' => array_slice($items, 0, 5),
        'growth'      => $growth,
    ]);
}

sendJson(['message' => 'Not found'], 404);
