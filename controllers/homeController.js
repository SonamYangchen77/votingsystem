const pool = require('../config/db');

exports.renderHomePage = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM elections
      WHERE end_date >= CURRENT_DATE
      ORDER BY start_date ASC
    `);

    const upcomingElections = result.rows; // Array of upcoming elections

    res.render('home', { upcomingElections });
  } catch (err) {
    console.error('Error fetching elections:', err);
    res.status(500).send('Error loading home page');
  }
};
