require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Apply middlewares
app.use(cors()); // Allow all by default
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Force CORS headers on every response to guarantee Vercel Edge compliance
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Serve uploaded files statically (use /tmp/uploads on Vercel)
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : 'uploads';
app.use('/uploads', express.static(uploadDir));

const fs = require('fs');
app.use((req, res, next) => {
  const originalSend = res.json;
  res.json = function(body) {
    if (res.statusCode >= 400 && req.path === '/api/cards') {
      const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - BODY: ${JSON.stringify(req.body)} - RESPONSE: ${JSON.stringify(body)}\n`;
      if (process.env.VERCEL) {
        console.error(logMessage);
      } else {
        fs.appendFileSync('debug.log', logMessage);
      }
    }
    return originalSend.apply(this, arguments);
  };
  next();
});

const cardRoutes = require('./routes/cardRoutes');
const boardRoutes = require('./routes/boardRoutes');
const listRoutes = require('./routes/listRoutes');
const cardFeatureRoutes = require('./routes/cardFeatureRoutes');

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Trello Clone API' });
});

const initController = require('./controllers/initController');

// API Routes
app.get('/api/init', initController.initDatabase);

const authMiddleware = require('./middleware/auth');

// API Routes
app.use(authMiddleware);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api', cardFeatureRoutes);

// Start the server (only if not running in a serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the Express API
module.exports = app;
