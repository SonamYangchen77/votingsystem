const pool = require('../config/db');
const moment = require('moment');

// ---------------- USER VIEWS ----------------

const getElections = async (req, res) => {
  try {
    // Get all elections ordered by start_date descending
    const electionsResult = await pool.query('SELECT * FROM elections ORDER BY start_date DESC');
    const elections = electionsResult.rows;

    const now = moment();
    const current = [], upcoming = [], past = [];

    for (const election of elections) {
      const start = moment(election.start_date);
      const end = moment(election.end_date);

      if (now.isBetween(start, end, null, '[]')) {
        // Ongoing election - fetch candidates
        const candidatesResult = await pool.query(
          'SELECT id, name, candidate_image_url, course, position FROM candidates WHERE election_id = $1',
          [election.id]
        );

        // Map candidate fields just in case
        election.candidates = candidatesResult.rows.map(c => ({
          id: c.id,
          name: c.name,
          candidate_image_url: c.candidate_image_url || '/images/default.jpg',
          course: c.course || 'N/A',
          position: c.position || 'N/A'
        }));

        current.push(election);

      } else if (now.isBefore(start)) {
        upcoming.push(election);
      } else {
        past.push(election);
      }
    }

    // Render view passing only ongoing elections (with candidates)
    res.render('election', {
      elections: current,
      query: req.query
    });

  } catch (err) {
    console.error('Error fetching elections:', err);
    res.status(500).send('Server Error');
  }
};

const getUpcomingElections = async (req, res) => {
  try {
    const today = moment().startOf('day');
    const result = await pool.query(
      'SELECT * FROM elections WHERE start_date > $1 ORDER BY start_date ASC',
      [today.format('YYYY-MM-DD')]
    );

    // For each upcoming election, fetch candidates (optional, if you want to show candidates there)
    const upcoming = [];

    for (const election of result.rows) {
      const candidatesRes = await pool.query(
        'SELECT * FROM candidates WHERE election_id = $1',
        [election.id]
      );

      upcoming.push({
        ...election,
        candidates: candidatesRes.rows,
        startDateFormatted: moment(election.start_date).format('YYYY-MM-DD'),
        startTime: moment(election.start_date).format('hh:mm A'),
        endTime: moment(election.end_date).format('hh:mm A')
      });
    }

    res.render('upcoming', { upcoming });

  } catch (err) {
    console.error('Error in getUpcomingElections:', err);
    res.status(500).send('Server Error');
  }
};

const getPastElections = async (req, res) => {
  try {
    const electionsRes = await pool.query(
      'SELECT * FROM elections WHERE end_date < NOW() ORDER BY end_date DESC'
    );

    const pastElections = [];
    let totalTurnout = 0, totalParticipants = 0, totalPositions = 0;

    for (const election of electionsRes.rows) {
      const positionsRes = await pool.query('SELECT * FROM positions WHERE election_id = $1', [election.id]);
      const positions = [];

      for (const position of positionsRes.rows) {
        const candidatesRes = await pool.query(
          'SELECT c.id, c.name, c.votes FROM candidates c WHERE c.position_id = $1 ORDER BY votes DESC',
          [position.id]
        );

        const totalVotes = candidatesRes.rows.reduce((sum, c) => sum + (c.votes || 0), 0);

        const results = candidatesRes.rows.map(candidate => ({
          name: candidate.name,
          votes: candidate.votes || 0,
          percentage: totalVotes ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0
        }));

        positions.push({
          title: position.name,
          winner: candidatesRes.rows[0]?.name || 'No winner',
          results
        });

        totalPositions++;
        totalParticipants += totalVotes;
      }

      pastElections.push({
        title: election.name,
        date: moment(election.end_date).format('MMMM Do, YYYY'),
        turnout: election.turnout || 0,
        totalVotes: election.total_votes || 0,
        positions
      });

      totalTurnout += election.turnout || 0;
    }

    const statistics = {
      avgTurnout: pastElections.length ? (totalTurnout / pastElections.length).toFixed(2) : 0,
      totalParticipants,
      totalPositions
    };

    res.render("past", { pastElections, statistics });

  } catch (err) {
    console.error('Error in getPastElections:', err);
    res.status(500).send("Error fetching past elections");
  }
};

module.exports = {
  getElections,
  getUpcomingElections,
  getPastElections
};
