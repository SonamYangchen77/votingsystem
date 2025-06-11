const express = require('express');
const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const fs = require('fs');
const db = require('./config/db');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const emitLiveResults = require('./utils/liveResultsEmitter');

// Models with table creation logic
const Election = require('./models/Election');
const User = require('./models/User');
const Vote = require('./models/voteModel');
const Candidate = require('./models/Candidate');

dotenv.config();

// Ensure required folders exist
const uploadDir = path.join(__dirname, 'uploads', 'voters');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// View engine and static folders
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session and middleware
app.set('trust proxy', 1);
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    secure: false,
  }
}));
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Flash + session logger
app.use((req, res, next) => {
  res.locals.message = req.flash('message');
  res.locals.error = req.flash('error');
  console.log(`Incoming: ${req.method} ${req.url}`);
  console.log('Session:', req.session);
  next();
});

// DB Table Creation + Safe Alter Table for full_name and candidate_image_url
(async () => {
  try {
    await User.createTable();
    await Candidate.createTable();
    await Election.createTable();
    await Vote.createTables();
    await Position.createTable();

    // ✅ Ensure required columns exist in candidates table
    const requiredColumns = [
      { name: 'full_name', definition: `VARCHAR(100) NOT NULL DEFAULT ''` },
      { name: 'candidate_image_url', definition: `VARCHAR(255)` },
      { name: 'course', definition: `VARCHAR(100)` }
    ];

    for (const col of requiredColumns) {
      const check = await db.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='candidates' AND column_name=$1
      `, [col.name]);

      if (check.rowCount === 0) {
        await db.query(`ALTER TABLE candidates ADD COLUMN ${col.name} ${col.definition}`);
        console.log(`✅ Added missing column '${col.name}' to candidates table.`);
      } else {
        console.log(`✅ Column '${col.name}' already exists.`);
      }
    }

    console.log('✅ All required DB tables and columns are ready.');

    // Load routes after DB is ready
    const authRoutes = require('./routes/authRoutes');
    const homeRoutes = require('./routes/homeRoutes');
    const adminRoutes = require('./routes/adminRoutes');
    const contactRoutes = require('./routes/contactRoutes');
    const candidateRoutes = require('./routes/candidateRoutes');
    const adminElectionRoutes = require('./routes/adminElectionRoutes');
    const electionRoutes = require('./routes/electionRoutes');
    const voteRoutes = require('./routes/voteRoutes');

    // Mount routes
    app.use('/', homeRoutes);
    app.use('/auth', authRoutes);
    app.use('/admin', adminRoutes);
    app.use('/admin', adminElectionRoutes);
    app.use('/election', electionRoutes);
    app.use('/', contactRoutes);
    app.use('/', candidateRoutes);
    app.use('/', voteRoutes);

    // Custom views
    app.get('/candidate', (req, res) => res.render('candidate'));
    app.get('/about', (req, res) => res.render('about'));
    app.get('/guideline', (req, res) => res.render('guideline'));
    app.get('/instruction', (req, res) => res.render('instruction'));
    app.get('/result', (req, res) => res.render('result'));
    app.get('/upcoming', require('./controllers/electionController').getUpcomingElections);
    app.get('/past', require('./controllers/electionController').getPastElections);

    // API & filtered view
    app.get('/api/candidates', async (req, res) => {
      try {
        const result = await db.query('SELECT * FROM candidates ORDER BY id DESC');
        res.json(result.rows);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching candidates' });
      }
    });

    app.get('/candidates/president', async (req, res) => {
      try {
        const result = await db.query(`
          SELECT candidates.*, elections.name AS election_name
          FROM candidates
          JOIN elections ON candidates.election_id = elections.id
          WHERE candidates.position = 'President' AND elections.name = 'FINA'
        `);
        res.render('candidates/Fina/president', { candidates: result.rows });
      } catch (error) {
        console.error('Error loading FINA president candidates:', error);
        res.status(500).render('error', { message: 'Unable to load candidates' });
      }
    });

    app.get('/', (req, res) => res.render('index'));
    app.get('/signup', (req, res) => res.render('index', { title: 'Sign Up - UniVote' }));

    // Socket.IO for live results
    io.on('connection', (socket) => {
      console.log('A user connected via Socket.IO');
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });

    // Live update interval
    setInterval(() => emitLiveResults(io), 5000);

    // Start server
    const PORT = process.env.PORT || 3000;
    http.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Failed during DB setup:', err);
    process.exit(1);
  }
})();
