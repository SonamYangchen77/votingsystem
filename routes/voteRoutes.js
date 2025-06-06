const express = require('express');
const router = express.Router();

const voteController = require('../controllers/voteController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const Candidate = require('../models/Candidate');
const pool = require('../config/db');

// Cast vote route
router.post('/vote/:electionId', voteController.castVote);


// Show elections + candidates (for dashboard or vote overview)
router.get('/elections', isAuthenticated, async (req, res) => {
  try {
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

// 🔽 New route: Display candidates for selected election
router.get('/election/vote', isAuthenticated, async (req, res) => {
  const electionId = req.query.electionId;
  try {
    const candidates = await Candidate.getByElectionId(electionId);
    res.render('vote-candidates', { candidates, electionId });
  } catch (err) {
    console.error('Error fetching candidates for voting:', err);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/vote-candidates/:electionId', async (req, res) => {
  try {
    const electionId = req.params.electionId;
    const success = req.query.success === 'true';
    const voted = req.query.voted === 'true';

    const candidates = await pool.query(
      'SELECT * FROM candidates WHERE election_id = $1',
      [electionId]
    );

    res.render('vote-candidates', {
      candidates: candidates.rows,
      electionId,
      success,
      voted
    });
  } catch (err) {
    console.error('Error loading candidates:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
