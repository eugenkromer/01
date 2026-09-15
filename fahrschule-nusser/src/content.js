// =====================================================================
//  ALLE INHALTE DER WEBSITE AN EINER STELLE
// =====================================================================
//
//  Diese Datei ist bewusst die einzige Stelle, an der Texte, Adressen,
//  Preise und Zeiten stehen. Wer Inhalte ändern will, ändert sie hier –
//  ohne HTML oder Code anfassen zu müssen.
//
//  WICHTIG – vor dem Livegang prüfen:
//  Alles, was mit  TODO  markiert ist, ist ein Platzhalter und muss durch
//  echte Angaben der Fahrschule ersetzt werden. Die übrigen Angaben
//  (Adressen, Telefonnummer, Klassen) stammen aus öffentlichen
//  Branchenverzeichnissen und sollten trotzdem einmal gegengelesen werden.
//
// =====================================================================

// ---------------------------------------------------------------------
// Stammdaten der Fahrschule
// ---------------------------------------------------------------------
const business = {
  name: 'Fahrschule Nusser',
  owner: 'Mathias Nusser',
  claim: 'Deine Fahrschule in Paderborn',
  // Kurzer Satz unter der großen Überschrift auf der Startseite
  intro:
    'Seit über 40 Jahren begleiten wir Fahrschülerinnen und Fahrschüler in Paderborn und Umgebung sicher zum Führerschein – mit erfahrenen Fahrlehrern, modernen Fahrzeugen und Unterricht an fünf Standorten.',

  // Logo der Fahrschule. Die Bilddatei nach public/img/ legen und hier den
  // Pfad eintragen, z. B. '/img/logo.png' oder '/img/logo.svg'.
  // Bleibt der Wert leer, zeigt die Seite ersatzweise ein Kästchen mit dem
  // Anfangsbuchstaben - so wie jetzt.
  logo: '', // TODO: Logo der alten Seite hier eintragen
  // Fassung für dunkle Hintergründe (Fußzeile), z. B. das Logo in Weiß.
  // Bleibt der Wert leer, wird das normale Logo dort auf ein helles
  // Plättchen gesetzt, damit es in jedem Fall lesbar bleibt.
  logoHell: '', // optional
  // Auf true setzen, wenn neben dem Logo zusätzlich der Name stehen soll.
  // Trägt das Logo den Schriftzug schon selbst, bleibt es bei false.
  logoMitText: false,
  // Quadratisches Symbol für den Browser-Tab (mindestens 180 x 180 Pixel).
  // Leer lassen, dann wird ein Kästchen mit dem Anfangsbuchstaben benutzt.
  favicon: '', // TODO: optional

  phone: '05251 74752',
  // In dieser Schreibweise landet die Nummer im „anrufen“-Link
  phoneLink: '+49525174752',
  email: 'TODO-info@fahrschule-nusser.de', // TODO: echte E-Mail-Adresse eintragen
  whatsapp: '', // optional, z. B. '+49 171 1234567' – leer lassen blendet den Button aus

  // Zahlen für die Vertrauensleiste auf der Startseite
  facts: [
    { value: 'über 40', label: 'Jahre Erfahrung' },
    { value: '5', label: 'Standorte in und um Paderborn' },
    { value: '4,9 ★', label: 'Durchschnitt aus Kundenbewertungen' },
    { value: 'alle', label: 'Auto- und Motorradklassen' },
  ],
};

