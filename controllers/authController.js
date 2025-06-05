const pool = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Helper: get user by email
async function getUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

// Helper: create new user
async function createUser({ name, email, course, year, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password, course, year) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [name, email, hashedPassword, course, year]
  );
  return result.rows[0];
}

// Render Signup Page
exports.renderSignupPage = (req, res) => {
  res.render('signup', { error: null });
};

// Handle Signup POST
exports.signup = async (req, res) => {
  const { name, email, course, year, password, confirmPassword } = req.body;

  if (!name || !email || !course || !year || !password || !confirmPassword) {
    return res.render('signup', { error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.render('signup', { error: 'Passwords do not match' });
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.render('signup', { error: 'Email already registered' });
    }

    await createUser({ name, email, course, year, password });
    return res.redirect('/');
  } catch (err) {
    console.error('Signup error:', err);
    return res.render('signup', { error: 'Server error during signup. Try again.' });
  }
};

// Render Login Page
exports.renderLoginPage = (req, res) => {
  res.render('index', { error: null });
};

// Handle Login POST
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('index', { error: 'Please enter email and password' });
  }

  try {
    // Admin login check
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      req.session.user = {
        id: 'admin',
        username: 'admin',
        role: 'admin'
      };
      // Save session and redirect
      return req.session.save(err => {
        if (err) {
          console.error('Session save error:', err);
          return res.render('index', { error: 'Login failed due to session error' });
        }
        return res.redirect('/admin/dashboard');
      });
    }

    // Normal user login
    const user = await getUserByEmail(email);
    if (!user) {
      return res.render('index', { error: 'Email not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('index', { error: 'Incorrect password' });
    }

    req.session.user = {
      id: user.id,
      username: user.name,
      role: 'user'
    };

    // Save session and redirect
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.render('index', { error: 'Login failed due to session error' });
      }
      return res.redirect('/home');
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.render('index', { error: 'Server error during login. Try again.' });
  }
};

// Handle Logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }
    res.redirect('/');
  });
};
