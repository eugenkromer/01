const express = require('express');
const db = require('../db');
const { sendMail } = require('../mailer');
const auditLogger = require('../auditLogger');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EVENT_TYPES = ['Wedding', 'Engagement Party', 'Anniversary', 'Birthday', 'Corporate Event', 'Other'];

function groupByCategory(items) {
  const groups = new Map();
  for (const item of items) {
    if (!groups.has(item.category)) groups.set(item.category, []);
    groups.get(item.category).push(item);
  }
  return Array.from(groups.entries()).map(([category, items]) => ({ category, items }));
}

router.get('/', (req, res) => {
  res.render('home', { title: 'Timeless Wedding & Event Rentals - Tables, Chairs & Decor', eventTypes: EVENT_TYPES });
});

router.get('/catalog', (req, res) => {
  res.render('catalog', {
    title: 'Rental Catalog',
    groups: groupByCategory(db.getItems()),
    settings: db.getSettings(),
    eventTypes: EVENT_TYPES,
  });
});

async function handleRequest(req, res) {
  const customerName = (req.body.customerName || '').trim();
  const customerEmail = (req.body.customerEmail || '').trim();
  const eventType = EVENT_TYPES.includes(req.body.eventType) ? req.body.eventType : 'Wedding';
  const eventDate = (req.body.eventDate || '').trim();
  const message = (req.body.message || '').trim();

  let selections = [];
  if (req.body.itemsJson) {
    try {
      selections = JSON.parse(req.body.itemsJson);
    } catch {
      selections = [];
    }
  }

  if (!customerName || !EMAIL_RE.test(customerEmail)) {
    return res.status(400).render('request-error', { title: 'Please check your details' });
  }

  // Look up authoritative name/price from the current catalog rather than
  // trusting whatever the browser sent.
  const catalogItems = db.getItems();
  const items = [];
  for (const sel of selections) {
    const qty = Number(sel.qty);
    if (!qty || qty <= 0) continue;
    const item = catalogItems.find((i) => i.id === sel.id);
    if (!item) continue;
    items.push({ itemId: item.id, name: item.name, qty, price: item.price, priceUnit: item.priceUnit });
  }

  const settings = db.getSettings();
  const request = db.createRequest({
    customerName,
    customerEmail,
    eventType,
    eventDate,
    message,
    items,
    cleaningFee: settings.cleaningFee,
    deliveryFee: settings.deliveryFee,
  });

  auditLogger.logDataAccess('RENTAL_REQUEST_CREATED', 'rental_request', request.id, customerEmail, 'success', {
    eventType,
    itemCount: items.length
  });

  const admin = db.getAdminUser();
  const emailPromises = [];

  if (admin) {
    const itemLines = items.length
      ? items.map((i) => `  - ${i.name} x${i.qty} ($${i.price.toFixed(2)} ${i.priceUnit})`).join('\n')
      : '  (no catalog items selected - general inquiry)';
    const feeLines = items.length
      ? `\nItems subtotal: $${request.itemsTotal.toFixed(2)}` +
        (request.cleaningFee ? `\nCleaning fee: $${request.cleaningFee.toFixed(2)}` : '') +
        (request.deliveryFee ? `\nDelivery fee: $${request.deliveryFee.toFixed(2)}` : '') +
        `\nEstimated total: $${request.total.toFixed(2)}\n`
      : '';

    emailPromises.push(
      sendMail({
        to: admin.email,
        subject: `New ${eventType.toLowerCase()} rental request from ${customerName}`,
        text: `You have a new rental request - review it in the admin dashboard and confirm it to notify the customer.\n\nName: ${customerName}\nEmail: ${customerEmail}\nEvent type: ${eventType}\nEvent date: ${eventDate || 'not specified'}\n\nRequested items:\n${itemLines}\n${feeLines}\nMessage:\n${message || '(none)'}\n`,
      })
    );
  }

  const customerItemLines = items.length
    ? items.map((i) => `  - ${i.name} x${i.qty}`).join('\n')
    : '';

  emailPromises.push(
    sendMail({
      to: customerEmail,
      subject: `We've received your ${eventType.toLowerCase()} rental request`,
      text: `Hi ${customerName},\n\nThanks for reaching out! Your request is now being reviewed - we'll email you again to confirm as soon as it's approved, along with a receipt.\n\n${items.length ? `What you requested:\n${customerItemLines}\n\nEstimated total (pending confirmation): $${request.total.toFixed(2)}\n\n` : ''}If anything changes in the meantime, just reply to this email.\n`,
    })
  );

  // Sent in parallel so a slow/failing SMTP server costs at most one
  // timeout, not one per email.
  await Promise.all(emailPromises);

  res.render('request-thanks', { title: 'Thank You', request });
}

