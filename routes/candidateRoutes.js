const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const upload = require('../middleware/multer');

// Admin routes
router.get('/admin/adminCandidate', candidateController.getAdminCandidates);
router.post('/admin/adminCandidate/add', upload.single('candidate_image'), candidateController.addCandidate);
router.get('/admin/adminCandidate/edit/:id', candidateController.showEditForm);
router.post('/admin/adminCandidate/update/:id', upload.single('candidate_image'), candidateController.updateCandidate);
router.post('/admin/adminCandidate/delete', candidateController.deleteCandidate);

// Get positions by electionId (AJAX endpoint)
router.get('/admin/positions/:electionId', candidateController.getPositionsByElection);

// Public routes
router.get('/candidates', candidateController.getAllCandidates);
router.get('/candidates/:electionName', candidateController.getCandidatesByElection);

// Redirect /candidate to /candidates
router.get('/candidate', (req, res) => {
  res.redirect('/candidates');
});

module.exports = router;
