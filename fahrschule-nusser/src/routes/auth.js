// Anmeldung ohne Passwort: Wer seine E-Mail-Adresse einträgt, bekommt
// einen einmaligen Link zugeschickt. Das erspart Fahrschülern ein
// weiteres Passwort und der Fahrschule das Zurücksetzen vergessener
// Passwörter.

const express = require('express');

const db = require('../db');
const { sendMail } = require('../mailer');
const content = require('../content');

const router = express.Router();

const TOKEN_GUELTIG_MS = 30 * 60 * 1000; // 30 Minuten
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Nur im Vorführmodus: alle Konten, die zum Anklicken angeboten werden.
function demoZugaenge() {
  const alle = db.getUsers();
  const nachName = (a, b) => a.lastName.localeCompare(b.lastName, 'de');
  return {
    fahrschule: alle.filter((u) => u.role === 'admin'),
    fahrlehrer: alle.filter((u) => u.role === 'instructor').sort(nachName),
    fahrschueler: alle.filter((u) => u.role === 'student').sort(nachName),
  };
}

router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/portal');
  res.render('portal/login', {
    title: 'Anmelden',
    portal: true,
    bodyClass: 'portal-body',
    gesendet: false,
    fehler: null,
    zugaenge: res.locals.demoMode ? demoZugaenge() : null,
  });
});

// Anmeldung per Klick, ohne E-Mail - ausschließlich im Vorführmodus.
// Ist er aus, gibt es diese Adresse schlicht nicht.
router.get('/demo-login/:id', (req, res) => {
  // Ohne Vorführmodus gibt es diese Adresse schlicht nicht.
  if (!res.locals.demoMode) {
    return res.status(404).render('site/not-found', { title: 'Seite nicht gefunden' });
  }

  const user = db.getUser(req.params.id);
  if (!user) return res.redirect('/portal/login');

  req.session.email = user.email;
  req.session.save(() => res.redirect('/portal'));
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim();

    if (!EMAIL_RE.test(email)) {
      return res.status(400).render('portal/login', {
        title: 'Anmelden',
        portal: true,
        bodyClass: 'portal-body',
        gesendet: false,
        fehler: 'Bitte trage eine gültige E-Mail-Adresse ein.',
        zugaenge: res.locals.demoMode ? demoZugaenge() : null,
      });
    }

    const user = db.findUserByEmail(email);

    // Die Rückmeldung ist immer dieselbe – egal, ob die Adresse bekannt
    // ist oder nicht. Sonst ließe sich über das Formular herausfinden,
    // wer bei der Fahrschule angemeldet ist.
    if (user) {
      const token = db.createLoginToken(user.email, TOKEN_GUELTIG_MS);
      const link = `${process.env.BASE_URL || 'http://localhost:3000'}/portal/login/bestaetigen?token=${token.token}`;
      await sendMail({
        to: user.email,
        subject: `Dein Anmeldelink für das Portal der ${content.business.name}`,
        text: [
          `Hallo${user.firstName ? ' ' + user.firstName : ''},`,
          '',
          'mit diesem Link meldest du dich in deinem Bereich an:',
          '',
          link,
          '',
          'Der Link ist 30 Minuten gültig und kann nur einmal verwendet werden.',
          'Wenn du dich nicht anmelden wolltest, kannst du diese E-Mail einfach löschen.',
          '',
          content.business.name,
        ].join('\n'),
      });
    }

    res.render('portal/login', {
      title: 'Anmelden',
      portal: true,
      bodyClass: 'portal-body',
      gesendet: true,
      fehler: null,
      zugaenge: null,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/login/bestaetigen', (req, res) => {
  const tokenWert = req.query.token;
  const token = tokenWert ? db.findValidLoginToken(tokenWert) : null;

  if (!token) {
    return res.status(400).render('portal/login', {
      title: 'Anmelden',
      portal: true,
      bodyClass: 'portal-body',
      gesendet: false,
      fehler: 'Dieser Anmeldelink ist abgelaufen oder wurde schon benutzt. Fordere unten einfach einen neuen an.',
      zugaenge: res.locals.demoMode ? demoZugaenge() : null,
    });
  }

  db.markLoginTokenUsed(tokenWert);
  req.session.email = token.email;

  const ziel = req.session.returnTo || '/portal';
  delete req.session.returnTo;

  // Vor der Weiterleitung warten, bis die Sitzung wirklich gespeichert
  // ist: hinter manchen Proxys erreicht die Weiterleitung den Browser
  // sonst schneller als der Sitzungsspeicher fertig wird – die nächste
  // Anfrage sähe dann wieder abgemeldet aus.
  req.session.save((err) => {
    if (err) {
      return res.status(500).render('portal/login', {
        title: 'Anmelden',
        portal: true,
        bodyClass: 'portal-body',
        gesendet: false,
        fehler: 'Bei der Anmeldung ist etwas schiefgegangen. Bitte fordere einen neuen Link an.',
        zugaenge: res.locals.demoMode ? demoZugaenge() : null,
      });
    }
    res.redirect(ziel);
  });
});

router.post('/abmelden', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