// ---------------------------------------------------------------------
// Standorte
// Quelle: öffentliche Branchenverzeichnisse – bitte gegenlesen.
// "theory" = Theorieunterricht an diesem Standort, leer lassen wenn keiner
// stattfindet. "main: true" markiert den Hauptsitz (erscheint zuerst).
// ---------------------------------------------------------------------
const locations = [
  {
    id: 'borchener-strasse',
    name: 'Paderborn – Hauptsitz',
    street: 'Borchener Str. 15',
    zip: '33098',
    city: 'Paderborn',
    main: true,
    phone: '05251 74752',
    theory: 'Montag bis Donnerstag, 18:00 – 20:30 Uhr',
    office: 'TODO: Bürozeiten eintragen', // TODO
    note: 'Anmeldung, Beratung und Theorieunterricht',
  },
  {
    id: 'elsen',
    name: 'Paderborn-Elsen',
    street: 'Am Spieker 2',
    zip: '33106',
    city: 'Paderborn',
    main: false,
    phone: '05251 74752',
    theory: 'TODO: Unterrichtszeiten eintragen', // TODO
    office: '',
    note: '',
  },
  {
    id: 'kaukenberg',
    name: 'Paderborn – Am Kaukenberg',
    street: 'Am Kaukenberg 12',
    zip: '33102',
    city: 'Paderborn',
    main: false,
    phone: '05251 74752',
    theory: 'TODO: Unterrichtszeiten eintragen', // TODO
    office: '',
    note: '',
  },
  {
    id: 'schlangen',
    name: 'Schlangen',
    street: 'Paderborner Str. 15',
    zip: '33189',
    city: 'Schlangen',
    main: false,
    phone: '05251 74752',
    theory: 'TODO: Unterrichtszeiten eintragen', // TODO
    office: '',
    note: '',
  },
  {
    id: 'lange-strasse',
    name: 'Standort Lange Straße',
    street: 'Lange Str. 15',
    zip: 'TODO',
    city: 'TODO',
    main: false,
    phone: '05251 74752',
    theory: 'TODO: Unterrichtszeiten eintragen', // TODO
    office: '',
    note: 'TODO: Ort und Postleitzahl prüfen',
  },
];

// ---------------------------------------------------------------------
// Führerscheinklassen
// "price" ist ein Platzhalter – echte Preise eintragen oder auf null
// lassen, dann wird statt eines Preises „auf Anfrage“ angezeigt.
// ---------------------------------------------------------------------
const licenseGroups = [
  {
    id: 'auto',
    title: 'Auto',
    icon: 'car',
    intro: 'Vom klassischen Pkw-Führerschein bis zum Anhänger – bei uns lernst du auf modernen Fahrzeugen.',
    classes: [
      {
        code: 'B',
        name: 'Pkw-Führerschein',
        minAge: 'ab 18 Jahren',
        summary: 'Der klassische Autoführerschein für Fahrzeuge bis 3,5 t zulässiger Gesamtmasse.',
        details: [
          'Fahrzeuge bis 3.500 kg, bis zu 8 Sitzplätze außer dem Fahrersitz',
          'Anhänger bis 750 kg sind eingeschlossen',
          'Schließt die Klassen AM und L mit ein',
        ],
        price: null, // TODO: Grundbetrag eintragen, z. B. 450
      },
      {
        code: 'BF17',
        name: 'Begleitetes Fahren ab 17',
        minAge: 'Anmeldung ab 16,5 Jahren',
        summary: 'Führerschein schon mit 17 – und das erste Jahr in Begleitung einer Vertrauensperson.',
        details: [
          'Anmeldung in der Fahrschule ab 16,5 Jahren möglich',
          'Nach bestandener Prüfung fährst du bis 18 nur mit eingetragener Begleitperson',
          'Statistisch deutlich weniger Unfälle in den ersten Jahren',
        ],
        price: null, // TODO
      },
      {
        code: 'B197',
        name: 'Automatik-Regelung B197',
        minAge: 'ab 18 Jahren',
        summary: 'Ausbildung überwiegend auf Automatik, Prüfung auf Automatik – der Schein gilt trotzdem für Schaltwagen.',
        details: [
          'Mindestens 10 Fahrstunden auf einem Schaltfahrzeug',
          'Abschließende Testfahrt mit Schaltgetriebe in der Fahrschule',
          'Kein Automatik-Vermerk im Führerschein',
        ],
        price: null, // TODO
      },
      {
        code: 'B96',
        name: 'Anhänger-Erweiterung B96',
        minAge: 'mit Klasse B',
        summary: 'Kein eigener Führerschein, sondern eine Schulung für schwerere Anhänger.',
        details: [
          'Zugfahrzeug und Anhänger zusammen über 3.500 kg bis 4.250 kg',
          'Eintägige Schulung, keine Prüfung',
          'Ideal für Wohnwagen und Pferdeanhänger',
        ],
        price: null, // TODO
      },
      {
        code: 'BE',
        name: 'Anhänger-Führerschein BE',
        minAge: 'mit Klasse B',
        summary: 'Für alles, was mit B96 nicht mehr abgedeckt ist – mit praktischer Prüfung.',
        details: [
          'Anhänger über 750 kg bis 3.500 kg',
          'Nur praktische Prüfung, kein Theorieunterricht nötig',
          'Für große Wohnwagen, Bootsanhänger und Transporter',
        ],
        price: null, // TODO
      },
    ],
  },
  {
    id: 'motorrad',
    title: 'Motorrad',
    icon: 'bike',
    intro: 'Vom Roller bis zur schweren Maschine – wir bilden in allen Motorradklassen aus.',
    classes: [
      {
        code: 'AM',
        name: 'Roller und Kleinkrafträder',
        minAge: 'ab 15 Jahren',
        summary: 'Zweirädrige Kleinkrafträder bis 45 km/h.',
        details: ['Bis 50 cm³ Hubraum, maximal 45 km/h', 'In Klasse B enthalten'],
        price: null, // TODO
      },
      {
        code: 'A1',
        name: 'Leichtkraftrad',
        minAge: 'ab 16 Jahren',
        summary: 'Der Einstieg ins Motorradfahren.',
        details: ['Bis 125 cm³ und maximal 11 kW', 'Leistungsgewicht höchstens 0,1 kW/kg'],
        price: null, // TODO
      },
      {
        code: 'A2',
        name: 'Mittlere Motorradklasse',
        minAge: 'ab 18 Jahren',
        summary: 'Maschinen bis 35 kW – der Zwischenschritt zur offenen Klasse A.',
        details: ['Maximal 35 kW', 'Nach zwei Jahren Aufstieg auf Klasse A möglich'],
        price: null, // TODO
      },
      {
        code: 'A',
        name: 'Offene Motorradklasse',
        minAge: 'ab 24 Jahren (oder ab 20 mit A2-Vorbesitz)',
        summary: 'Alle Motorräder ohne Leistungsbegrenzung.',
        details: ['Keine Leistungsbegrenzung', 'Direkteinstieg ab 24 Jahren'],
        price: null, // TODO
      },
    ],
  },
  {
    id: 'weitere',
    title: 'Weitere Klassen',
    icon: 'tractor',
    intro: 'Auch für Traktor und Mofa bist du bei uns richtig.',
    classes: [
      {
        code: 'L',
        name: 'Land- und forstwirtschaftliche Zugmaschinen',
        minAge: 'ab 16 Jahren',
        summary: 'Traktoren bis 40 km/h in der Land- und Forstwirtschaft.',
        details: ['Bis 40 km/h bauartbedingte Höchstgeschwindigkeit', 'In Klasse B enthalten'],
        price: null, // TODO
      },
      {
        code: 'Mofa',
        name: 'Mofa-Prüfbescheinigung',
        minAge: 'ab 15 Jahren',
        summary: 'Die Prüfbescheinigung für Mofas bis 25 km/h.',
        details: ['Theorieunterricht und Fahrpraxis', 'Abschluss mit theoretischer Prüfung'],
        price: null, // TODO
      },
    ],
  },
];

