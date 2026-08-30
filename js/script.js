// Mobile navigation toggle
const header = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && header) {
  navToggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      header.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Contact form: client-side only placeholder.
// NOTE: This form does not send data anywhere yet. To make it functional,
// connect it to an email/form service (e.g. Formspree, Netlify Forms,
// or a custom backend) and update the fetch/action logic below.
const contactForm = document.getElementById('contact-form');
const formNote = document.getElementById('form-note');

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      formNote.textContent = 'Bitte füllen Sie alle Pflichtfelder (*) aus.';
      contactForm.reportValidity();
      return;
    }

    formNote.textContent = 'Vielen Dank für Ihre Anfrage! Wir melden uns schnellstmöglich bei Ihnen.';
    contactForm.reset();
  });
}
