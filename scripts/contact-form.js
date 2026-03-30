document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const recipient = form.getAttribute('data-mailto') || 'ayuta.info@gmail.com';
    const nameField = form.querySelector('[name="name"]');
    const emailField = form.querySelector('[name="email"]');
    const reasonField = form.querySelector('[name="reason"]');
    const messageField = form.querySelector('[name="message"]');
    const nameValue = nameField ? nameField.value : '';
    const emailValue = emailField ? emailField.value : '';
    const reasonValue = reasonField ? reasonField.value : 'Feedback';
    const messageValue = messageField ? messageField.value : '';

    const subject = encodeURIComponent(`${reasonValue} from ${nameValue}`);
    const body = encodeURIComponent(`Name: ${nameValue}\nEmail: ${emailValue}\nReason: ${reasonValue}\n\n${messageValue}`);
    const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;

    window.location.href = mailto;
  });
});
