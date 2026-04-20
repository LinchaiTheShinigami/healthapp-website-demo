document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.partner-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const recipient = form.getAttribute('data-mailto') || 'ayuta.info@gmail.com';
    const name = form.querySelector('[name="name"]')?.value || '';
    const email = form.querySelector('[name="email"]')?.value || '';
    const gym = form.querySelector('[name="gym"]')?.value || '';
    const model = form.querySelector('[name="model"]')?.value || 'Individual Opt-In';
    const message = form.querySelector('[name="message"]')?.value || '';

    const subject = encodeURIComponent(`Gym partnership enquiry from ${gym || name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nGym or studio: ${gym}\nPreferred model: ${model}\n\n${message}`
    );

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  });
});
