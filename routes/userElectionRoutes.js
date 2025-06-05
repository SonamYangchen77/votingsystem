const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');

// ---------- USER VIEWS ----------
router.get('/', electionController.getElections);             // /election
router.get('/upcoming', electionController.getUpcomingElections);
router.get('/past', electionController.getPastElections);

module.exports = router;
