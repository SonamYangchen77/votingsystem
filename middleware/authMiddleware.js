const isAdmin = (req, res, next) => {
  console.log('Session Data:', req.session.user); // Log session data
  if (req.session && req.session.user?.role === 'admin') {
    return next();
  }
  res.status(403).send('Access denied.');
};

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/index');
};

module.exports = { isAuthenticated, isAdmin };
