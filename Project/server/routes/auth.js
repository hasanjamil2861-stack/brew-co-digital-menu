const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// =========================================================
// HELPERS
// =========================================================

// Create a token for a user (valid for 1 day)
function createToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

// What we send back about a user (never the password)
function publicUser(user) {
  return { id: user._id, username: user.username, email: user.email };
}

// Simple email check: something@something.something
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// =========================================================
// PROTECTION AGAINST GUESSING PASSWORDS
// After 5 wrong logins from the same computer, wait 15 minutes
// =========================================================

const failedLogins = {};
const MAX_TRIES = 5;
const BLOCK_TIME = 15 * 60 * 1000; // 15 minutes

// =========================================================
// REGISTER: create a new admin account
// =========================================================

router.post('/register', async (req, res) => {
  // Registration can be closed from the .env file
  if (process.env.ALLOW_REGISTER !== 'true') {
    return res.status(403).json({ message: 'Creating new accounts is closed' });
  }

  const username = (req.body.username || '').trim().toLowerCase();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  // Check the data (the browser checks too, but the server must check again)
  if (username.length < 3) {
    return res.status(400).json({ message: 'Username must have at least 3 characters' });
  }
  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must have at least 8 characters' });
  }

  // Username and email must be unique
  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(409).json({ message: 'This username or email is already used' });
  }

  // Encrypt the password (10 = how strong the encryption is)
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ username, email, password: hashedPassword });

  // Logged in directly after creating the account
  res.status(201).json({ token: createToken(user), user: publicUser(user) });
});

// =========================================================
// LOGIN: with username OR email + password
// =========================================================

router.post('/login', async (req, res) => {
  const login = (req.body.login || '').trim().toLowerCase();
  const password = req.body.password || '';
  const ip = req.ip;

  // Blocked because of too many wrong tries?
  const record = failedLogins[ip];
  const stillBlocked = record && Date.now() - record.time < BLOCK_TIME;

  if (stillBlocked && record.count >= MAX_TRIES) {
    return res.status(429).json({ message: 'Too many wrong tries. Please wait 15 minutes.' });
  }

  // Find the user by username or email
  const user = await User.findOne({ $or: [{ username: login }, { email: login }] });

  // Compare the password with the encrypted one
  const correct = user ? await bcrypt.compare(password, user.password) : false;

  if (!correct) {
    // Count this wrong try
    failedLogins[ip] = {
      count: (stillBlocked ? record.count : 0) + 1,
      time: Date.now(),
    };

    // Same message for wrong user and wrong password (we don't tell which one)
    return res.status(401).json({ message: 'Wrong username, email or password' });
  }

  // Good login: forget the wrong tries
  delete failedLogins[ip];

  res.json({ token: createToken(user), user: publicUser(user) });
});

// =========================================================
// ME: who is logged in (needs a token)
// =========================================================

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(401).json({ message: 'This account does not exist anymore' });
  }

  res.json({ user: publicUser(user) });
});

module.exports = router;