const express = require('express');
const router = express.Router();
const { createUser, getUserByEmail } = require('../models/userModel');

// GET signup page
router.get('/signup', (req, res) => {
  res.render('signup');
});

// POST signup
router.post('/signup', async (req, res) => {
  const { name, email, course, year, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send("Passwords do not match.");
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.send("Email already registered.");
    }

    const user = await createUser({ name, email, course, year, password });
    res.send("Signup successful! You can now log in.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error signing up user.");
  }
});
