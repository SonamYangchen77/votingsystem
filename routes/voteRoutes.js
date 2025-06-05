const express = require('express');
const router = express.Router();

const voteController = require('../controllers/voteController');
const { isAuthenticated } = require('../middleware/authMiddleware');  // Corrected

// Cast vote route
router.post('/vote/:electionId/:candidateId', voteController.castVote);


// If you have a page to show elections to logged-in users
router.get('/elections', isAuthenticated, async (req, res) => {
  // Example implementation (you can customize)
  try {
    const pool = require('../config/db');
    const electionsRes = await pool.query('SELECT * FROM elections WHERE NOW() < end_date');
    const elections = electionsRes.rows;

    for (let election of elections) {
      const candidatesRes = await pool.query(
        'SELECT * FROM candidates WHERE election_id = $1',
        [election.id]
      );
      election.candidates = candidatesRes.rows;
    }

    res.render('election', { elections, user: req.session.user });
  } catch (error) {
    console.error('Error loading elections:', error);
    res.status(500).send('Failed to load elections.');
  }
});

module.exports = router;
