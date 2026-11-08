<?php
// =========================================================
// SETTINGS (like the .env file in the Node version)
// Change these values on the host
// =========================================================

// Database (on the host: cPanel > MySQL Databases)
define('DB_HOST', 'localhost');
define('DB_NAME', 'digital_menu');
define('DB_USER', 'root');
define('DB_PASS', '');

// Secret key used to sign the login tokens
// Change it to a long random text, and never share it
define('JWT_SECRET', 'change-this-to-a-long-random-text');

// true = anyone can create an admin account, false = closed
define('ALLOW_REGISTER', true);
