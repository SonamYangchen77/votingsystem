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
  },

  async getAll() {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM elections ORDER BY start_date ASC');
      return res.rows;  // array of election objects
    } catch (err) {
      console.error('Error fetching elections:', err);
      throw err;
    } finally {
      client.release();
    }
  }
};
Election.getUpcoming = async function () {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT * FROM elections WHERE start_date > NOW() ORDER BY start_date ASC
    `);
    return res.rows;
  } finally {
    client.release();
  }
};


module.exports = Election;
