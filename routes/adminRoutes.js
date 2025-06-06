const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const User = require('../models/User');
 // get users array directly

router.get('/dashboard', adminController.getAdminDashboard);

// Admin User Management Page
// Add this if not already present
User.getAllUsers = async function () {
  const query = `SELECT id, name, email, course AS department, year, 'active' AS status FROM users ORDER BY created_at DESC`;
  const { rows } = await require('../config/db').query(query);
  return rows;
};

// GET users list
// Get all users and render adminUser.ejs
router.get('/adminUser', async (req, res) => {
  try {
    const users = await User.getAllUsers(); // make sure this method exists
    res.render('admin/adminUser', { users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server error');
  }
});
// routes/admin.js
router.post('/adminUser/delete/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    res.redirect('/admin/adminUser');
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Error deleting user');
  }
});
router.get('/adminResult', (req, res) => {
  res.render('admin/adminResult');  // make sure this matches your file structure
});

// Logout route (POST)
router.post('/logout', adminController.logoutAdmin);
module.exports = router;
