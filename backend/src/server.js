require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── CORS CONFIGURATION ─────────────────────────────────────────
// Force CORS headers on every response to guarantee Vercel Edge compliance without 'cors' library
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ─── BODY PARSERS ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── STATIC UPLOADS ─────────────────────────────────────────────
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : 'uploads';
app.use('/uploads', express.static(uploadDir));

// ─── ROUTE IMPORTS ──────────────────────────────────────────────
const cardRoutes = require('./routes/cardRoutes');
const boardRoutes = require('./routes/boardRoutes');
const listRoutes = require('./routes/listRoutes');
const cardFeatureRoutes = require('./routes/cardFeatureRoutes');
const initController = require('./controllers/initController');
const authMiddleware = require('./middleware/auth');

// ─── HEALTH CHECK ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Trello Clone API' });
});

// ─── INIT DATABASE ──────────────────────────────────────────────
app.get('/api/init', initController.initDatabase);

// ─── PROTECTED ROUTES ───────────────────────────────────────────
app.use(authMiddleware);

app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api', cardFeatureRoutes);

// ─── START SERVER (SKIP ON VERCEL) ──────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;