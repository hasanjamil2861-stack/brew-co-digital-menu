<?php
// =========================================================
// /api/auth  -  register, login, me
// =========================================================

$action = $parts[1] ?? '';

// Simple email check: something@something.something
$emailPattern = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';

// What we send back about a user (never the password)
function publicUser($user)
{
    return ['id' => (int) $user['id'], 'username' => $user['username'], 'email' => $user['email']];
}

// Protection against guessing passwords:
// after 5 wrong logins from the same IP, wait 15 minutes
$MAX_TRIES = 5;
$BLOCK_TIME = 15 * 60; // seconds

// ---------------------------------------------------------
// REGISTER: create a new admin account
// ---------------------------------------------------------
if ($method === 'POST' && $action === 'register') {
    // Registration can be closed from config.php
    if (!ALLOW_REGISTER) {
        sendJson(['message' => 'Creating new accounts is closed'], 403);
    }

    $body = getJsonBody();
    $username = strtolower(trim($body['username'] ?? ''));
    $email = strtolower(trim($body['email'] ?? ''));
    $password = $body['password'] ?? '';

    // Check the data (the browser checks too, but the server must check again)
    if (strlen($username) < 3) {
        sendJson(['message' => 'Username must have at least 3 characters'], 400);
    }
    if (!preg_match($emailPattern, $email)) {
        sendJson(['message' => 'Please enter a valid email'], 400);
    }
    if (strlen($password) < 8) {
        sendJson(['message' => 'Password must have at least 8 characters'], 400);
    }

    // Username and email must be unique
    $query = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
    $query->execute([$username, $email]);
    if ($query->fetch()) {
        sendJson(['message' => 'This username or email is already used'], 409);
    }

    // Encrypt the password (bcrypt, like bcryptjs)
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $query = $pdo->prepare('INSERT INTO users (username, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
    $query->execute([$username, $email, $hashedPassword, now(), now()]);

    $user = ['id' => $pdo->lastInsertId(), 'username' => $username, 'email' => $email];

    // Logged in directly after creating the account
    sendJson(['token' => createToken($user), 'user' => publicUser($user)], 201);
}

// ---------------------------------------------------------
// LOGIN: with username OR email + password
// ---------------------------------------------------------
if ($method === 'POST' && $action === 'login') {
    $body = getJsonBody();
    $login = strtolower(trim($body['login'] ?? ''));
    $password = $body['password'] ?? '';
    $ip = $_SERVER['REMOTE_ADDR'];

    // Blocked because of too many wrong tries?
    $query = $pdo->prepare('SELECT * FROM failed_logins WHERE ip = ?');
    $query->execute([$ip]);
    $record = $query->fetch();

    $stillBlocked = $record && time() - strtotime($record['last_try']) < $BLOCK_TIME;

    if ($stillBlocked && $record['count'] >= $MAX_TRIES) {
        sendJson(['message' => 'Too many wrong tries. Please wait 15 minutes.'], 429);
    }

    // Find the user by username or email
    $query = $pdo->prepare('SELECT * FROM users WHERE username = ? OR email = ?');
    $query->execute([$login, $login]);
    $user = $query->fetch();

    // Compare the password with the encrypted one
    $correct = $user && password_verify($password, $user['password']);

    if (!$correct) {
        // Count this wrong try
        $count = ($stillBlocked ? $record['count'] : 0) + 1;

        $pdo->prepare('DELETE FROM failed_logins WHERE ip = ?')->execute([$ip]);
        $pdo->prepare('INSERT INTO failed_logins (ip, count, last_try) VALUES (?, ?, ?)')->execute([$ip, $count, now()]);

        // Same message for wrong user and wrong password (we don't tell which one)
        sendJson(['message' => 'Wrong username, email or password'], 401);
    }

    // Good login: forget the wrong tries
    $pdo->prepare('DELETE FROM failed_logins WHERE ip = ?')->execute([$ip]);

    sendJson(['token' => createToken($user), 'user' => publicUser($user)]);
}

// ---------------------------------------------------------
// ME: who is logged in (needs a token)
// ---------------------------------------------------------
if ($method === 'GET' && $action === 'me') {
    $tokenUser = requireAuth();

    $query = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $query->execute([$tokenUser['id']]);
    $user = $query->fetch();

    if (!$user) {
        sendJson(['message' => 'This account does not exist anymore'], 401);
    }

    sendJson(['user' => publicUser($user)]);
}

sendJson(['message' => 'Not found'], 404);
