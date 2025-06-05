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

// Admin Election Routes
router.get('/adminElection', isAdmin, adminElectionController.listElections);

router.post('/adminElection/create', isAdmin, upload.single('voterFile'), adminElectionController.createElection);
router.get('/adminElection/edit/:id', isAdmin, adminElectionController.renderEditElection);
router.post('/adminElection/edit/:id', isAdmin, adminElectionController.updateElection);
// In routes/adminElectionRoutes.js
router.post('/adminElection/:id/delete', isAdmin,adminElectionController.deleteElection);



module.exports = router;
