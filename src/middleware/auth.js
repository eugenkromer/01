const db = require('../db');

// Attaches req.user ({ email, role }) if the session has a logged-in email
// that still matches a known user. Always calls next().
function attachUser(req, res, next) {
  if (req.session && req.session.email) {
    const user = db.findUserByEmail(req.session.email);
    req.user = user || null;
    if (!user) req.session.email = null;
  } else {
    req.user = null;
  }
  res.locals.currentUser = req.user;
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.redirect('/admin/login');
  next();
}

// Full read+write access. Viewers are blocked with 403.
function requireAdmin(req, res, next) {
  if (!req.user) return res.redirect('/admin/login');
  if (req.user.role !== 'admin') {
    return res.status(403).render('admin/forbidden', { title: 'Read-only access' });
  }
  next();
}

module.exports = { attachUser, requireAuth, requireAdmin };
