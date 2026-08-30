// Sends outgoing emails (login links, admin handover, quote request
// notifications). If SMTP_* environment variables are not configured, falls
// back to logging the email to the console and appending it to
// data/outbox.log so the whole flow can still be tested locally without a
// real mail account. See .env.example for how to configure a real provider.

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const OUTBOX_LOG = path.join(__dirname, '..', 'data', 'outbox.log');

const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
if (smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function logToOutbox({ to, subject, text }) {
  const entry = `\n----- ${new Date().toISOString()} -----\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`;
  fs.mkdirSync(path.dirname(OUTBOX_LOG), { recursive: true });
  fs.appendFileSync(OUTBOX_LOG, entry);
  // Printed in full (not just a summary) because on a hosted platform like
  // Render there is usually no file browser for the free tier - the
  // platform's live log stream is the only place to actually read this.
  console.log(`[mailer] SMTP not configured - email NOT delivered, only logged below.\n${entry}`);
}

async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    logToOutbox({ to, subject, text: text || html });
    return { delivered: false };
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Wedding Rentals <no-reply@example.com>',
    to,
    subject,
    text,
    html,
  });
  return { delivered: true };
}

module.exports = { sendMail, smtpConfigured };
