const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Render signup page
router.get('/signup', authController.renderSignupPage);

// Handle signup form submission
router.post('/signup', authController.signup);

// Render login page (index.ejs)
router.get('/', authController.renderLoginPage);

// Handle login form submission
router.post('/login', authController.login);

// Handle logout
router.get('/logout', authController.logout);

module.exports = router;
