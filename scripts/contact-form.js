document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const recipient = form.getAttribute('data-mailto') || 'ayuta.info@gmail.com';
    const nameField = form.querySelector('[name="name"]');
    const emailField = form.querySelector('[name="email"]');
    const messageField = form.querySelector('[name="message"]');
    const nameValue = nameField ? nameField.value : '';
    const emailValue = emailField ? emailField.value : '';
    const messageValue = messageField ? messageField.value : '';

    const subject = encodeURIComponent(`Message from ${nameValue}`);
    const body = encodeURIComponent(`Name: ${nameValue}\nEmail: ${emailValue}\n\n${messageValue}`);
    const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;

    window.location.href = mailto;
  });
});
