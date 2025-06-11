const pool = require('../config/db');

const Candidate = {
  // Create candidates table and ensure 'election_name', 'year' and 'manifesto' columns exist
  async createTable() {
    const client = await pool.connect();
    try {
      // Create the base table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS candidates (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(100) NOT NULL,
          election_name VARCHAR(100) NOT NULL,
          position VARCHAR(50) NOT NULL,
          course VARCHAR(100) NOT NULL,
          candidate_image_url VARCHAR(255),
          leadership_experience TEXT,
          votes_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          election_id INTEGER REFERENCES elections(id)
        );
      `);

      // Ensure additional columns exist including election_name
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'candidates' AND column_name = 'election_name'
          ) THEN
            ALTER TABLE candidates ADD COLUMN election_name VARCHAR(100) NOT NULL DEFAULT '';
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'candidates' AND column_name = 'year'
          ) THEN
            ALTER TABLE candidates ADD COLUMN year VARCHAR(20);
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'candidates' AND column_name = 'manifesto'
          ) THEN
            ALTER TABLE candidates ADD COLUMN manifesto TEXT;
          END IF;
        END
        $$;
      `);

      console.log('✅ Candidates table ensured with `election_name`, `year`, and `manifesto` columns.');
    } catch (err) {
      console.error('❌ Error ensuring candidates table:', err);
    } finally {
      client.release();
    }
  },

  // Get candidates by election ID
  async getByElectionId(electionId) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'SELECT * FROM candidates WHERE election_id = $1',
        [electionId]
      );
      return res.rows;
    } catch (err) {
      console.error('❌ Error fetching candidates by election:', err);
      throw err;
    } finally {
      client.release();
    }
  },

  // Get the most recent candidates
  async getRecent() {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT * FROM candidates ORDER BY created_at DESC LIMIT 10
      `);
      return res.rows;
    } catch (err) {
      console.error('❌ Error fetching recent candidates:', err);
      throw err;
    } finally {
      client.release();
    }
  }
};

module.exports = Candidate;
