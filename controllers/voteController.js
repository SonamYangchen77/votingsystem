const pool = require('../config/db');

const castVote = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user || !user.id) {
      return res.status(401).send('Unauthorized: User not logged in');
    }

    const userId = user.id;
    const electionId = req.params.electionId;
    const candidateId = req.params.candidateId;

    // ✅ Skip eligibility check

    // Check if user already voted in this election
    const existingVote = await pool.query(
      'SELECT * FROM votes WHERE election_id = $1 AND user_id = $2',
      [electionId, userId]
    );
    if (existingVote.rows.length > 0) {
      return res.status(400).send('You have already voted in this election.');
    }

    // Insert vote
    await pool.query(
      'INSERT INTO votes (election_id, candidate_id, user_id) VALUES ($1, $2, $3)',
      [electionId, candidateId, userId]
    );

    res.redirect('/election?success=true');
  } catch (err) {
    console.error('Error casting vote:', err);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { castVote };
