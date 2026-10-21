require('dotenv').config();
const express = require('express');
const pool = require('./db');

const app = express();
app.disable('x-powered-by');

app.get('/api/productos', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, precio, categoria FROM productos ORDER BY id'
    );
    res.json({ data: result.rows });
  } catch (error) {
    next(error);
  }
});

app.get('/api/productos/:id', async (req, res, next) => {
  const { id } = req.params;
  // Acepta enteros positivos dentro del rango de un bigint de PostgreSQL.
  if (!/^[1-9]\d{0,18}$/.test(id) || BigInt(id) > 9223372036854775807n) {
    return res.status(400).json({ data: null, error: 'ID inválido' });
  }

  try {
    const result = await pool.query(
      'SELECT id, nombre, precio, categoria FROM productos WHERE id = $1::bigint',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ data: null, error: 'Producto inexistente' });
    }
    res.json({ data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ data: null, error: 'Ruta inexistente' });
});

app.use((error, req, res, next) => {
  console.error('Error del servidor:', error.message);
  res.status(500).json({ data: null, error: 'Error interno del servidor' });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`API de productos escuchando en 0.0.0.0:${port}`);
  });
  server.on('error', (error) => {
    console.error('No se pudo iniciar la API:', error.message);
    process.exitCode = 1;
    pool.end();
  });
  const shutdown = () => {
    server.close(() => {
      pool.end().catch(() => { process.exitCode = 1; });
    });
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

module.exports = app;
