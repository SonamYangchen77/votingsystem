const pool = require('../config/db');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// List all elections
exports.listElections = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM elections ORDER BY id DESC');
    res.render('admin/adminElection', { elections: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Create new election with optional CSV for eligible voters
exports.createElection = async (req, res) => {
  const { name, description, startDate, endDate } = req.body;
  const file = req.file?.filename;

  try {
    // 1. Create the election
    const result = await pool.query(
      `INSERT INTO elections (name, description, start_date, end_date)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [name, description, startDate, endDate]
    );

    const electionId = result.rows[0].id;

    // 2. If file uploaded, process eligible voters
    if (file) {
      const filePath = path.join(__dirname, '..', 'uploads', file);
      const eligibleVoters = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
          const studentId = row.student_id?.trim(); // Adjust header as needed
          if (!studentId) return;

          try {
            const userRes = await pool.query(
              'SELECT id FROM users WHERE student_id = $1',
              [studentId]
            );

            if (userRes.rows.length > 0) {
              eligibleVoters.push({
                user_id: userRes.rows[0].id,
                student_id: studentId
              });
            }
          } catch (err) {
            console.warn(`User fetch failed for student_id ${studentId}:`, err.message);
          }
        })
        .on('end', async () => {
          try {
            const insertPromises = eligibleVoters.map(({ user_id, student_id }) =>
              pool.query(
                `INSERT INTO eligible_voters (election_id, user_id, student_id)
                 VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
                [electionId, user_id, student_id]
              )
            );

            await Promise.all(insertPromises);
            console.log('✅ Eligible voters inserted.');
          } catch (err) {
            console.error('❌ Error inserting eligible voters:', err);
          }
        });
    }

    res.redirect('/admin/adminElection');
  } catch (err) {
    console.error('❌ Error creating election:', err);
    res.status(500).send('Failed to create election');
  }
};

// Render edit form
exports.renderEditElection = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM elections WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Election not found');
    }
    res.render('editElection', { election: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Update election
exports.updateElection = async (req, res) => {
  const id = req.params.id;
  const { name, description, startDate, endDate } = req.body;
  try {
    await pool.query(
      `UPDATE elections 
       SET name = $1, description = $2, start_date = $3, end_date = $4
       WHERE id = $5`,
      [name, description, startDate, endDate, id]
    );
    res.redirect('/admin/adminElection');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update election');
  }
};

// Delete election
exports.deleteElection = async (req, res) => {
  const electionId = req.params.id;

  try {
    await pool.query('DELETE FROM candidates WHERE election_id = $1', [electionId]);
    await pool.query('DELETE FROM elections WHERE id = $1', [electionId]);

    res.redirect('/admin/adminElection?message=Election deleted successfully');
  } catch (error) {
    console.error('Error deleting election:', error);
    res.status(500).send('Failed to delete election: ' + error.message);
  }
};
