require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Stop if the JWT secret is missing (tokens would not be safe)
if (!process.env.JWT_SECRET) {
  console.log('Missing JWT_SECRET in the .env file');
  process.exit(1);
}

// Read JSON from requests
app.use(express.json());

// Show the menu and admin pages
app.use(express.static(path.join(__dirname, '..', 'Digital-Menu')));

// Show uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public routes (no login needed)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));

// Admin routes (login needed: "auth" checks the token first)
app.use('/api/categories', auth, require('./routes/categories'));
app.use('/api/items', auth, require('./routes/items'));
app.use('/api/trash', auth, require('./routes/trash'));
app.use('/api/stats', auth, require('./routes/stats'));

// Connect to the database, then start the server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});