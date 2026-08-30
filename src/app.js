const path = require('path');
const express = require('express');
const session = require('express-session');

const db = require('./db');
const { attachUser } = require('./middleware/auth');
const siteRoutes = require('./routes/site');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

db.ensureSeedUser(process.env.SEED_ADMIN_EMAIL || 'eugenkromer@hv-manager.de');
db.ensureSeedItems();
db.pruneExpiredTokens();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

app.use(attachUser);

app.use('/', siteRoutes);
app.use('/admin', authRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('not-found', { title: 'Page Not Found' });
});

module.exports = app;
