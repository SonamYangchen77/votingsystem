const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const adminElectionController = require('../controllers/adminElectionController');
const { isAdmin } = require('../middleware/authMiddleware');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Routes for /admin/*
router.get('/adminElection', isAdmin, adminElectionController.listElections);
router.post('/adminElection/create', isAdmin, upload.single('voterFile'), adminElectionController.createElection);

router.get('/adminElection/editElection/:id', isAdmin, adminElectionController.renderEditElection);
router.post('/adminElection/editElection/:id', isAdmin, adminElectionController.updateElection);

router.post('/adminElection/:id/delete', isAdmin, adminElectionController.deleteElection);
router.delete('/adminElection/:id', adminElectionController.deleteElection);

module.exports = router;
