const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const eventRoutes = require('./routes/events');

const app = express();

const PORT = process.env.PORT || 4002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventsphere-events';

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://eventrix-frontend-4q7a.onrender.com'  // Add your Render frontend URL
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/events', eventRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Event service is running', timestamp: new Date() });
});

// MongoDB connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Event service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
