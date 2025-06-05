const db = require('../config/db'); // PostgreSQL client connection

// Admin Dashboard - Fetch total voters and active elections
const getAdminDashboard = (req, res) => {
  const electionQuery = `
    SELECT COUNT(*) AS active_elections 
    FROM elections 
    WHERE CURRENT_DATE BETWEEN start_date AND end_date`;

  const voterQuery = `SELECT COUNT(*) AS total_voters FROM users`;

  db.query(electionQuery, (err, electionResult) => {
    if (err) {
      console.error('Error fetching active elections:', err);
      return res.status(500).send('Error fetching active elections.');
    }

    db.query(voterQuery, (err, voterResult) => {
      if (err) {
        console.error('Error fetching total voters:', err);
        return res.status(500).send('Error fetching total voters.');
      }

      const activeElections = electionResult.rows[0].active_elections;
      const totalVoters = voterResult.rows[0].total_voters;
      const message = req.query.message || null;

      res.render('admin/dashboard', {
        activeElections,
        totalVoters,
        pendingApprovals: 0,    // Placeholder
        totalVotes: 0,          // Placeholder
        recentActivities: [],   // Placeholder
        message
      });
    });
  });
};

// ✅ Admin Logout Controller
const logoutAdmin = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/admin/dashboard');
    }

    // ✅ Render the index page after logout
    res.render('index', { message: 'You have been logged out successfully.' });
  });
};


module.exports = {
  getAdminDashboard,
  logoutAdmin
};
