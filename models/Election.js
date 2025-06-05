// models/Election.js
const pool = require('../config/db');

const Election = {
  async createTable() {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS organizations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS elections (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP NOT NULL,
          voter_file TEXT,
          organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE
        );
      `);
      console.log('Tables created or already exist.');
    } catch (err) {
      console.error('Error creating tables:', err);
    } finally {
      client.release();
    }
  }
};

module.exports = Election;
