// models/Vote.js
const pool = require('../config/db');

const Vote = {
  async createTables() {
    const client = await pool.connect();
    try {
      // Create candidates table if not exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS candidates (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          position TEXT NOT NULL,
          election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE,
          vote_count INTEGER DEFAULT 0
        );
      `);

      // Create votes table if not exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS votes (
          id SERIAL PRIMARY KEY,
          election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE,
          candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(election_id, user_id)  -- prevent double voting
        );
      `);

      console.log('✅ Candidates and Votes tables ready.');
    } catch (err) {
      console.error('❌ Error creating candidates/votes tables:', err);
    } finally {
      client.release();
    }
  }
};

module.exports = Vote;
