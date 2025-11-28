const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET /api/debug/users - List all users (for debugging only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;