// ---------------------------------------------------------------------
// Preise / Kostenübersicht
// Fahrschulpreise sind gesetzlich nicht einheitlich – hier gehören die
// echten Beträge der Fahrschule hinein. Solange "published" auf false
// steht, zeigt die Seite statt einer Tabelle einen Hinweis, dass Preise
// auf Anfrage genannt werden.
// ---------------------------------------------------------------------
const pricing = {
  published: false, // TODO: auf true setzen, sobald die echten Preise eingetragen sind
  note: 'Alle Preise verstehen sich inklusive Mehrwertsteuer. Die Gebühren von TÜV/DEKRA und Führerscheinstelle werden separat berechnet.',
  rows: [
    { label: 'Grundbetrag Klasse B', value: null }, // TODO
    { label: 'Fahrstunde (45 Minuten)', value: null }, // TODO
    { label: 'Überlandfahrt (Sonderfahrt)', value: null }, // TODO
    { label: 'Autobahnfahrt (Sonderfahrt)', value: null }, // TODO
    { label: 'Nachtfahrt (Sonderfahrt)', value: null }, // TODO
    { label: 'Vorstellungsentgelt praktische Prüfung', value: null }, // TODO
    { label: 'Lernmaterial und Fahrschul-App', value: null }, // TODO
  ],
};

