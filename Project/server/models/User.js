const mongoose = require('mongoose');

// An admin account
const userSchema = new mongoose.Schema(
  {
    // Saved in lowercase, so "Ali" and "ali" are the same user
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },

    // The password is saved encrypted (hashed with bcrypt), never as plain text
    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);