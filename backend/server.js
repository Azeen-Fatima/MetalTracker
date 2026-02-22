require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./database');
const fs = require('fs');

async function initDatabase() {
  try {
    let schema;
    try {
      schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
    } catch (e) {
      try {
        schema = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
      } catch (e2) {
        console.log('Schema file not found, skipping auto init');
        schema = null;
      }
    }

    if (schema) {
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (e) {
          if (!e.message.includes('already exists')) {
            console.error('Schema error:', e.message);
          }
        }
      }
      console.log('Database initialized successfully');
    }
  } catch (e) {
    console.error('Database init failed:', e.message);
  }
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

const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
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

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/metals', metalsRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/predictions', predictionsRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/alerts', alertsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
