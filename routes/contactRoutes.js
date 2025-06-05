const express = require('express');
const router = express.Router();
const db = require('../config/db'); // adjust path as needed

// ✅ Render the contact form
router.get('/contact', (req, res) => {
  res.render('contact'); // Make sure views/contact.ejs exists
});

// ✅ Handle form submission
router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    await db.query(
      'INSERT INTO messages (name, email, subject, message, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [name, email, subject, message]
    );
    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

module.exports = router;
