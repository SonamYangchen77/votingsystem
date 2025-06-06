// models/Candidate.js
const pool = require('../config/db');

const Candidate = {
  async createTable() {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS candidates (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(100) NOT NULL,
          election_name VARCHAR(100) NOT NULL,
          position VARCHAR(50) NOT NULL,
          course VARCHAR(100) NOT NULL,
          year VARCHAR(20) NOT NULL,
          candidate_image_url VARCHAR(255),
          leadership_experience TEXT,
          manifesto TEXT,
          votes_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          election_id INTEGER REFERENCES elections(id)
        );
      `);
      console.log('Candidates table created or already exists.');
    } catch (err) {
      console.error('Error creating candidates table:', err);
    } finally {
      client.release();
    }
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
