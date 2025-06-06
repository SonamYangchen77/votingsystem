// models/User.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  // Create the users table if it doesn't exist
  async createTable() {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          course TEXT,
          year TEXT,
          password TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Users table ready.');
    } catch (err) {
      console.error('❌ Error creating users table:', err);
    } finally {
      client.release();
    }
  },

  // Create a user
  async createUser({ name, email, course, year, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (name, email, course, year, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [name, email, course, year, hashedPassword];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Get user by email
  async getUserByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1`;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  },
};

User.getAllUsers = async () => {
  const query = `
    SELECT id, name, email, course AS department, year, 'active' AS status
    FROM users
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

module.exports = User;
