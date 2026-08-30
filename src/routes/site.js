const express = require('express');
const db = require('../db');
const { sendMail } = require('../mailer');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function groupByCategory(items) {
  const groups = new Map();
  for (const item of items) {
    if (!groups.has(item.category)) groups.set(item.category, []);
    groups.get(item.category).push(item);
  }
  return Array.from(groups.entries()).map(([category, items]) => ({ category, items }));
}

router.get('/', (req, res) => {
  res.render('home', { title: 'Timeless Wedding Rentals - Tables, Chairs & Decor' });
});

router.get('/catalog', (req, res) => {
  res.render('catalog', {
    title: 'Rental Catalog',
    groups: groupByCategory(db.getItems()),
  });
});

async function handleRequest(req, res, { redirectTo }) {
  const customerName = (req.body.customerName || '').trim();
  const customerEmail = (req.body.customerEmail || '').trim();
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

  const request = db.createRequest({ customerName, customerEmail, eventDate, message, items });

  const admin = db.getAdminUser();
  if (admin) {
    const itemLines = items.length
      ? items.map((i) => `  - ${i.name} x${i.qty} ($${i.price.toFixed(2)} ${i.priceUnit})`).join('\n')
      : '  (no catalog items selected - general inquiry)';
    const estimatedTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    await sendMail({
      to: admin.email,
      subject: `New rental request from ${customerName}`,
      text: `You have a new rental request.\n\nName: ${customerName}\nEmail: ${customerEmail}\nEvent date: ${eventDate || 'not specified'}\n\nRequested items:\n${itemLines}\n${items.length ? `\nEstimated total: $${estimatedTotal.toFixed(2)} (excludes delivery/setup - confirm with the customer)\n` : ''}\nMessage:\n${message || '(none)'}\n`,
    });
  }

  res.render('request-thanks', { title: 'Thank You', request });
}

router.post('/request', (req, res) => handleRequest(req, res, { redirectTo: '/catalog' }));
router.post('/contact', (req, res) => handleRequest(req, res, { redirectTo: '/' }));

module.exports = router;
