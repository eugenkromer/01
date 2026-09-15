const path = require('path');
const express = require('express');
const session = require('express-session');

const db = require('./db');
const content = require('./content');
const format = require('./format');
const { emailConfigured } = require('./mailer');
const { attachUser } = require('./middleware/auth');

const siteRoutes = require('./routes/site');
const authRoutes = require('./routes/auth');
const portalRoutes = require('./routes/portal');
const adminRoutes = require('./routes/admin');

db.ensureSeedAdmin(process.env.SEED_ADMIN_EMAIL || 'info@fahrschule-nusser.de');
db.pruneExpiredTokens();

// Vorführmodus: Damit lässt sich das Portal ohne eingerichteten
// E-Mail-Versand betreten - auf der Anmeldeseite stehen dann alle
// Zugänge zum Anklicken. Das ist nur für Vorführungen gedacht und muss im
// echten Betrieb ausgeschaltet bleiben, weil sonst jeder Besucher in
// jedes Konto käme.
const demoMode = process.env.DEMO_MODE === 'true';
if (demoMode) {
  console.warn('');
  console.warn('  ACHTUNG: Der Vorführmodus ist eingeschaltet (DEMO_MODE=true).');
  console.warn('  Jeder Besucher kann sich ohne E-Mail in jedes Konto einloggen.');
  console.warn('  Für den echten Betrieb DEMO_MODE entfernen oder auf false setzen.');
  console.warn('');
}

const app = express();

// Hosting-Plattformen beenden TLS in einem vorgelagerten Proxy und
// reichen intern einfaches HTTP weiter. Ohne diese Zeile erkennt Express
// nicht, dass die Anfrage eigentlich über HTTPS kam.
app.set('trust proxy', 1);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'nur-fuer-die-entwicklung-bitte-aendern',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Tage
    },
  })
);

app.use(attachUser);

// In jeder View verfügbar, damit die Partials nicht bei jedem render()
// erneut durchgereicht werden müssen.
app.use((req, res, next) => {
  res.locals.content = content;
  res.locals.f = format;
  res.locals.emailConfigured = emailConfigured;
  res.locals.demoMode = demoMode;
  res.locals.currentPath = req.path;
  next();
});

app.use('/', siteRoutes);
app.use('/portal', authRoutes);
app.use('/portal', portalRoutes);
app.use('/portal/verwaltung', adminRoutes);

app.use((req, res) => {
  res.status(404).render('site/not-found', { title: 'Seite nicht gefunden' });
});

// Letzte Auffanglinie: ein Fehler in einer Route soll eine verständliche
// Seite zeigen statt eines nackten Stacktrace.
app.use((err, req, res, next) => {
  console.error('[server] Unerwarteter Fehler:', err);
  res.status(500).render('site/error', { title: 'Es ist ein Fehler aufgetreten' });
});

module.exports = app;
