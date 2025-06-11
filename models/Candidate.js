// models/Candidate.js
const pool = require('../config/db');

const Candidate = {
  async createTable() {
    const client = await pool.connect();
    try {
      // Ensure the table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS candidates (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(100) NOT NULL,
          election_name VARCHAR(100) NOT NULL,
          position VARCHAR(50) NOT NULL,
          course VARCHAR(100) NOT NULL,
          candidate_image_url VARCHAR(255),
          leadership_experience TEXT,
          manifesto TEXT,
          votes_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          election_id INTEGER REFERENCES elections(id)
        );
      `);

      // Safely add the missing 'year' column if it doesn't exist
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns 
            WHERE table_name='candidates' AND column_name='year'
          ) THEN
            ALTER TABLE candidates ADD COLUMN year VARCHAR(20);
          END IF;
        END
        $$;
      `);

      console.log('✅ Candidates table ensured with `year` column.');
    } catch (err) {
      console.error('❌ Error ensuring candidates table:', err);
    } finally {
      client.release();
    }
  },
Candidate.getByElectionId = async function (electionId) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT * FROM candidates WHERE election_id = $1',
      [electionId]
    );
    return res.rows;
  } catch (err) {
    console.error('Error fetching candidates:', err);
    throw err;
  } finally {
    client.release();
  }
};

Candidate.getRecent = async function () {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT * FROM candidates ORDER BY created_at DESC LIMIT 10
    `);
    return res.rows;
  } finally {
    client.release();
  }
};

Candidate.getByElectionId = async function (electionId) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'SELECT * FROM candidates WHERE election_id = $1',
      [electionId]
    );
    return res.rows;
  } finally {
    client.release();
  }
};


module.exports = Candidate;
