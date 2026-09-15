// Mobile Navigation auf- und zuklappen.
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('hauptnavigation');
  if (!toggle || !nav) return;

  const schmal = () => window.matchMedia('(max-width: 1000px)').matches;

  function setzeZustand(offen) {
    toggle.setAttribute('aria-expanded', String(offen));
    nav.hidden = !offen;
  }

  // Im schmalen Layout startet das Menü eingeklappt, im breiten ist es
  // immer sichtbar (dort blendet CSS den Umschalter aus).
  function anLayoutAnpassen() {
    if (schmal()) setzeZustand(toggle.getAttribute('aria-expanded') === 'true' && !nav.hidden);
    else { nav.hidden = false; toggle.setAttribute('aria-expanded', 'false'); }
  }

  setzeZustand(false);
  anLayoutAnpassen();

  toggle.addEventListener('click', () => {
    setzeZustand(nav.hidden);
  });

  // Nach einem Klick auf einen Menüpunkt wieder schließen.
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && schmal()) setzeZustand(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && schmal() && !nav.hidden) {
      setzeZustand(false);
      toggle.focus();
    }
  });

  window.addEventListener('resize', anLayoutAnpassen);
})();
