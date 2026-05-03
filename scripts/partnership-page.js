// Paste your deployed Apps Script Web App URL here.
// See docs/partnership-enquiry-apps-script.gs for setup instructions.
const PARTNERSHIP_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzGFN4wFju6tO3uw_5Uw4LcW4kL8BFlWstXwkiYqMoDkfS6GkWijGSDBtCyvW188Eqe8A/exec';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.partner-form');
  if (!form) return;

  const submitBtn   = form.querySelector('button[type="submit"]');
  const statusEl    = form.querySelector('.partner-form-status');

  const setStatus = (type, text) => {
    statusEl.textContent = text;
    statusEl.className = `partner-form-status partner-form-status--${type}`;
    statusEl.hidden = false;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name    = form.querySelector('[name="name"]')?.value.trim() || '';
    const email   = form.querySelector('[name="email"]')?.value.trim() || '';
    const gym     = form.querySelector('[name="gym"]')?.value.trim() || '';
    const model   = form.querySelector('[name="model"]')?.value || 'Individual Opt-In';
    const message = form.querySelector('[name="message"]')?.value.trim() || '';

    // Fall back to mailto if Apps Script URL not yet configured
    if (!PARTNERSHIP_APPS_SCRIPT_URL || PARTNERSHIP_APPS_SCRIPT_URL.startsWith('PASTE_')) {
      const subject = encodeURIComponent(`Gym partnership enquiry from ${gym || name}`);
      const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nGym or studio: ${gym}\nPreferred model: ${model}\n\n${message}`);
      const recipient = form.dataset.mailto || 'ayuta.info@gmail.com';
      const a = document.createElement('a');
      a.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending\u2026';
    statusEl.hidden = true;

    try {
      const params = new URLSearchParams({ name, email, gym, model, message });
      const res  = await fetch(PARTNERSHIP_APPS_SCRIPT_URL, {
        method: 'POST',
        // Apps Script requires form-urlencoded (no CORS preflight on GET/POST with this content type)
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      const data = await res.json().catch(() => ({}));

      if (data.success) {
        form.reset();
        submitBtn.textContent = 'Enquiry sent';
        setStatus('success', 'Thanks \u2014 we\u2019ll be in touch within one working day.');
      } else {
        throw new Error(data.error || 'Unexpected response');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send partnership enquiry';
      setStatus('error', 'Something went wrong. Please try again or email us directly.');
    }
  });
});
