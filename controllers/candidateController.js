const pool = require('../config/db');

// Admin: Get all candidates grouped by election
// Admin: Get all candidates grouped by election with vote counts
exports.getAdminCandidates = async (req, res) => {
  try {
    const [candidatesResult, electionsResult] = await Promise.all([
      pool.query(`
        SELECT 
          c.*, 
          COUNT(v.id) AS vote_count
        FROM candidates c
        LEFT JOIN votes v ON c.id = v.candidate_id
        GROUP BY c.id
        ORDER BY c.id
      `),
      pool.query('SELECT id, name FROM elections')
    ]);

    const candidates = candidatesResult.rows || [];
    const elections = electionsResult.rows || [];

    let groupedCandidates = {};
    elections.forEach(election => {
      groupedCandidates[election.name] = candidates.filter(c => c.election_id === election.id);
    });

    res.render('admin/adminCandidate', {
      groupedCandidates,
      elections,
      message: req.flash('message'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Error in getAdminCandidates:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Admin: Add a new candidate
exports.addCandidate = async (req, res) => {
  try {
    const { full_name, position, course, year, manifesto, election_id } = req.body;

    if (!req.file) {
      req.flash('error', 'Candidate image is required.');
      return res.redirect('/admin/adminCandidate');
    }

    const candidate_image_url = `/uploads/${req.file.filename}`;

    const electionRes = await pool.query('SELECT name FROM elections WHERE id = $1', [election_id]);
    const election_name = electionRes.rows[0]?.name || null;

    await pool.query(`
      INSERT INTO candidates (
        full_name, position, course, year, manifesto,
        election_id, election_name, candidate_image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      full_name, position, course, year, manifesto,
      election_id, election_name, candidate_image_url
    ]);

    req.flash('message', 'Candidate added successfully!');
    res.redirect('/admin/adminCandidate');
  } catch (err) {
    console.error('Error adding candidate:', err);
    req.flash('error', 'Error adding candidate');
    res.redirect('/admin/adminCandidate');
  }
};

// Admin: Show edit form
exports.showEditForm = async (req, res) => {
  try {
    const candidateId = req.params.id;
    const candidateResult = await pool.query('SELECT * FROM candidates WHERE id = $1', [candidateId]);

    if (candidateResult.rows.length === 0) {
      return res.status(404).send('Candidate not found');
    }

    const electionsResult = await pool.query('SELECT id, name FROM elections');

    res.render('admin/editCandidate', {
      candidate: candidateResult.rows[0],
      elections: electionsResult.rows
    });
  } catch (error) {
    console.error('Error in showEditForm:', error);
    res.status(500).send('Server error');
  }
};

// Admin: Update candidate
exports.updateCandidate = async (req, res) => {
  try {
    const { full_name, position, course, year, manifesto, election_name } = req.body;
    const candidateId = req.params.id;

    const electionRes = await pool.query('SELECT id FROM elections WHERE name = $1', [election_name]);
    const election_id = electionRes.rows[0]?.id || null;

    const candidate_image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const query = `
      UPDATE candidates
      SET
        full_name = COALESCE($1, full_name),
        position = COALESCE($2, position),
        course = COALESCE($3, course),
        year = COALESCE($4, year),
        manifesto = COALESCE($5, manifesto),
        election_id = COALESCE($6, election_id),
        election_name = COALESCE($7, election_name),
        candidate_image_url = COALESCE($8, candidate_image_url)
      WHERE id = $9
    `;

    const values = [
      full_name || null,
      position || null,
      course || null,
      year || null,
      manifesto || null,
      election_id,
      election_name,
      candidate_image_url,
      candidateId
    ];

    await pool.query(query, values);
    req.flash('message', 'Candidate updated successfully!');
    res.redirect('/admin/adminCandidate');
  } catch (err) {
    console.error('Error updating candidate:', err);
    req.flash('error', 'Error updating candidate');
    res.redirect('/admin/adminCandidate');
  }
};

// Admin: Delete candidate
exports.deleteCandidate = async (req, res) => {
  const { candidateId } = req.body;

  if (!candidateId) {
    return res.status(400).json({ error: 'Candidate ID is required' });
  }

  try {
    const result = await pool.query('DELETE FROM candidates WHERE id = $1', [candidateId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    req.flash('message', 'Candidate deleted successfully!');
    return res.redirect('/admin/adminCandidate');
  } catch (err) {
    console.error('Error deleting candidate:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Public: Get all candidates
exports.getAllCandidates = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM candidates');
    const candidates = result.rows || [];
    res.render('candidate', {
      candidates,
      selectedPosition: null
    });
  } catch (error) {
    console.error('Error in getAllCandidates:', error);
    res.status(500).send('Server error');
  }
};

// Public: Get candidates by election
exports.getCandidatesByElection = async (req, res) => {
  try {
    const electionName = req.params.electionName;
    const result = await pool.query('SELECT * FROM candidates WHERE election_name = $1', [electionName]);
    const candidates = result.rows || [];
    res.render('candidate', {
      candidates,
      selectedPosition: electionName
    });
  } catch (error) {
    console.error('Error in getCandidatesByElection:', error);
    res.status(500).send('Server error');
  }
};

// Admin: Get positions by election (used in frontend dynamic dropdown)
exports.getPositionsByElection = async (req, res) => {
  const electionId = req.params.electionId;
  try {
    const result = await pool.query('SELECT id, name FROM positions WHERE election_id = $1', [electionId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching positions:', err);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
};

