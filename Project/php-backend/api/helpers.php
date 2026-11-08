<?php
// =========================================================
// SMALL FUNCTIONS USED BY ALL THE ROUTES
// =========================================================

// Send JSON to the browser and stop (like res.status(...).json(...))
function sendJson($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Read the JSON sent by fetch (like req.body)
function getJsonBody()
{
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// The date of now, in the MySQL format: 2026-11-08 20:30:00
function now()
{
    return date('Y-m-d H:i:s');
}

// Change a MySQL date to the format JavaScript reads: 2026-11-08T20:30:00+00:00
function isoDate($date)
{
    return $date ? date('c', strtotime($date)) : null;
}

// "Hot Drinks" => "hot-drinks"
function makeSlug($name)
{
    return strtolower(str_replace(' ', '-', $name));
}

// =========================================================
// TURN DATABASE ROWS INTO THE SAME JSON AS THE NODE VERSION
// (the frontend uses _id, isActive, createdAt...)
// =========================================================

function formatCategory($row)
{
    return [
        '_id'       => (int) $row['id'],
        'name'      => $row['name'],
        'slug'      => $row['slug'],
        'isActive'  => (bool) $row['is_active'],
        'isDeleted' => (bool) $row['is_deleted'],
        'deletedAt' => isoDate($row['deleted_at']),
        'createdAt' => isoDate($row['created_at']),
        'updatedAt' => isoDate($row['updated_at']),
    ];
}

// $categories (optional): all categories by id.
// If we give it, the full category is put inside the item (like .populate('category'))
function formatItem($row, $categories = null)
{
    $category = (int) $row['category_id'];

    if ($categories !== null) {
        $category = $categories[$category] ?? null;
    }

    return [
        '_id'         => (int) $row['id'],
        'name'        => $row['name'],
        'description' => $row['description'],
        'price'       => (float) $row['price'],
        'image'       => $row['image'],
        'category'    => $category,
        'isActive'    => (bool) $row['is_active'],
        'isDeleted'   => (bool) $row['is_deleted'],
        'deletedAt'   => isoDate($row['deleted_at']),
        'createdAt'   => isoDate($row['created_at']),
        'updatedAt'   => isoDate($row['updated_at']),
    ];
}

// All categories (even the deleted ones), with their id as key: [3 => [...], 5 => [...]]
function getCategoriesById($pdo)
{
    $list = [];
    $rows = $pdo->query('SELECT * FROM categories')->fetchAll();

    foreach ($rows as $row) {
        $list[$row['id']] = formatCategory($row);
    }

    return $list;
}

// =========================================================
// LOGIN TOKENS (JWT) - same idea as the "jsonwebtoken" package
// A token = header.payload.signature
// =========================================================

function base64UrlEncode($text)
{
    return rtrim(strtr(base64_encode($text), '+/', '-_'), '=');
}

function base64UrlDecode($text)
{
    return base64_decode(strtr($text, '-_', '+/'));
}

// Create a token for a user (valid for 1 day)
function createToken($user)
{
    $header = base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));

    $payload = base64UrlEncode(json_encode([
        'id'       => (int) $user['id'],
        'username' => $user['username'],
        'exp'      => time() + 24 * 60 * 60, // expires after 1 day
    ]));

    // The signature proves that the token was made by our server
    $signature = base64UrlEncode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));

    return "$header.$payload.$signature";
}

// Check a token: returns the user inside it, or null if fake / expired
function readToken($token)
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    [$header, $payload, $signature] = $parts;

    // Make the signature again and compare
    $correct = base64UrlEncode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    if (!hash_equals($correct, $signature)) {
        return null;
    }

    $data = json_decode(base64UrlDecode($payload), true);
    if (!$data || $data['exp'] < time()) {
        return null;
    }

    return $data;
}

// Stop the request if the user is not logged in (like middleware/auth.js)
function requireAuth()
{
    // The token comes in the header: "Authorization: Bearer <token>"
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

    // Some servers hide it from $_SERVER
    if (!$header && function_exists('getallheaders')) {
        $headers = array_change_key_case(getallheaders());
        $header = $headers['authorization'] ?? '';
    }

    if (!str_starts_with($header, 'Bearer ')) {
        sendJson(['message' => 'Please log in first'], 401);
    }

    $user = readToken(substr($header, 7));
    if (!$user) {
        sendJson(['message' => 'Your session has expired, please log in again'], 401);
    }

    return $user;
}

// =========================================================
// FORMS WITH IMAGES (FormData)
// =========================================================

// PHP fills $_POST and $_FILES by itself only for POST requests.
// For PUT (edit item) we read the form ourselves.
function readPutForm()
{
    // PHP 8.4+ has a ready function for this
    if (function_exists('request_parse_body')) {
        [$_POST, $_FILES] = request_parse_body();
        return;
    }

    // Older PHP: cut the body into parts using the "boundary"
    preg_match('/boundary=(.*)$/', $_SERVER['CONTENT_TYPE'] ?? '', $match);
    if (!$match) {
        return;
    }

    $boundary = trim($match[1], '"');
    $parts = explode('--' . $boundary, file_get_contents('php://input'));

    foreach ($parts as $part) {
        // Each part = headers + empty line + value
        if (!str_contains($part, "\r\n\r\n")) {
            continue;
        }

        [$headers, $value] = explode("\r\n\r\n", $part, 2);
        $value = substr($value, 0, -2); // remove the "\r\n" at the end

        preg_match('/; name="([^"]*)"/', $headers, $name);
        preg_match('/; filename="([^"]*)"/', $headers, $file);

        if (!$name) {
            continue;
        }

        if ($file) {
            // A file: save it in a temporary file, like PHP does for POST
            if ($file[1] === '') {
                continue; // no file was chosen
            }

            $tmp = tempnam(sys_get_temp_dir(), 'upload');
            file_put_contents($tmp, $value);

            $_FILES[$name[1]] = [
                'name'     => $file[1],
                'tmp_name' => $tmp,
                'error'    => UPLOAD_ERR_OK,
                'size'     => strlen($value),
            ];
        } else {
            // A normal input
            $_POST[$name[1]] = $value;
        }
    }
}

// Save the uploaded image in the "uploads" folder (like multer)
// Returns the image path ("/uploads/...") or null if there is no image
function saveImage()
{
    $file = $_FILES['image'] ?? null;

    if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    // Accept images only (never .php files!)
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
        return null;
    }

    // Name like "1793807414696-latte.jpg" (time in ms + clean name)
    $cleanName = preg_replace('/[^A-Za-z0-9._-]/', '-', basename($file['name']));
    $fileName = round(microtime(true) * 1000) . '-' . $cleanName;
    $target = __DIR__ . '/../uploads/' . $fileName;

    if (is_uploaded_file($file['tmp_name'])) {
        move_uploaded_file($file['tmp_name'], $target); // POST
    } else {
        rename($file['tmp_name'], $target); // PUT (our temporary file)
    }

    return '/uploads/' . $fileName;
}
