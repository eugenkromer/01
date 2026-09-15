const db = require('../db');

// Hängt req.user an, wenn die Sitzung eine bekannte E-Mail-Adresse trägt.
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

// Jeder angemeldete Nutzer (Fahrschüler oder Fahrschule).
function requireLogin(req, res, next) {
  if (!req.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/portal/login');
  }
  next();
}

// Nur die Fahrschule selbst.
function requireAdmin(req, res, next) {
  if (!req.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/portal/login');
  }
  if (req.user.role !== 'admin') {
    return res.status(403).render('portal/forbidden', { title: 'Kein Zugriff' });
  }
  next();
}

module.exports = { attachUser, requireLogin, requireAdmin };