// ---------------------------------------------------------------------
// Ablauf: in wie vielen Schritten komme ich zum Führerschein
// ---------------------------------------------------------------------
const steps = [
  {
    title: 'Anmelden',
    text: 'Online über unser Formular oder direkt bei uns im Büro. Wir besprechen mit dir, welche Klasse zu dir passt und welche Unterlagen du brauchst.',
  },
  {
    title: 'Antrag stellen',
    text: 'Sehtest, Erste-Hilfe-Kurs und biometrisches Passfoto besorgen. Den Antrag reichst du bei der Führerscheinstelle ein – wir sagen dir genau, wie.',
  },
  {
    title: 'Theorie lernen',
    text: 'Pflichtstunden im Unterricht plus Lernen mit der Fahrschul-App. In deinem persönlichen Portal siehst du jederzeit, welche Lektionen dir noch fehlen.',
  },
  {
    title: 'Praxis fahren',
    text: 'Fahrstunden in deinem Tempo, dazu die vorgeschriebenen Sonderfahrten über Land, auf der Autobahn und bei Dunkelheit.',
  },
  {
    title: 'Theorieprüfung',
    text: 'Sobald du sicher bist, melden wir dich zur theoretischen Prüfung an.',
  },
  {
    title: 'Praktische Prüfung',
    text: 'Der letzte Schritt – und danach hältst du deinen Führerschein in den Händen.',
  },
];

// ---------------------------------------------------------------------
// Team
// TODO: echte Namen, Funktionen, Klassen und Fotos eintragen.
// Fotos gehören nach public/img/team/ und werden hier mit
// "photo: '/img/team/dateiname.jpg'" referenziert.
// ---------------------------------------------------------------------
const team = [
  {
    name: 'Mathias Nusser',
    role: 'Inhaber und Fahrlehrer',
    classes: 'TODO: Ausbildungsklassen',
    photo: '',
    text: 'TODO: kurzer Text zur Person.',
  },
  {
    name: 'TODO: Name',
    role: 'Fahrlehrer/in',
    classes: 'TODO: Ausbildungsklassen',
    photo: '',
    text: 'TODO: kurzer Text zur Person.',
  },
  {
    name: 'TODO: Name',
    role: 'Fahrlehrer/in',
    classes: 'TODO: Ausbildungsklassen',
    photo: '',
    text: 'TODO: kurzer Text zur Person.',
  },
  {
    name: 'TODO: Name',
    role: 'Büro und Anmeldung',
    classes: '',
    photo: '',
    text: 'TODO: kurzer Text zur Person.',
  },
];

// ---------------------------------------------------------------------
// Häufige Fragen
// ---------------------------------------------------------------------
const faq = [
  {
    q: 'Wie lange dauert es, bis ich den Führerschein habe?',
    a: 'Das hängt vor allem davon ab, wie regelmäßig du Fahrstunden nimmst und wie schnell du die Theorie lernst. Üblich sind drei bis sechs Monate. Wer zügig lernt und mehrere Fahrstunden pro Woche nimmt, ist auch schneller fertig.',
  },
  {
    q: 'Was kostet der Führerschein bei euch?',
    a: 'Die Gesamtkosten setzen sich aus Grundbetrag, Fahrstunden, Sonderfahrten und den Gebühren von Prüfstelle und Behörde zusammen. Wie viele Fahrstunden jemand braucht, ist sehr unterschiedlich – deshalb nennen wir dir in einem kurzen Gespräch gern eine ehrliche Einschätzung für deine Situation.',
  },
  {
    q: 'Welche Unterlagen brauche ich für die Anmeldung?',
    a: 'Einen gültigen Personalausweis, ein biometrisches Passfoto, die Sehtestbescheinigung und den Nachweis über den Erste-Hilfe-Kurs. Bist du unter 18, unterschreiben deine Eltern die Anmeldung mit.',
  },
  {
    q: 'Ab wann kann ich mich für das Begleitete Fahren anmelden?',
    a: 'Ab 16,5 Jahren kannst du dich anmelden und mit der Ausbildung beginnen. Die praktische Prüfung ist frühestens einen Monat vor deinem 17. Geburtstag möglich.',
  },
  {
    q: 'Kann ich auf Automatik lernen?',
    a: 'Ja. Mit der Regelung B197 machst du den größten Teil der Ausbildung und die Prüfung auf einem Automatikfahrzeug, absolvierst zusätzlich mindestens zehn Fahrstunden auf einem Schaltwagen und bekommst trotzdem einen Führerschein ohne Automatik-Beschränkung.',
  },
  {
    q: 'Muss ich den Theorieunterricht an einem bestimmten Standort besuchen?',
    a: 'Nein. Du kannst den Unterricht an jedem unserer Standorte besuchen – such dir einfach den Termin aus, der dir am besten passt. Im Fahrschüler-Portal siehst du alle kommenden Termine.',
  },
  {
    q: 'Wie sage ich eine Fahrstunde ab?',
    a: 'Sag uns bitte spätestens 48 Stunden vorher Bescheid, telefonisch oder direkt bei deinem Fahrlehrer. Kurzfristigere Absagen müssen wir leider berechnen, weil die Zeit dann nicht mehr anders vergeben werden kann.',
  },
  {
    q: 'Bildet ihr auch Fahrschüler mit einer anderen Muttersprache aus?',
    a: 'TODO: bitte ergänzen – z. B. in welchen Sprachen die Theorieprüfung abgelegt werden kann und ob Unterricht in weiteren Sprachen möglich ist.',
  },
];

