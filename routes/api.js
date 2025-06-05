router.get('/api/ongoing-results', async (req, res) => {
  try {
    const electionsRes = await db.query(`
      SELECT * FROM elections WHERE start_date <= NOW() AND end_date >= NOW()
    `);

    const results = [];

    for (const election of electionsRes.rows) {
      const positionsRes = await db.query(`
        SELECT * FROM positions WHERE election_id = $1
      `, [election.id]);

      const positions = [];

      for (const position of positionsRes.rows) {
        const candidatesRes = await db.query(`
          SELECT * FROM candidates WHERE position_id = $1 ORDER BY votes DESC
        `, [position.id]);

        const totalVotes = candidatesRes.rows.reduce((sum, c) => sum + c.votes, 0);

        const candidates = candidatesRes.rows.map(candidate => ({
          name: candidate.name,
          party: candidate.party || '',
          votes: candidate.votes,
          percentage: totalVotes ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0
        }));

        positions.push({
          title: position.name,
          totalVotes,
          candidates
        });
      }

      results.push({
        electionTitle: election.name,
        positions
      });
    }

    res.json({ success: true, results });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching real-time results' });
  }
});
