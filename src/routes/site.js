const express = require('express');
const db = require('../db');
const { sendMail } = require('../mailer');

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

  const admin = db.getAdminUser();
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

    await sendMail({
      to: admin.email,
      subject: `New ${eventType.toLowerCase()} rental request from ${customerName}`,
      text: `You have a new rental request - review it in the admin dashboard and confirm it to notify the customer.\n\nName: ${customerName}\nEmail: ${customerEmail}\nEvent type: ${eventType}\nEvent date: ${eventDate || 'not specified'}\n\nRequested items:\n${itemLines}\n${feeLines}\nMessage:\n${message || '(none)'}\n`,
    });
  }

  res.render('request-thanks', { title: 'Thank You', request });
}

router.post('/request', (req, res) => handleRequest(req, res));
router.post('/contact', (req, res) => handleRequest(req, res));

module.exports = router;
