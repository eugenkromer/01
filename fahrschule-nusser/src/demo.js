// Legt Beispieldaten für eine Vorführung an: Theorietermine, Fahrschüler
// mit unterschiedlichem Ausbildungsstand, eingegangene Anfragen,
// Mitteilungen und Unterlagen.
//
//   npm run demo          Beispieldaten anlegen (vorhandene bleiben)
//   npm run demo -- reset Alles löschen und neu anlegen
//
// Alle Personen hier sind frei erfunden. Das Skript ist nur für
// Vorführungen gedacht - im echten Betrieb niemals ausführen, sonst
// stehen erfundene Fahrschüler zwischen den echten.

require('dotenv').config();

const fs = require('fs');
const path = require('path');

const db = require('./db');
const content = require('./content');

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, '..', 'data');

const reset = process.argv.slice(2).includes('reset');

// Die Termine werden relativ zu heute berechnet, damit sie in einer
// Vorführung immer in der Zukunft liegen - egal, wann das Skript läuft.
// Dabei werden nur Montag bis Donnerstag belegt, weil die Standortseite
// genau diese Unterrichtszeiten nennt; Termine am Wochenende würden der
// eigenen Website widersprechen.
function formatiere(datum) {
  const p = (n) => String(n).padStart(2, '0');
  return `${datum.getFullYear()}-${p(datum.getMonth() + 1)}-${p(datum.getDate())}`
    + `T${p(datum.getHours())}:${p(datum.getMinutes())}`;
}

// Liefert den n-ten Unterrichtstag ab morgen (n beginnt bei 1).
function unterrichtstag(n, stunde, minute = 0) {
  const datum = new Date();
  datum.setHours(stunde, minute, 0, 0);
  let gefunden = 0;
  while (gefunden < n) {
    datum.setDate(datum.getDate() + 1);
    const wochentag = datum.getDay(); // 0 = Sonntag, 1 = Montag ...
    if (wochentag >= 1 && wochentag <= 4) gefunden += 1;
  }
  return datum;
}

function termin(n, stunde, dauerMinuten = 150) {
  const beginn = unterrichtstag(n, stunde);
  const ende = new Date(beginn.getTime() + dauerMinuten * 60 * 1000);
  return { startsAt: formatiere(beginn), endsAt: formatiere(ende) };
}

function leeren() {
  if (!fs.existsSync(DATA_DIR)) return;
  for (const datei of fs.readdirSync(DATA_DIR)) {
    if (datei.endsWith('.json') || datei === 'outbox.log') {
      fs.unlinkSync(path.join(DATA_DIR, datei));
    }
  }
  console.log('Vorhandene Daten gelöscht.');
}

