// script.js - simple interactions for WowMe company page

document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.getElementById('navToggle');
  const globalNav = document.getElementById('globalNav');

  if (navToggle && globalNav) {
    navToggle.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      if (!expanded) {
        globalNav.style.display = 'flex';
        globalNav.style.flexDirection = 'column';
        globalNav.style.gap = '12px';
      } else {
        globalNav.style.display = 'none';
      }
    });

    // ensure responsive state on resize
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) {
        globalNav.style.display = 'flex';
        globalNav.style.flexDirection = 'row';
      } else {
        globalNav.style.display = 'none';
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // contact form handling - basic client-side feedback (production: replace with API)
  window.handleForm = function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      alert('必須項目をすべて入力してください。');
      return false;
    }

    // Simulate send
    console.log('Contact form send:', { name, email, message });
    alert('お問い合わせを受け付けました。追ってご連絡いたします。');
    e.target.reset();
    return false;
  };

  window.resetForm = function () {
    const form = document.getElementById('contactForm');
    if (form) form.reset();
  };
});
