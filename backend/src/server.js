require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── CORS: manually set headers on EVERY response ───────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ─── Body parsers ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static uploads ──────────────────────────────────────────────
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : 'uploads';
app.use('/uploads', express.static(uploadDir));

// ─── Route imports ───────────────────────────────────────────────
const cardRoutes = require('./routes/cardRoutes');
const boardRoutes = require('./routes/boardRoutes');
const listRoutes = require('./routes/listRoutes');
const cardFeatureRoutes = require('./routes/cardFeatureRoutes');
const initController = require('./controllers/initController');
const authMiddleware = require('./middleware/auth');

// ─── Health check ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Trello Clone API' });
});

// ─── Init / seed route (no auth needed) ──────────────────────────
app.get('/api/init', initController.initDatabase);

// ─── Protected API routes ────────────────────────────────────────
app.use(authMiddleware);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api', cardFeatureRoutes);

// ─── Start server (skip on Vercel) ───────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
