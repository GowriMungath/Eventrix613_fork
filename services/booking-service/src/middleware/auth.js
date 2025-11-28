const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

// Middleware to verify JWT token with auth-service
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Call auth-service to verify token
    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { verifyToken };