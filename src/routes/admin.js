const express = require('express');
const db = require('../db');
const { sendMail } = require('../mailer');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const TRANSFER_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function groupByCategory(items) {
  const groups = new Map();
  for (const item of items) {
    if (!groups.has(item.category)) groups.set(item.category, []);
    groups.get(item.category).push(item);
  }
  return Array.from(groups.entries()).map(([category, items]) => ({ category, items }));
}

// ---------- Dashboard ----------

router.get('/', requireAuth, (req, res) => {
  const items = db.getItems();
  const requests = db.getRequests().slice(0, 50);
  const pendingTransfer = req.user.role === 'admin' ? db.getPendingTransferFor(req.user.email) : null;

  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    groups: groupByCategory(items),
    requests,
    pendingTransfer,
    smtpConfigured: require('../mailer').smtpConfigured,
  });
});

// ---------- Catalog items (admin write access only) ----------

router.get('/items/new', requireAdmin, (req, res) => {
  res.render('admin/item-form', { title: 'Add Item', item: null, error: null });
});

router.post('/items', requireAdmin, (req, res) => {
  const { name, category, description, dimensions, price, priceUnit, stock, imageUrl } = req.body;
  if (!name || !category || price === undefined || price === '') {
    return res.render('admin/item-form', {
      title: 'Add Item',
      item: req.body,
      error: 'Name, category, and price are required.',
    });
  }
  db.createItem({ name, category, description, dimensions, price, priceUnit, stock, imageUrl });
  res.redirect('/admin#catalog');
});

router.get('/items/:id/edit', requireAdmin, (req, res) => {
  const item = db.getItem(req.params.id);
  if (!item) return res.redirect('/admin#catalog');
  res.render('admin/item-form', { title: 'Edit Item', item, error: null });
});

router.post('/items/:id/update', requireAdmin, (req, res) => {
  const { name, category, description, dimensions, price, priceUnit, stock, imageUrl } = req.body;
  if (!name || !category || price === undefined || price === '') {
    return res.render('admin/item-form', {
      title: 'Edit Item',
      item: { ...req.body, id: req.params.id },
      error: 'Name, category, and price are required.',
    });
  }
  db.updateItem(req.params.id, { name, category, description, dimensions, price, priceUnit, stock, imageUrl });
  res.redirect('/admin#catalog');
});

router.post('/items/:id/delete', requireAdmin, (req, res) => {
  db.deleteItem(req.params.id);
  res.redirect('/admin#catalog');
});

// ---------- Admin handover ----------

router.post('/transfer', requireAdmin, (req, res) => {
  const newAdminEmail = (req.body.newAdminEmail || '').trim();
  if (!EMAIL_RE.test(newAdminEmail)) {
    return res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      groups: groupByCategory(db.getItems()),
      requests: db.getRequests().slice(0, 50),
      pendingTransfer: db.getPendingTransferFor(req.user.email),
      smtpConfigured: require('../mailer').smtpConfigured,
      transferError: 'Please enter a valid email address.',
    });
  }
  if (newAdminEmail.toLowerCase() === req.user.email.toLowerCase()) {
    return res.redirect('/admin');
  }
  res.render('admin/transfer-confirm', { title: 'Confirm Handover', newAdminEmail });
});

router.post('/transfer/confirm', requireAdmin, async (req, res) => {
  const newAdminEmail = (req.body.newAdminEmail || '').trim();
  if (!EMAIL_RE.test(newAdminEmail)) return res.redirect('/admin');

  const token = db.createToken({
    type: 'transfer',
    email: newAdminEmail.toLowerCase(),
    fromEmail: req.user.email,
    ttlMs: TRANSFER_TOKEN_TTL_MS,
  });
  const acceptLink = `${process.env.BASE_URL || 'http://localhost:3000'}/admin/transfer/accept?token=${token.token}`;

  await sendMail({
    to: newAdminEmail,
    subject: 'You have been offered admin control of the wedding rental site',
    text: `${req.user.email} wants to hand over admin control of the wedding rental website to you.\n\nAs the admin, you will manage the catalog and receive rental request emails.\n\nTo accept, open this link:\n${acceptLink}\n\nThis link expires in 7 days. If you don't recognize this, you can ignore this email.`,
  });

  await sendMail({
    to: req.user.email,
    subject: 'Handover request sent',
    text: `We sent an invitation to ${newAdminEmail} to take over as admin. Nothing changes until they accept it - you'll get an email as soon as they do.`,
  });

  res.render('admin/transfer-sent', { title: 'Handover Sent', newAdminEmail });
});

// Public: the invited person may not be logged in yet.
router.get('/transfer/accept', (req, res) => {
  const token = req.query.token ? db.findValidToken(req.query.token, 'transfer') : null;
  if (!token) {
    return res.render('admin/transfer-invalid', { title: 'Invalid Invitation' });
  }
  res.render('admin/transfer-accept', { title: 'Accept Admin Control', token });
});

router.post('/transfer/accept', async (req, res) => {
  const tokenValue = req.body.token;
  const token = tokenValue ? db.findValidToken(tokenValue, 'transfer') : null;
  if (!token) {
    return res.render('admin/transfer-invalid', { title: 'Invalid Invitation' });
  }

  db.upsertUser(token.email, 'admin');
  db.upsertUser(token.fromEmail, 'viewer');
  db.markTransferAccepted(tokenValue);
  req.session.email = token.email;

  await sendMail({
    to: token.fromEmail,
    subject: 'Admin control has been transferred',
    text: `${token.email} has accepted admin control of the wedding rental website. You now have read-only access - you can still view the catalog and request history, but rental request emails will now go to ${token.email}.`,
  });
  await sendMail({
    to: token.email,
    subject: 'You are now the admin',
    text: `You are now the admin of the wedding rental website. New rental requests will be emailed to this address (${token.email}), and you can manage the catalog from the admin dashboard.`,
  });

  req.session.save(() => res.redirect('/admin'));
});

module.exports = router;
