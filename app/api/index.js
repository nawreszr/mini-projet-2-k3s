const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'ChangeMe-123',
  database: process.env.DB_NAME || 'appdb',
});

setTimeout(async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL);`);
    console.log('Table tasks initialisée.');
  } catch (err) { console.error('Erreur init DB:', err); }
}, 5000);

app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/ready', async (req, res) => {
  try { await pool.query('SELECT 1'); res.status(200).send('Ready'); } 
  catch (err) { res.status(500).send('Database not ready'); }
});

app.get('/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
  res.json(result.rows);
});
app.post('/tasks', async (req, res) => {
  const result = await pool.query('INSERT INTO tasks (title) VALUES ($1) RETURNING *', [req.body.title]);
  res.status(201).json(result.rows[0]);
});
app.delete('/tasks/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.status(204).send();
});

const port = process.env.API_PORT || 3000;
app.listen(port, () => console.log(`API démarrée sur le port ${port}`));