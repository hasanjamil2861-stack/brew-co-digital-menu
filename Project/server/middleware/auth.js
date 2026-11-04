const jwt = require('jsonwebtoken');

// Checks the token before letting the request go to the route
function auth(req, res, next) {
  // The token comes in the header like this: "Authorization: Bearer <token>"
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  // No token = not logged in
  if (!token) {
    return res.status(401).json({ message: 'Please log in first' });
  }

  try {
    // If the token is real and not expired, we get the user inside it
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    // Fake or expired token
    return res.status(401).json({ message: 'Your session has expired, please log in again' });
  }
}

module.exports = auth;