// ---------------------------------------------------------------------
// Auswahlliste für Formulare
// ---------------------------------------------------------------------
const licenseOptions = licenseGroups.flatMap((group) =>
  group.classes.map((c) => ({ value: c.code, label: `${c.code} – ${c.name}` }))
);

// ---------------------------------------------------------------------
// Theorie-Pflichtstoff. Wird im Fahrschüler-Portal für den
// Lernfortschritt benutzt.
// ---------------------------------------------------------------------
const theoryLessons = [
  { no: 1, title: 'Persönliche Voraussetzungen, Risikofaktoren' },
  { no: 2, title: 'Rechtliche Rahmenbedingungen' },
  { no: 3, title: 'Straßenverkehrssystem und seine Nutzung' },
  { no: 4, title: 'Vorfahrt und Verkehrsregelungen' },
  { no: 5, title: 'Verkehrszeichen, Einfahren und Anfahren' },
  { no: 6, title: 'Geschwindigkeit, Abstand und Überholen' },
  { no: 7, title: 'Ruhender Verkehr und besondere Situationen' },
  { no: 8, title: 'Lebenslanges Lernen, Alkohol und Drogen' },
  { no: 9, title: 'Technische Bedingungen und Umweltbewusstsein' },
  { no: 10, title: 'Fahren mit Solokraftfahrzeugen und Zügen' },
  { no: 11, title: 'Personen- und Güterbeförderung' },
  { no: 12, title: 'Fahrgeschwindigkeit, Bremsen, Abstand halten' },
  { no: 13, title: 'Verkehrsverhalten bei Fahrmanövern' },
  { no: 14, title: 'Besondere Verkehrssituationen und Zusammenfassung' },
];

// Vorgeschriebene Sonderfahrten für Klasse B
const specialDrives = [
  { id: 'ueberland', label: 'Überlandfahrten', required: 5 },
  { id: 'autobahn', label: 'Autobahnfahrten', required: 4 },
  { id: 'nacht', label: 'Nacht- und Dämmerungsfahrten', required: 3 },
];

// ---------------------------------------------------------------------
// Rechtstexte
// ACHTUNG: Impressum und Datenschutzerklärung sind rechtlich
// verpflichtend und müssen vor dem Livegang von der Fahrschule
// vervollständigt und im Zweifel anwaltlich geprüft werden.
// Die Platzhalter hier sind kein Ersatz dafür.
// ---------------------------------------------------------------------
const legal = {
  imprint: {
    company: 'Fahrschule Nusser',
    owner: 'Mathias Nusser',
    street: 'Borchener Str. 15',
    zip: '33098',
    city: 'Paderborn',
    phone: '05251 74752',
    email: 'TODO-info@fahrschule-nusser.de', // TODO
    vatId: 'TODO: Umsatzsteuer-Identifikationsnummer', // TODO
    authority: 'TODO: zuständige Aufsichtsbehörde eintragen', // TODO
    licenseInfo: 'TODO: Fahrlehrererlaubnis nach dem Fahrlehrergesetz (FahrlG), erteilt in Deutschland', // TODO
    responsible: 'TODO: inhaltlich verantwortliche Person nach § 18 Abs. 2 MStV', // TODO
  },
  privacyContact: 'TODO: Ansprechpartner für den Datenschutz', // TODO
};

module.exports = {
  business,
  locations,
  licenseGroups,
  licenseOptions,
  pricing,
  steps,
  team,
  faq,
  theoryLessons,
  specialDrives,
  legal,
};
