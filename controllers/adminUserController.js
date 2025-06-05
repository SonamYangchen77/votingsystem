const pool = require('../config/db');  // Your Postgres connection pool

// Fetch all users and render adminUser page
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, department, year, status FROM users ORDER BY id DESC'
    );
    console.log('Users fetched:', result.rows);
    const users = result.rows;
    res.render('adminUser', { users, message: req.flash('message'), error: req.flash('error') });
  } catch (err) {
    console.error('Error fetching users:', err);
    req.flash('error', 'Unable to fetch users');
    res.render('adminUser', { users: [], message: null, error: req.flash('error') });
  }
};

// Delete user by ID and redirect back to adminUser page
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    req.flash('message', 'User deleted successfully');
    res.redirect('/admin/adminUser');
  } catch (err) {
    console.error('Error deleting user:', err);
    req.flash('error', 'Failed to delete user');
    res.redirect('/admin/adminUser');
  }
};

module.exports = {
  getUsers,
  deleteUser,
};
