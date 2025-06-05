const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { users } = require('../models/User'); // get users array directly

router.get('/dashboard', adminController.getAdminDashboard);

router.get('/adminUser', (req, res) => {
  try {
    res.render('admin/adminUser', { users }); // pass users array directly
  } catch (err) {
    console.error('Error rendering adminUser page:', err);
    res.status(500).send('Server error');
  }
});
router.get('/adminResult', (req, res) => {
  res.render('admin/adminResult');  // make sure this matches your file structure
});

// Logout route (POST)
router.post('/logout', adminController.logoutAdmin);
module.exports = router;
