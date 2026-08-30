// Sends outgoing emails (login links, admin handover, quote request
// notifications). Two real delivery methods are supported, tried in this
// order:
//
//   1. Resend's HTTP API (RESEND_API_KEY) - plain HTTPS, so it works even on
//      hosts that block outbound SMTP ports (which several free-tier PaaS
//      platforms, Render included, appear to do for anything on 25/465/587).
//      This is the recommended option - see .env.example.
//   2. Direct SMTP (SMTP_HOST/USER/PASS) - useful once this app runs
//      somewhere with unrestricted outbound access, e.g. a VPS.
//
// If neither is configured, emails are logged to the console and appended to
// data/outbox.log so the whole flow can still be tested without a real
// mail account.

const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
const nodemailer = require('nodemailer');

const OUTBOX_LOG = path.join(__dirname, '..', 'data', 'outbox.log');

const resendConfigured = Boolean(process.env.RESEND_API_KEY);
const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const emailConfigured = resendConfigured || smtpConfigured;

function logToOutbox({ to, subject, text }) {
  const entry = `\n----- ${new Date().toISOString()} -----\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`;
  fs.mkdirSync(path.dirname(OUTBOX_LOG), { recursive: true });
  fs.appendFileSync(OUTBOX_LOG, entry);
  // Printed in full (not just a summary) because on a hosted platform like
  // Render there is usually no file browser for the free tier - the
  // platform's live log stream is the only place to actually read this.
  console.log(`[mailer] No email provider configured - email NOT delivered, only logged below.\n${entry}`);
}

async function sendViaResend({ to, subject, text, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || process.env.SMTP_FROM || 'Wedding Rentals <onboarding@resend.dev>',
      to,
      subject,
      text,
      html,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend API returned ${res.status}: ${body.slice(0, 300)}`);
  }
}

// Nodemailer resolves both A and AAAA records for the SMTP host and then
// picks a RANDOM address from the combined list to connect to - there's no
// option that makes it prefer or stick to IPv4. On hosts like Render, the
// container reports an IPv6-capable network interface even though it has no
// real IPv6 route to the internet, so about half of all attempts fail with
// ENETUNREACH. Work around it by resolving the A record ourselves and
// connecting to that IP directly, while telling TLS to still validate the
// certificate (and negotiate SNI) against the real hostname.
async function resolveSmtpHost(hostname) {
  try {
    const addresses = await dns.resolve4(hostname);
    if (addresses.length) return addresses[Math.floor(Math.random() * addresses.length)];
  } catch (err) {
    console.warn(`[mailer] Could not resolve an IPv4 address for ${hostname} (${err.message}) - connecting by hostname instead, which may hit IPv6 routing issues.`);
  }
  return hostname;
}

async function sendViaSmtp({ to, subject, text, html }) {
  const resolvedHost = await resolveSmtpHost(process.env.SMTP_HOST);
  const transporter = nodemailer.createTransport({
    host: resolvedHost,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { servername: process.env.SMTP_HOST },
    // Nodemailer's defaults wait up to 2 minutes before giving up on a
    // connection - that would leave the customer staring at a spinner if
    // the SMTP host/port is wrong or blocked. Fail fast instead.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Wedding Rentals <no-reply@example.com>',
    to,
    subject,
    text,
    html,
  });
}

async function sendMail({ to, subject, text, html }) {
  if (!emailConfigured) {
    logToOutbox({ to, subject, text: text || html });
    return { delivered: false };
  }
  try {
    if (resendConfigured) {
      await sendViaResend({ to, subject, text, html });
    } else {
      await sendViaSmtp({ to, subject, text, html });
    }
    return { delivered: true };
  } catch (err) {
    // A bad password, a blocked port, or the mail provider being briefly
    // unreachable should never take down the page that triggered the email
    // (a customer submitting a request, an admin confirming one, etc.) - log
    // it clearly instead so it shows up in the hosting platform's logs.
    console.error(`[mailer] Failed to send email to ${to} ("${subject}"): ${err.message}`);
    return { delivered: false, error: err.message };
  }
}

module.exports = { sendMail, emailConfigured };
