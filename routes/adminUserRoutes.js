const express = require('express');
const router = express.Router();
const { getUsers, deleteUser } = require('../controllers/adminUserController');

// Route to get and display users
router.get('/adminUser', getUsers);

// Route to delete user
router.post('/adminUser/delete/:id', deleteUser);

module.exports = router;
