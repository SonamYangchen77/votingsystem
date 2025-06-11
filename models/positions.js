const pool = require('../config/db');

const Position = {
  async createTable() {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS positions (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Positions table created or already exists.');
    } catch (err) {
      console.error('❌ Error creating positions table:', err);
    } finally {
      client.release();
    }
  }
};

module.exports = Position;
