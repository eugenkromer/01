// Sofortsuche in Listen. Jedes Element mit [data-suche] wird mit dem
// Suchbegriff verglichen; was nicht passt, wird ausgeblendet. Gefiltert
// wird im Browser, damit die Liste ohne Warten auf den Server reagiert -
// bei einer Fahrschule mit ein paar Hundert Fahrschülern ist das
// reichlich schnell.
(function () {
  document.querySelectorAll('[data-sucht-in]').forEach(function (feld) {
    const behaelter = document.querySelector(feld.dataset.suchtIn);
    if (!behaelter) return;

    const zeilen = Array.from(behaelter.querySelectorAll('[data-suche]'));
    const zaehler = feld.parentElement.querySelector('[data-suche-zaehler]');
    const leerHinweis = document.querySelector(feld.dataset.leerHinweis || '---');

    // Umlaute und Groß-/Kleinschreibung sollen bei der Suche egal sein:
    // "muller" findet auch "Müller".
    function vereinfachen(text) {
      return text
        .toLowerCase()
        .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
        .normalize('NFD').replace(/[̀-ͯ]/g, '');
    }

    for (const zeile of zeilen) {
      zeile.dataset.sucheNorm = vereinfachen(zeile.dataset.suche);
    }

    function filtern() {
      const begriff = vereinfachen(feld.value.trim());
      let sichtbar = 0;

      for (const zeile of zeilen) {
        const passt = !begriff || zeile.dataset.sucheNorm.includes(begriff);
        zeile.hidden = !passt;
        if (passt) sichtbar += 1;
      }

      if (zaehler) {
        zaehler.textContent = begriff
          ? sichtbar + ' von ' + zeilen.length
          : zeilen.length + (zeilen.length === 1 ? ' Eintrag' : ' Einträge');
      }
      if (leerHinweis) leerHinweis.hidden = sichtbar > 0;
    }

    feld.addEventListener('input', filtern);

    // Escape leert das Feld - schneller als alles einzeln zu löschen
    feld.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && feld.value) {
        feld.value = '';
        filtern();
      }
    });

    filtern();
  });
})();