function anlegen() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'info@fahrschule-nusser.de';
  db.ensureSeedAdmin(adminEmail);

  // ---------- Theorietermine ----------
  const termine = [
    { tag: 1, lessonNo: 4,  topic: 'Vorfahrt und Verkehrsregelungen',            ort: 'borchener-strasse', kapazitaet: 18 },
    { tag: 2, lessonNo: 5,  topic: 'Verkehrszeichen, Einfahren und Anfahren',    ort: 'borchener-strasse', kapazitaet: 18 },
    { tag: 3, lessonNo: 6,  topic: 'Geschwindigkeit, Abstand und Überholen',     ort: 'elsen',             kapazitaet: 12 },
    { tag: 5, lessonNo: 7,  topic: 'Ruhender Verkehr und besondere Situationen', ort: 'borchener-strasse', kapazitaet: 18 },
    { tag: 6, lessonNo: 8,  topic: 'Lebenslanges Lernen, Alkohol und Drogen',    ort: 'kaukenberg',        kapazitaet: 3 },
    { tag: 8, lessonNo: 12, topic: 'Fahrgeschwindigkeit, Bremsen, Abstand',      ort: 'borchener-strasse', kapazitaet: 0 },
  ];

  const angelegteTermine = termine.map((t) =>
    db.createTheorySession({
      ...termin(t.tag, 18),
      locationId: t.ort,
      lessonNo: t.lessonNo,
      topic: t.topic,
      instructor: 'M. Nusser',
      capacity: t.kapazitaet,
    })
  );

  // ---------- Fahrschüler ----------
  const personen = [
    {
      firstName: 'Lena', lastName: 'Brinkmann', email: 'lena.brinkmann@beispiel.de',
      phone: '0151 2345678', licenseClass: 'B', locationId: 'borchener-strasse',
      fortschritt: {
        theoryDone: [1, 2, 3, 4, 5, 6, 7, 8, 9], drivingLessons: 18,
        special: { ueberland: 5, autobahn: 4, nacht: 1 },
        theoryExam: 'bestanden', practicalExam: 'angemeldet',
        note: 'Nur noch zwei Nachtfahrten, dann bist du startklar. Sehr sicher unterwegs!',
      },
      buchungen: [0, 1],
    },
    {
      firstName: 'Jonas', lastName: 'Weber', email: 'jonas.weber@beispiel.de',
      phone: '0160 9876543', licenseClass: 'BF17', locationId: 'borchener-strasse',
      fortschritt: {
        theoryDone: [1, 2, 3, 4], drivingLessons: 6,
        special: { ueberland: 0, autobahn: 0, nacht: 0 },
        theoryExam: 'angemeldet', practicalExam: 'offen',
        note: 'Denk bitte an die Unterschrift deiner Eltern für die Begleitperson.',
      },
      buchungen: [0, 2],
    },
    {
      firstName: 'Merve', lastName: 'Yilmaz', email: 'merve.yilmaz@beispiel.de',
      phone: '0171 5556677', licenseClass: 'A2', locationId: 'elsen',
      fortschritt: {
        theoryDone: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], drivingLessons: 24,
        special: { ueberland: 5, autobahn: 4, nacht: 3 },
        theoryExam: 'bestanden', practicalExam: 'bestanden',
        note: 'Herzlichen Glückwunsch zur bestandenen Prüfung!',
      },
      buchungen: [],
    },
    {
      firstName: 'Paul', lastName: 'Schäfer', email: 'paul.schaefer@beispiel.de',
      phone: '0152 1112233', licenseClass: 'B', locationId: 'kaukenberg',
      fortschritt: {
        theoryDone: [1, 2], drivingLessons: 0,
        special: { ueberland: 0, autobahn: 0, nacht: 0 },
        theoryExam: 'offen', practicalExam: 'offen',
        note: '',
      },
      buchungen: [1, 2, 4],
    },
  ];

  const angelegtePersonen = [];
  for (const person of personen) {
    const student = db.createStudent(person);
    if (!student) {
      console.log(`  übersprungen (E-Mail schon vergeben): ${person.email}`);
      continue;
    }
    db.updateProgress(student.id, person.fortschritt);
    for (const index of person.buchungen) {
      if (angelegteTermine[index]) db.bookTheorySession(angelegteTermine[index].id, student.id);
    }
    angelegtePersonen.push(student);
  }

  // ---------- Anfragen ----------
  db.createInquiry({
    type: 'anmeldung',
    firstName: 'Sophie', lastName: 'Klein', email: 'sophie.klein@beispiel.de',
    phone: '0157 4443322', birthDate: '2008-06-14',
    licenseClass: 'BF17', locationId: 'borchener-strasse',
    message: 'Ich werde im Dezember 17 und möchte vorher schon anfangen.',
  });
  db.createInquiry({
    type: 'kontakt',
    firstName: 'Michael', lastName: 'Hoffmann', email: 'm.hoffmann@beispiel.de',
    phone: '05251 998877',
    message: 'Guten Tag, ich habe Klasse B und möchte auf B96 erweitern. '
      + 'Wann findet die nächste Schulung statt und was kostet sie?',
  });

  // ---------- Mitteilungen ----------
  db.createAnnouncement({
    title: 'Theorieunterricht am 3. Oktober fällt aus',
    body: 'Wegen des Feiertags entfällt der Unterricht in der Borchener Straße. '
      + 'Der Termin wird in der Woche darauf nachgeholt – die Anmeldung ist im Portal schon freigeschaltet.',
  });
  db.createAnnouncement({
    title: 'Neue Fahrzeuge im Einsatz',
    body: 'Ab sofort stehen zwei neue Schulfahrzeuge mit Automatikgetriebe bereit. '
      + 'Wer nach der Regelung B197 ausgebildet werden möchte, spricht einfach seinen Fahrlehrer an.',
  });

  // ---------- Unterlagen ----------
  db.createDocument({
    title: 'Merkblatt zur Theorieprüfung',
    description: 'Was du am Prüfungstag mitbringen musst und wie der Ablauf ist.',
    url: '/uploads/beispiel-merkblatt.txt',
  });
  db.createDocument({
    title: 'Checkliste für die Anmeldung',
    description: 'Alle Unterlagen, die wir für den Antrag bei der Führerscheinstelle brauchen.',
    url: '/uploads/beispiel-merkblatt.txt',
  });
  if (angelegtePersonen[0]) {
    db.createDocument({
      title: 'Deine Ausbildungsbescheinigung',
      description: 'Zwischenstand deiner Ausbildung zum Ausdrucken.',
      url: '/uploads/beispiel-merkblatt.txt',
      studentId: angelegtePersonen[0].id,
    });
  }

  console.log('');
  console.log('Beispieldaten angelegt:');
  console.log(`  ${angelegteTermine.length} Theorietermine`);
  console.log(`  ${angelegtePersonen.length} Fahrschüler`);
  console.log('  2 Anfragen, 2 Mitteilungen, 3 Unterlagen');
  console.log('');
  console.log('Zugänge für die Vorführung:');
  console.log(`  Fahrschule (Verwaltung):  ${adminEmail}`);
  for (const p of angelegtePersonen) {
    console.log(`  Fahrschüler:              ${p.email}`);
  }
  console.log('');
  console.log('Mit DEMO_MODE=true kann man sich auf der Anmeldeseite per Klick');
  console.log('anmelden – ganz ohne E-Mail-Versand.');
  console.log('');
}

if (reset) leeren();
anlegen();
