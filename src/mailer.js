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
    // Nodemailer's defaults wait up to 2 minutes before giving up on a
    // connection - that would leave the customer staring at a spinner if
    // the SMTP host/port is wrong or blocked. Fail fast instead.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
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
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Wedding Rentals <no-reply@example.com>',
      to,
      subject,
      text,
      html,
    });
    return { delivered: true };
  } catch (err) {
    // A bad SMTP password, a blocked port, or the mail server being briefly
    // unreachable should never take down the page that triggered the email
    // (a customer submitting a request, an admin confirming one, etc.) - log
    // it clearly instead so it shows up in the hosting platform's logs.
    console.error(`[mailer] Failed to send email to ${to} ("${subject}"): ${err.message}`);
    return { delivered: false, error: err.message };
  }
}

module.exports = { sendMail, smtpConfigured };
