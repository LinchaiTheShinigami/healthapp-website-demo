(function () {
  const store = window.AyutaStore;
  if (!store) return;

  const elements = {
    name: document.getElementById('profile-name'),
    email: document.getElementById('profile-email'),
    phone: document.getElementById('profile-phone'),
    nameInput: document.getElementById('profile-name-input'),
    emailInput: document.getElementById('profile-email-input'),
    phoneInput: document.getElementById('profile-phone-input'),
    form: document.getElementById('profile-form'),
    status: document.getElementById('profile-status'),
    logout: document.getElementById('logout-button')
  };

  const setStatus = (node, message, state) => {
    if (!node) return;
    node.textContent = message;
    node.classList.remove('is-success', 'is-error');
    if (state === 'success') node.classList.add('is-success');
    if (state === 'error') node.classList.add('is-error');
  };

  const render = () => {
    const state = store.loadState();
    const profile = state.user || {};
    if (elements.name) elements.name.textContent = profile.name || 'Not set';
    if (elements.email) elements.email.textContent = profile.email || 'Not set';
    if (elements.phone) elements.phone.textContent = profile.phone || 'Not set';

    if (elements.nameInput && !elements.nameInput.value) elements.nameInput.value = profile.name || '';
    if (elements.emailInput && !elements.emailInput.value) elements.emailInput.value = profile.email || '';
    if (elements.phoneInput && !elements.phoneInput.value) elements.phoneInput.value = profile.phone || '';
  };

  if (elements.form) {
    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = elements.nameInput ? elements.nameInput.value.trim() : '';
      const email = elements.emailInput ? elements.emailInput.value.trim() : '';
      if (!name || !email) {
        setStatus(elements.status, 'Name and email are required.', 'error');
        return;
      }

      const state = store.loadState();
      state.user = {
        name,
        email,
        phone: elements.phoneInput ? elements.phoneInput.value.trim() : '',
        updatedAt: new Date().toISOString()
      };
      state.session = { email, loggedInAt: new Date().toISOString() };
      store.saveState(state);
      setStatus(elements.status, 'Profile updated.', 'success');
      window.dispatchEvent(new CustomEvent('ayuta:auth-updated'));
      window.dispatchEvent(new CustomEvent('ayuta:state-updated'));
      render();
    });
  }

  if (elements.logout) {
    elements.logout.addEventListener('click', () => {
      const state = store.loadState();
      state.session = null;
      store.saveState(state);
      window.dispatchEvent(new CustomEvent('ayuta:auth-updated'));
      window.dispatchEvent(new CustomEvent('ayuta:state-updated'));
      render();
      setStatus(elements.status, 'Signed out.', 'success');
    });
  }

  window.addEventListener('ayuta:state-updated', render);
  window.addEventListener('ayuta:auth-updated', render);
  render();
})();
