(function () {
  const auth = window.AyutaAuth;
  if (!auth) return;

  const elements = {
    locked: document.getElementById('profile-locked'),
    lockedStatus: document.getElementById('profile-locked-status'),
    authenticated: document.getElementById('profile-authenticated'),
    name: document.getElementById('profile-name'),
    email: document.getElementById('profile-email'),
    phone: document.getElementById('profile-phone'),
    note: document.getElementById('profile-note'),
    nameInput: document.getElementById('profile-name-input'),
    emailInput: document.getElementById('profile-email-input'),
    phoneInput: document.getElementById('profile-phone-input'),
    form: document.getElementById('profile-form'),
    status: document.getElementById('profile-status'),
    logout: document.getElementById('logout-button')
  };

  const setStatus = (node, message, state) => {
    if (!node) return;
    node.textContent = message || '';
    node.classList.remove('is-success', 'is-error');
    if (state === 'success') node.classList.add('is-success');
    if (state === 'error') node.classList.add('is-error');
  };

  const setLockedState = (snapshot) => {
    if (elements.locked) elements.locked.hidden = false;
    if (elements.authenticated) elements.authenticated.hidden = true;

    if (!elements.lockedStatus) return;
    if (snapshot.loading) {
      elements.lockedStatus.textContent = 'Checking your session.';
      return;
    }
    if (!snapshot.configured) {
      elements.lockedStatus.textContent = 'Authentication is not configured yet. Add your Firebase project values in scripts/auth-config.js.';
      return;
    }
    elements.lockedStatus.textContent = 'Sign in to view and edit your profile.';
  };

  const setAuthenticatedState = (snapshot) => {
    const profile = snapshot.profile || {};

    if (elements.locked) elements.locked.hidden = true;
    if (elements.authenticated) elements.authenticated.hidden = false;

    if (elements.name) elements.name.textContent = profile.name || 'Not set';
    if (elements.email) elements.email.textContent = profile.email || snapshot.user.email || 'Not set';
    if (elements.phone) elements.phone.textContent = profile.phone || 'Not set';
    if (elements.nameInput) elements.nameInput.value = profile.name || '';
    if (elements.emailInput) elements.emailInput.value = profile.email || snapshot.user.email || '';
    if (elements.phoneInput) elements.phoneInput.value = profile.phone || '';
    if (elements.note) {
      elements.note.textContent = snapshot.user.emailVerified
        ? 'Your login email is verified.'
        : 'Your login email is not verified yet. Check your inbox for the verification email.';
    }
  };

  const render = async () => {
    await auth.whenReady();
    const snapshot = auth.getSnapshot();

    if (!snapshot.user) {
      setLockedState(snapshot);
      return;
    }

    setAuthenticatedState(snapshot);
  };

  if (elements.form) {
    elements.form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = elements.nameInput ? elements.nameInput.value.trim() : '';
      const phone = elements.phoneInput ? elements.phoneInput.value.trim() : '';

      if (!name) {
        setStatus(elements.status, 'Full name is required.', 'error');
        return;
      }

      try {
        setStatus(elements.status, 'Saving profile...');
        await auth.saveProfile({ name, phone });
        setStatus(elements.status, 'Profile updated.', 'success');
        render();
      } catch (error) {
        setStatus(elements.status, error.message, 'error');
      }
    });
  }

  if (elements.logout) {
    elements.logout.addEventListener('click', async () => {
      try {
        await auth.logout();
      } catch (error) {
        setStatus(elements.status, error.message, 'error');
      }
    });
  }

  window.addEventListener('ayuta:auth-updated', render);
  render();
})();
