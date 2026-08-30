const path = require('path');
const ejs = require('ejs');
const express = require('express');
const db = require('../db');
const { sendMail } = require('../mailer');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { handleUpload } = require('../upload');

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

function dashboardData(req) {
  return {
    title: 'Admin Dashboard',
    groups: groupByCategory(db.getItems()),
    requests: db.getRequests().slice(0, 50),
    settings: db.getSettings(),
    pendingTransfer: req.user.role === 'admin' ? db.getPendingTransferFor(req.user.email) : null,
    smtpConfigured: require('../mailer').smtpConfigured,
    transferError: null,
    settingsError: null,
  };
}

// ---------- Dashboard ----------

router.get('/', requireAuth, (req, res) => {
  res.render('admin/dashboard', dashboardData(req));
});

// ---------- Catalog items (admin write access only) ----------

router.get('/items/new', requireAdmin, (req, res) => {
  res.render('admin/item-form', { title: 'Add Item', item: null, error: null });
});

router.post('/items', requireAdmin, async (req, res) => {
  try {
    await handleUpload(req, res);
  } catch (err) {
    return res.render('admin/item-form', { title: 'Add Item', item: req.body, error: err.message });
  }
  const { name, category, description, dimensions, price, priceUnit, stock, imageUrl } = req.body;
  if (!name || !category || price === undefined || price === '') {
    return res.render('admin/item-form', {
      title: 'Add Item',
      item: req.body,
      error: 'Name, category, and price are required.',
    });
  }
  const finalImageUrl = req.file ? `/uploads/${req.file.filename}` : imageUrl;
  db.createItem({ name, category, description, dimensions, price, priceUnit, stock, imageUrl: finalImageUrl });
  res.redirect('/admin#catalog');
});

router.get('/items/:id/edit', requireAdmin, (req, res) => {
  const item = db.getItem(req.params.id);
  if (!item) return res.redirect('/admin#catalog');
  res.render('admin/item-form', { title: 'Edit Item', item, error: null });
});

router.post('/items/:id/update', requireAdmin, async (req, res) => {
  try {
    await handleUpload(req, res);
  } catch (err) {
    return res.render('admin/item-form', { title: 'Edit Item', item: { ...req.body, id: req.params.id }, error: err.message });
  }
  const { name, category, description, dimensions, price, priceUnit, stock, imageUrl } = req.body;
  if (!name || !category || price === undefined || price === '') {
    return res.render('admin/item-form', {
      title: 'Edit Item',
      item: { ...req.body, id: req.params.id },
      error: 'Name, category, and price are required.',
    });
  }
  // Keep the existing photo unless a new file was uploaded or a new URL was
  // typed in - an empty form field here should not wipe out a good photo.
  const existing = db.getItem(req.params.id);
  const finalImageUrl = req.file ? `/uploads/${req.file.filename}` : imageUrl || (existing ? existing.imageUrl : '');
  db.updateItem(req.params.id, { name, category, description, dimensions, price, priceUnit, stock, imageUrl: finalImageUrl });
  res.redirect('/admin#catalog');
});

router.post('/items/:id/delete', requireAdmin, (req, res) => {
  db.deleteItem(req.params.id);
  res.redirect('/admin#catalog');
});

// ---------- Rental requests ----------

router.post('/requests/:id/confirm', requireAdmin, async (req, res) => {
  const request = db.confirmRequest(req.params.id);
  if (request) {
    const itemLines = request.items.length
      ? request.items.map((i) => `  - ${i.name} x${i.qty} ($${i.price.toFixed(2)} each = $${(i.price * i.qty).toFixed(2)})`).join('\n')
      : '';
    const feeLines =
      (request.cleaningFee ? `\nCleaning fee: $${request.cleaningFee.toFixed(2)}` : '') +
      (request.deliveryFee ? `\nDelivery fee: $${request.deliveryFee.toFixed(2)}` : '') +
      (request.items.length ? `\nTotal: $${request.total.toFixed(2)}` : '');

    const orderNumber = request.id.slice(0, 8).toUpperCase();
    const confirmedDate = new Date(request.confirmedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let html;
    if (request.items.length) {
      html = await ejs.renderFile(path.join(__dirname, '..', '..', 'views', 'emails', 'receipt.ejs'), {
        request,
        orderNumber,
        confirmedDate,
      });
    }

    await sendMail({
      to: request.customerEmail,
      subject: `Receipt: your ${request.eventType.toLowerCase()} rental order is confirmed`,
      text: `Hi ${request.customerName},\n\nGreat news - your rental order is confirmed! We'll bring the following to your event${request.eventDate ? ` on ${request.eventDate}` : ''}:\n\n${itemLines || '(details as discussed)'}\n${feeLines}\n\nOrder #${orderNumber}\n\nIf anything needs to change, just reply to this email.\n`,
      html,
    });
  }
  res.redirect('/admin#requests');
});

// ---------- Fee settings ----------

router.post('/settings', requireAdmin, (req, res) => {
  db.updateSettings({ cleaningFee: req.body.cleaningFee, deliveryFee: req.body.deliveryFee });
  res.redirect('/admin#settings');
});

// ---------- Admin handover ----------

router.post('/transfer', requireAdmin, (req, res) => {
  const newAdminEmail = (req.body.newAdminEmail || '').trim();
  if (!EMAIL_RE.test(newAdminEmail)) {
    return res.render('admin/dashboard', { ...dashboardData(req), transferError: 'Please enter a valid email address.' });
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

  await Promise.all([
    sendMail({
      to: newAdminEmail,
      subject: 'You have been offered admin control of the wedding rental site',
      text: `${req.user.email} wants to hand over admin control of the wedding rental website to you.\n\nAs the admin, you will manage the catalog and receive rental request emails.\n\nTo accept, open this link:\n${acceptLink}\n\nThis link expires in 7 days. If you don't recognize this, you can ignore this email.`,
    }),
    sendMail({
      to: req.user.email,
      subject: 'Handover request sent',
      text: `We sent an invitation to ${newAdminEmail} to take over as admin. Nothing changes until they accept it - you'll get an email as soon as they do.`,
    }),
  ]);

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

  await Promise.all([
    sendMail({
      to: token.fromEmail,
      subject: 'Admin control has been transferred',
      text: `${token.email} has accepted admin control of the wedding rental website. You now have read-only access - you can still view the catalog and request history, but rental request emails will now go to ${token.email}.`,
    }),
    sendMail({
      to: token.email,
      subject: 'You are now the admin',
      text: `You are now the admin of the wedding rental website. New rental requests will be emailed to this address (${token.email}), and you can manage the catalog from the admin dashboard.`,
    }),
  ]);

  req.session.save(() => res.redirect('/admin'));
});

module.exports = router;
