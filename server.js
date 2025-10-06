const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Use API_PORT to avoid clashing with React's PORT=3000
const PORT = Number(process.env.API_PORT || 4000);

let pool;
async function initDb() {
  pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/time', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/db/info', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT VERSION() AS version, DATABASE() AS db, USER() AS user, NOW() AS now');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/db/ping', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.ping();
    res.json({ status: 'ok', message: 'pong' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  } finally {
    if (conn) conn.release();
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize DB pool:', err);
    process.exit(1);
  });


