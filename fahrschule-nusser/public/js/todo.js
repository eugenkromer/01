// Hebt Platzhalter hervor, die noch durch echte Inhalte ersetzt werden
// müssen: jeder sichtbare Text, der mit "TODO" beginnt, bekommt eine
// gelbe Markierung. Das ist eine reine Redaktionshilfe während des
// Aufbaus – sobald alle Platzhalter in src/content.js ersetzt sind,
// findet dieses Skript nichts mehr und kann entfernt werden.
(function () {
  const lauf = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const treffer = [];
  let knoten;
  while ((knoten = lauf.nextNode())) {
    if (knoten.nodeValue.trim().startsWith('TODO')) treffer.push(knoten);
  }
  for (const textKnoten of treffer) {
    const eltern = textKnoten.parentNode;
    if (!eltern || eltern.classList.contains('todo')) continue;
    const marke = document.createElement('span');
    marke.className = 'todo';
    marke.title = 'Platzhalter – bitte in src/content.js ersetzen';
    eltern.replaceChild(marke, textKnoten);
    marke.appendChild(textKnoten);
  }
})();