router.post('/request', (req, res) => handleRequest(req, res));
router.post('/contact', (req, res) => handleRequest(req, res));

// Legal & Compliance Pages
router.get('/privacy', (req, res) => {
  res.render('privacy', { title: 'Privacy Policy' });
});

router.get('/terms', (req, res) => {
  res.render('terms', { title: 'Terms of Service' });
});

// GDPR Data Export (Art. 20)
router.get('/gdpr/export', (req, res) => {
  res.render('gdpr-export', { title: 'Data Export Request - GDPR' });
});

router.post('/gdpr/export', (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const format = req.body.format || 'json';

  if (!EMAIL_RE.test(email)) {
    return res.status(400).render('gdpr-export', {
      title: 'Data Export Request',
      error: 'Please provide a valid email address'
    });
  }

  const requests = db.getRequests().filter(r => r.customerEmail.toLowerCase() === email);
  auditLogger.logDataExport(email, format, requests.length, {
    requestCount: requests.length
  });

  if (format === 'json') {
    const data = {
      exportedAt: new Date().toISOString(),
      exportedBy: email,
      totalRecords: requests.length,
      requests
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="rental-data-${Date.now()}.json"`);
    return res.send(JSON.stringify(data, null, 2));
  } else if (format === 'csv') {
    let csv = 'Date Submitted,Event Type,Event Date,Items Requested,Total,Status\n';
    for (const req of requests) {
      const items = req.items.map(i => `${i.name} x${i.qty}`).join('; ');
      const row = [
        new Date(req.createdAt).toLocaleDateString(),
        req.eventType,
        req.eventDate || 'Not specified',
        items || 'None',
        `$${req.total.toFixed(2)}`,
        req.status
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      csv += row + '\n';
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="rental-data-${Date.now()}.csv"`);
    return res.send(csv);
  }

  res.status(400).render('gdpr-export', {
    title: 'Data Export Request',
    error: 'Invalid format selected'
  });
});

// GDPR Data Deletion (Art. 17)
router.get('/gdpr/delete', (req, res) => {
  res.render('gdpr-delete', { title: 'Data Deletion Request - GDPR' });
});

router.post('/gdpr/delete', async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const confirm = req.body.confirm === 'on';

  if (!EMAIL_RE.test(email) || !confirm) {
    return res.status(400).render('gdpr-delete', {
      title: 'Data Deletion Request',
      error: 'Please provide a valid email and confirm the deletion'
    });
  }

  const requests = db.getRequests();
  const beforeCount = requests.length;
  const filtered = requests.filter(r => r.customerEmail.toLowerCase() !== email);
  const deletedCount = beforeCount - filtered.length;

  if (deletedCount > 0) {
    db.saveRequests(filtered);
  }

  auditLogger.logDataDeletion(email, 'rental_requests', deletedCount, {
    confirmation: 'user_requested'
  });

  const admin = db.getAdminUser();
  if (admin) {
    await sendMail({
      to: admin.email,
      subject: 'Data Deletion Request - GDPR Art. 17',
      text: `A data deletion request was submitted.\n\nEmail: ${email}\nRecords deleted: ${deletedCount}\nReason: ${req.body.reason || 'Not specified'}\nTimestamp: ${new Date().toISOString()}\n`
    });
  }

  res.render('gdpr-delete-confirmation', {
    title: 'Deletion Requested',
    email,
    deletedCount
  });
});

module.exports = router;
