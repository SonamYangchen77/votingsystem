const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'onlineVoting',
  password: 'yangchen',
  port: 5432, // default PostgreSQL port
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Database connection failed:', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release(); // release the client back to the pool
});

module.exports = pool;
