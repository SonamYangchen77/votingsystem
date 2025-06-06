const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const pool = require('../config/db');

// Route to render home page with candidates for carousel
router.get('/home', async (req, res) => {
  try {
    const upcomingElections = await Election.getUpcoming(); // Custom function that fetches upcoming elections
    const candidates = await Candidate.getRecent(); // Custom function to get latest candidates

    res.render('home', {
      user: req.session.user || null,
      upcomingElections,
      candidates,
    });
  } catch (err) {
    console.error('Error rendering home page:', err);
    res.status(500).send('Server error');
  }
});

async function getElectionsFromDB() {
  const result = await pool.query('SELECT * FROM elections'); // Adjust your query accordingly
  return result.rows;
}

// Route handler
router.get('/election', async (req, res) => {
  try {
    const elections = await getElectionsFromDB();
    res.render('election', { elections, query: req.query });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving elections');
  }
});
router.get('/select-election', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM elections WHERE end_date >= CURRENT_DATE ORDER BY start_date ASC');
    const elections = result.rows;

    // You can pass query params like success or voted if needed:
    const { success, voted } = req.query;

    res.render('select-election', { elections, success, voted, query: req.query });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/election/vote', (req, res) => {
  const { electionId } = req.query;
  if (!electionId) {
    return res.redirect('/select-election');
  }
  // Redirect to your main election page but filtered to that election OR
  // redirect to your candidate voting page for that election.
  res.redirect(`/vote-candidates/${electionId}`);
});

module.exports = router;
