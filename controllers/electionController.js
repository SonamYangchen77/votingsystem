const pool = require('../config/db');
const moment = require('moment');

// ---------------- USER VIEWS ----------------

const getElections = async (req, res) => {
  try {
    const electionResult = await pool.query('SELECT * FROM elections ORDER BY start_date DESC');
    const elections = electionResult.rows;

    console.log("Fetched elections:", elections);

    const now = moment();
    const current = [], upcoming = [], past = [];

    for (const election of elections) {
      const start = moment(election.start_date);
      const end = moment(election.end_date);

      if (now.isBetween(start, end, null, '[]')) {
        const candidatesRes = await pool.query(
          'SELECT * FROM candidates WHERE election_id = $1',
          [election.id]
        );
        election.candidates = candidatesRes.rows;

        console.log(`Election "${election.name}" candidates:`, election.candidates);

        current.push(election);
      } else if (now.isBefore(start)) {
        upcoming.push(election);
      } else {
        past.push(election);
      }
    }

    res.render('election', {
      elections: current,
      upcoming,
      past,
      query: req.query
    });

  } catch (err) {
    console.error("Error in getElections:", err);
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

    const upcoming = result.rows.map(election => ({
      ...election,
      title: election.name,
      date: moment(election.start_date).format('YYYY-MM-DD'),
      startTime: moment(election.start_date).format('hh:mm A'),
      endTime: moment(election.end_date).format('hh:mm A')
    }));

    res.render('upcoming', { upcoming });
  } catch (err) {
    console.error(err);
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

        const totalVotes = candidatesRes.rows.reduce((sum, c) => sum + c.votes, 0);
        const results = candidatesRes.rows.map(candidate => ({
          name: candidate.name,
          votes: candidate.votes,
          percentage: totalVotes ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0
        }));

        positions.push({
          title: position.name,
          winner: candidatesRes.rows[0]?.name || 'No winner',
          results
        });

        totalPositions += 1;
        totalParticipants += totalVotes;
      }

      pastElections.push({
        title: election.name,
        date: new Date(election.end_date).toLocaleDateString(),
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
    console.error(err);
    res.status(500).send("Error fetching past elections");
  }
};

module.exports = {
  getElections,
  getUpcomingElections,
  getPastElections
};
