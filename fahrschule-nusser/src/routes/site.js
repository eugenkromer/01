const express = require('express');

const db = require('../db');
const content = require('../content');
const { sendMail } = require('../mailer');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function baseUrl() {
  return process.env.BASE_URL || 'http://localhost:3000';
}

// Adresse, an die neue Anfragen gemeldet werden: die hinterlegte
// Büro-Adresse, ersatzweise das Konto der Fahrschule.
function notificationAddress() {
  if (content.business.email && !content.business.email.startsWith('TODO')) {
    return content.business.email;
  }
  const admin = db.getUsers().find((u) => u.role === 'admin');
  return admin ? admin.email : null;
}

router.get('/', (req, res) => {
  res.render('site/home', {
    title: 'Fahrschule in Paderborn',
    description: content.business.intro.slice(0, 155),
  });
});

router.get('/fuehrerschein', (req, res) => {
  res.render('site/fuehrerschein', {
    title: 'Führerscheinklassen',
    headline: 'Alle Führerscheinklassen',
    subline: 'Vom Roller bis zum schweren Anhänger – finde heraus, welche Klasse zu dir passt.',
  });
});

router.get('/ablauf', (req, res) => {
  res.render('site/ablauf', {
    title: 'Ablauf',
    headline: 'So läuft deine Ausbildung ab',
    subline: 'Von der Anmeldung bis zur praktischen Prüfung – Schritt für Schritt erklärt.',
  });
});

router.get('/standorte', (req, res) => {
  res.render('site/standorte', {
    title: 'Standorte',
    headline: 'Unsere Standorte',
    subline: 'Theorieunterricht an fünf Orten in und um Paderborn.',
  });
});

router.get('/team', (req, res) => {
  res.render('site/team', {
    title: 'Team',
    headline: 'Die Menschen hinter der Fahrschule',
    subline: 'Erfahrene Fahrlehrerinnen und Fahrlehrer, die dich sicher zum Führerschein bringen.',
  });
});

router.get('/faq', (req, res) => {
  res.render('site/faq', {
    title: 'Häufige Fragen',
    headline: 'Häufige Fragen',
    subline: 'Die Fragen, die uns am häufigsten gestellt werden – kurz und ehrlich beantwortet.',
  });
});

router.get('/impressum', (req, res) => {
  res.render('site/impressum', { title: 'Impressum', headline: 'Impressum' });
});

router.get('/datenschutz', (req, res) => {
  res.render('site/datenschutz', { title: 'Datenschutz', headline: 'Datenschutzerklärung' });
});

// ---------- Kontaktformular ----------

router.get('/kontakt', (req, res) => {
  res.render('site/kontakt', {
    title: 'Kontakt',
    headline: 'Kontakt',
    subline: 'Ruf uns an, schreib uns oder komm einfach vorbei.',
    werte: {},
    fehler: null,
  });
});

