// Versendet ausgehende E-Mails (Login-Links, Benachrichtigungen über neue
// Anmeldungen, Terminerinnerungen). Zwei echte Versandwege, in dieser
// Reihenfolge:
//
//   1. Resend über die HTTP-API (RESEND_API_KEY) – normales HTTPS und
//      damit auch dort nutzbar, wo ausgehende SMTP-Ports gesperrt sind
//      (bei vielen Hosting-Anbietern der Fall). Empfohlener Weg.
//   2. Klassisches SMTP (SMTP_HOST/USER/PASS) – ideal auf einem eigenen
//      Server oder VPS ohne Portsperren.
//
// Ist keiner von beiden konfiguriert, werden E-Mails nur in der Konsole
// ausgegeben und an data/outbox.log angehängt. So lässt sich der komplette
// Ablauf lokal testen, ohne ein Mailkonto einzurichten.

const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
const nodemailer = require('nodemailer');

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, '..', 'data');
const OUTBOX_LOG = path.join(DATA_DIR, 'outbox.log');

const resendConfigured = Boolean(process.env.RESEND_API_KEY);
const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const emailConfigured = resendConfigured || smtpConfigured;

function logToOutbox({ to, subject, text }) {
  const entry = `\n----- ${new Date().toISOString()} -----\nAn: ${to}\nBetreff: ${subject}\n\n${text}\n`;
  fs.mkdirSync(path.dirname(OUTBOX_LOG), { recursive: true });
  fs.appendFileSync(OUTBOX_LOG, entry);
  // Vollständig ausgegeben, weil auf gehosteten Plattformen oft kein
  // Dateizugriff besteht und der Log-Stream die einzige Möglichkeit ist,
  // den Inhalt (z. B. einen Login-Link) überhaupt zu sehen.
  console.log(`[mailer] Kein E-Mail-Anbieter konfiguriert – Mail NICHT versendet, nur protokolliert:\n${entry}`);
}

async function sendViaResend({ to, subject, text, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'Fahrschule <onboarding@resend.dev>',
      to,
      subject,
      text,
      html,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend antwortete mit ${res.status}: ${body.slice(0, 300)}`);
  }
}

// Nodemailer löst A- und AAAA-Records auf und wählt daraus zufällig eine
// Adresse – ohne Möglichkeit, IPv4 zu erzwingen. Auf Plattformen, deren
// Container zwar eine IPv6-Schnittstelle melden, aber keine IPv6-Route ins
// Internet haben, schlägt deshalb etwa jeder zweite Versuch mit
// ENETUNREACH fehl. Darum lösen wir den A-Record selbst auf und verbinden
// direkt zur IP, während TLS weiterhin gegen den echten Hostnamen prüft.
async function resolveSmtpHost(hostname) {
  try {
    const addresses = await dns.resolve4(hostname);
    if (addresses.length) return addresses[Math.floor(Math.random() * addresses.length)];
  } catch (err) {
    console.warn(`[mailer] Keine IPv4-Adresse für ${hostname} gefunden (${err.message}) – verbinde über den Hostnamen.`);
  }
  return hostname;
}

async function sendViaSmtp({ to, subject, text, html }) {
  const resolvedHost = await resolveSmtpHost(process.env.SMTP_HOST);
  const transporter = nodemailer.createTransport({
    host: resolvedHost,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { servername: process.env.SMTP_HOST },
    // Nodemailer wartet standardmäßig bis zu zwei Minuten – das würde
    // Besucher vor einem hängenden Formular sitzen lassen. Lieber schnell
    // abbrechen und den Fehler protokollieren.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Fahrschule <no-reply@example.com>',
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
    if (resendConfigured) await sendViaResend({ to, subject, text, html });
    else await sendViaSmtp({ to, subject, text, html });
    return { delivered: true };
  } catch (err) {
    // Ein falsches Passwort oder ein kurzzeitig nicht erreichbarer Anbieter
    // darf niemals die Seite mitreißen, die den Versand ausgelöst hat.
    console.error(`[mailer] Versand an ${to} ("${subject}") fehlgeschlagen: ${err.message}`);
    return { delivered: false, error: err.message };
  }
}

module.exports = { sendMail, emailConfigured };
