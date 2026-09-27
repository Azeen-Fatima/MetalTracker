require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in the environment. Refusing to start with an insecure default.');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./database');
const fs = require('fs');

async function initDatabase() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(10) UNIQUE,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password_hash VARCHAR(255),
      profile_pic VARCHAR(255) DEFAULT 'default.png',
      theme VARCHAR(10) DEFAULT 'dark',
      currency VARCHAR(5) DEFAULT 'USD',
      unit VARCHAR(10) DEFAULT 'tola',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS verification_codes (
      id SERIAL PRIMARY KEY,
      email VARCHAR(100),
      code VARCHAR(4),
      type VARCHAR(20),
      verified BOOLEAN DEFAULT false,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS price_alerts (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(10),
      metal VARCHAR(20),
      threshold_price DECIMAL(15,2),
      direction VARCHAR(10),
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(10),
      metal VARCHAR(20),
      notify BOOLEAN DEFAULT true
    )`,
    `CREATE TABLE IF NOT EXISTS price_predictions (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(10),
      metal VARCHAR(20),
      prediction VARCHAR(10),
      price_at_prediction DECIMAL(15,2),
      status VARCHAR(10) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS leaderboard (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(10) UNIQUE,
      correct_predictions INT DEFAULT 0,
      total_predictions INT DEFAULT 0
    )`,
    `ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false`,
    `ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false`
  ];

  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (e) {
      console.error('Table error:', e.message);
    }
  }
  console.log('Database initialized successfully');
}

initDatabase();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const metalsRoutes = require('./routes/metals');
const watchlistRoutes = require('./routes/watchlist');
const predictionsRoutes = require('./routes/predictions');
const pdfRoutes = require('./routes/pdf');
const alertsRoutes = require('./routes/alerts');

require('./services/metals');
require('./services/exchange');
require('./services/news');
require('./services/predictionsCron');

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  req.db = pool;
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ status: 'MetalTracker API is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/metals', metalsRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/predictions', predictionsRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/alerts', alertsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
