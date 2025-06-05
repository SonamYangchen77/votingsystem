const pool = require('../config/db');

const emitLiveResults = async (io) => {
  try {
    const electionsRes = await pool.query('SELECT id, name AS title, end_date FROM elections');
    const elections = electionsRes.rows;

    const data = [];

    for (const election of elections) {
      const candidatesRes = await pool.query(`
        SELECT 
          c.id, c.full_name AS name, c.candidate_image_url AS imageUrl,
          c.course AS party, c.position AS positionTitle,
          COUNT(v.id) AS votes
        FROM candidates c
        LEFT JOIN votes v ON c.id = v.candidate_id
        WHERE c.election_id = $1
        GROUP BY c.id
        ORDER BY votes DESC
      `, [election.id]);

      const candidates = candidatesRes.rows.map(c => ({
        ...c,
        votes: parseInt(c.votes),
      }));

      const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

      candidates.forEach(c => {
        c.percentage = totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(2) : 0;
      });

      data.push({
        id: election.id,
        electionTitle: election.title,
        endTime: election.end_date,
        totalVotes,
        candidates
      });
    }

    io.emit('liveResultsUpdate', { results: data });
  } catch (err) {
    console.error('Error emitting live results:', err);
  }
};

module.exports = emitLiveResults;