router.post('/kontakt', async (req, res, next) => {
  try {
    const werte = req.body;
    const fehler = pruefeKontakt(werte);
    if (fehler) {
      return res.status(400).render('site/kontakt', {
        title: 'Kontakt',
        headline: 'Kontakt',
        subline: 'Ruf uns an, schreib uns oder komm einfach vorbei.',
        werte,
        fehler,
      });
    }

    const anfrage = db.createInquiry({ ...werte, type: 'kontakt' });
    await benachrichtige(anfrage);

    res.render('site/danke', {
      title: 'Nachricht gesendet',
      ueberschrift: 'Danke für deine Nachricht!',
      text: 'Wir haben deine Anfrage erhalten und melden uns in der Regel noch am selben Werktag bei dir zurück.',
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Online-Anmeldung ----------

router.get('/anmeldung', (req, res) => {
  res.render('site/anmeldung', {
    title: 'Online anmelden',
    headline: 'Jetzt anmelden',
    subline: 'In fünf Minuten ausgefüllt – den Rest besprechen wir gemeinsam.',
    werte: {},
    fehler: null,
  });
});

router.post('/anmeldung', async (req, res, next) => {
  try {
    const werte = req.body;
    const fehler = pruefeAnmeldung(werte);
    if (fehler) {
      return res.status(400).render('site/anmeldung', {
        title: 'Online anmelden',
        headline: 'Jetzt anmelden',
        subline: 'In fünf Minuten ausgefüllt – den Rest besprechen wir gemeinsam.',
        werte,
        fehler,
      });
    }

    const anfrage = db.createInquiry({ ...werte, type: 'anmeldung' });
    await benachrichtige(anfrage);
    await bestaetigeBeiKunde(anfrage);

    res.render('site/danke', {
      title: 'Anmeldung eingegangen',
      ueberschrift: 'Deine Anmeldung ist bei uns!',
      text: 'Wir melden uns in den nächsten Tagen bei dir und besprechen alles Weitere. '
        + 'Eine Bestätigung haben wir dir außerdem per E-Mail geschickt.',
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Hilfsfunktionen ----------

function pruefeKontakt(werte) {
  if (!String(werte.firstName || '').trim() || !String(werte.lastName || '').trim()) {
    return 'Bitte trage deinen Vor- und Nachnamen ein.';
  }
  if (!EMAIL_RE.test(String(werte.email || '').trim())) {
    return 'Bitte trage eine gültige E-Mail-Adresse ein, damit wir dir antworten können.';
  }
  if (!String(werte.message || '').trim()) {
    return 'Bitte schreib uns noch, worum es geht.';
  }
  if (!werte.datenschutz) {
    return 'Bitte bestätige die Datenschutzerklärung.';
  }
  return null;
}

function pruefeAnmeldung(werte) {
  if (!String(werte.firstName || '').trim() || !String(werte.lastName || '').trim()) {
    return 'Bitte trage deinen Vor- und Nachnamen ein.';
  }
  if (!EMAIL_RE.test(String(werte.email || '').trim())) {
    return 'Bitte trage eine gültige E-Mail-Adresse ein.';
  }
  if (!String(werte.phone || '').trim()) {
    return 'Bitte gib eine Telefonnummer an, unter der wir dich erreichen.';
  }
  const gueltigeKlassen = content.licenseOptions.map((o) => o.value);
  if (!gueltigeKlassen.includes(String(werte.licenseClass || '').trim())) {
    return 'Bitte wähle aus, welchen Führerschein du machen möchtest.';
  }
  if (!werte.datenschutz) {
    return 'Bitte bestätige die Datenschutzerklärung.';
  }
  return null;
}

function ortName(id) {
  const ort = content.locations.find((o) => o.id === id);
  return ort ? `${ort.name}, ${ort.street}` : 'keine Angabe';
}

// Meldet eine neue Anfrage an die Fahrschule.
async function benachrichtige(anfrage) {
  const empfaenger = notificationAddress();
  if (!empfaenger) return;

  const istAnmeldung = anfrage.type === 'anmeldung';
  const zeilen = [
    `Name: ${anfrage.firstName} ${anfrage.lastName}`,
    `E-Mail: ${anfrage.email}`,
    `Telefon: ${anfrage.phone || 'keine Angabe'}`,
  ];
  if (istAnmeldung) {
    zeilen.push(`Geburtsdatum: ${anfrage.birthDate || 'keine Angabe'}`);
    zeilen.push(`Führerscheinklasse: ${anfrage.licenseClass}`);
    zeilen.push(`Wunschstandort: ${ortName(anfrage.locationId)}`);
  }
  if (anfrage.message) zeilen.push('', 'Nachricht:', anfrage.message);
  zeilen.push('', `Im Verwaltungsbereich ansehen: ${baseUrl()}/portal/verwaltung/anfragen`);

  await sendMail({
    to: empfaenger,
    subject: istAnmeldung
      ? `Neue Online-Anmeldung: ${anfrage.firstName} ${anfrage.lastName} (${anfrage.licenseClass})`
      : `Neue Kontaktanfrage von ${anfrage.firstName} ${anfrage.lastName}`,
    text: zeilen.join('\n'),
  });
}

// Bestätigt der anmeldenden Person den Eingang.
async function bestaetigeBeiKunde(anfrage) {
  await sendMail({
    to: anfrage.email,
    subject: `Deine Anmeldung bei der ${content.business.name}`,
    text: [
      `Hallo ${anfrage.firstName},`,
      '',
      'danke für deine Anmeldung! Wir haben folgende Angaben erhalten:',
      '',
      `Führerscheinklasse: ${anfrage.licenseClass}`,
      `Wunschstandort: ${ortName(anfrage.locationId)}`,
      '',
      'Wir melden uns in den nächsten Tagen bei dir und besprechen alles Weitere.',
      'Verbindlich wird die Anmeldung erst mit deiner Unterschrift bei uns im Büro.',
      '',
      'Bring zum Anmeldegespräch bitte mit:',
      '- Personalausweis',
      '- ein biometrisches Passfoto',
      '- die Sehtestbescheinigung',
      '- den Nachweis über den Erste-Hilfe-Kurs',
      '',
      'Bis bald!',
      `${content.business.name}`,
      `${content.business.phone}`,
    ].join('\n'),
  });
}

module.exports = router;
