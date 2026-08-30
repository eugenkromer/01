const express = require('express');
const db = require('../db');
const { sendMail } = require('../mailer');

const router = express.Router();

const LOGIN_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/admin');
  res.render('admin/login', { title: 'Admin Login', sent: false, error: null });
});

router.post('/login', async (req, res) => {
  const email = (req.body.email || '').trim();

  if (!EMAIL_RE.test(email)) {
    return res.render('admin/login', { title: 'Admin Login', sent: false, error: 'Please enter a valid email address.' });
  }

  const user = db.findUserByEmail(email);

  // Always show the same "check your email" message, whether or not the
  // address is a known admin/viewer - avoids revealing who has access.
  if (user) {
    const token = db.createToken({ type: 'login', email: user.email, ttlMs: LOGIN_TOKEN_TTL_MS });
    const link = `${process.env.BASE_URL || 'http://localhost:3000'}/admin/login/verify?token=${token.token}`;
    await sendMail({
      to: user.email,
      subject: 'Your admin login link',
      text: `Click this link to log in to the admin area:\n\n${link}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.`,
    });
  }

  res.render('admin/login', { title: 'Admin Login', sent: true, error: null });
});

router.get('/login/verify', (req, res) => {
  const tokenValue = req.query.token;
  const token = tokenValue ? db.findValidToken(tokenValue, 'login') : null;

  if (!token) {
    return res.render('admin/login', {
      title: 'Admin Login',
      sent: false,
      error: 'This login link is invalid or has expired. Please request a new one below.',
    });
  }

  db.markLoginTokenUsed(tokenValue);
  req.session.email = token.email;
  res.redirect('/admin');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
