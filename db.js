require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  ...(process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
      }),
  connectionTimeoutMillis: 5000,
});

pool.on('error', (error) => {
  console.error('Error de conexión a PostgreSQL:', error.message);
});

module.exports = pool;
