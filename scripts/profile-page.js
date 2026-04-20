(function () {
  const auth = window.AyutaAuth;
  if (!auth) return;

  const elements = {
    locked: document.getElementById('profile-locked'),
    lockedStatus: document.getElementById('profile-locked-status'),
    authenticated: document.getElementById('profile-authenticated'),
    displayName: document.getElementById('profile-display-name'),
    note: document.getElementById('profile-note'),
    emailNote: document.getElementById('profile-email-note'),
    nameInput: document.getElementById('profile-name-input'),
    emailInput: document.getElementById('profile-email-input'),
    phoneInput: document.getElementById('profile-phone-input'),
    form: document.getElementById('profile-form'),
    status: document.getElementById('profile-status'),
    editToggle: document.getElementById('profile-edit-toggle'),
    saveButton: document.getElementById('profile-save'),
    cancelButton: document.getElementById('profile-cancel')
  };

  let isEditing = false;

  const formatDisplayName = (profile, user) => {
    const explicit = profile.name || '';
    if (explicit) return explicit;
    const email = profile.email || user.email || '';
    if (!email) return 'Account holder';
    const local = email.split('@')[0] || '';
    const cleaned = local.replace(/[._-]+/g, ' ').trim();
    return cleaned ? cleaned.replace(/\b\w/g, (char) => char.toUpperCase()) : email;
  };

  const setStatus = (node, message, state) => {
    if (!node) return;
    node.textContent = message || '';
    node.classList.remove('is-success', 'is-error', 'is-loading');
    if (state === 'success') node.classList.add('is-success');
    if (state === 'error') node.classList.add('is-error');
    if (state === 'loading') node.classList.add('is-loading');
  };

  const setButtonLoading = (button, isLoading) => {
    if (!button) return;
    if (isLoading) {
      if (!button.dataset.originalLabel) button.dataset.originalLabel = button.textContent;
      button.disabled = true;
      button.classList.add('is-loading');
      return;
    }

    button.disabled = false;
    button.classList.remove('is-loading');
    if (button.dataset.originalLabel) button.textContent = button.dataset.originalLabel;
  };

  const syncFieldState = () => {
    if (elements.authenticated) elements.authenticated.classList.toggle('is-editing', isEditing);
    if (elements.nameInput) {
      elements.nameInput.readOnly = !isEditing;
      elements.nameInput.classList.toggle('is-readonly', !isEditing);
    }
    if (elements.phoneInput) {
      elements.phoneInput.readOnly = !isEditing;
      elements.phoneInput.classList.toggle('is-readonly', !isEditing);
    }
    if (elements.emailInput) {
      elements.emailInput.readOnly = true;
      elements.emailInput.classList.add('is-readonly');
    }
    if (elements.editToggle) {
      elements.editToggle.setAttribute('aria-pressed', String(isEditing));
      elements.editToggle.setAttribute('aria-label', isEditing ? 'Close edit mode' : 'Edit profile');
      const icon = elements.editToggle.querySelector('span');
      if (icon) icon.className = isEditing ? 'fa-solid fa-xmark' : 'fa-solid fa-pen-to-square';
    }
    if (elements.saveButton) elements.saveButton.hidden = !isEditing;
    if (elements.cancelButton) elements.cancelButton.hidden = !isEditing;
  };

  const renderVerificationNote = (snapshot) => {
    if (!elements.note) return;
    if (snapshot.user.emailVerified) {
      elements.note.innerHTML =
        '<span class="profile-note-line"><span class="fa-solid fa-circle-check" aria-hidden="true"></span><span>Your login email is verified.</span></span>';
      return;
    }

    elements.note.innerHTML =
      '<span class="profile-note-line"><span class="fa-solid fa-circle-exclamation" aria-hidden="true"></span><span>Your login email is not verified yet. Check your inbox for the verification email.</span></span>' +
      '<span class="profile-note-meta"><span class="fa-solid fa-envelope-open-text" aria-hidden="true"></span><span>If you do not see it, check your spam or junk folder as well.</span></span>';
  };

  const renderEmailNote = () => {
    if (!elements.emailNote) return;
    elements.emailNote.innerHTML =
      '<span class="profile-note-line"><span class="fa-solid fa-lock" aria-hidden="true"></span><span>Email is managed by the login account. Use edit mode to update name or phone.</span></span>';
  };

  const resetFormValues = (snapshot) => {
    const profile = snapshot.profile || {};
    if (elements.displayName) elements.displayName.textContent = formatDisplayName(profile, snapshot.user);
    if (elements.nameInput) elements.nameInput.value = profile.name || '';
    if (elements.emailInput) elements.emailInput.value = profile.email || snapshot.user.email || '';
    if (elements.phoneInput) elements.phoneInput.value = profile.phone || '';
    renderVerificationNote(snapshot);
    renderEmailNote();
  };

  const setEditing = (nextValue, snapshot, clearStatus = false) => {
    isEditing = nextValue;
    syncFieldState();
    if (!isEditing && snapshot) resetFormValues(snapshot);
    if (clearStatus) setStatus(elements.status, '');
  };

  const setLockedState = (snapshot) => {
    if (elements.locked) elements.locked.hidden = false;
    if (elements.authenticated) elements.authenticated.hidden = true;

    if (!elements.lockedStatus) return;
    if (snapshot.loading) {
      setStatus(elements.lockedStatus, 'Checking your session.', 'loading');
      return;
    }
    if (!snapshot.configured) {
      setStatus(elements.lockedStatus, 'Authentication is not configured yet. Add your project values in scripts/auth-config.js.');
      return;
    }
    setStatus(elements.lockedStatus, 'Sign in to view and edit your profile.');
  };

  const setAuthenticatedState = (snapshot) => {
    if (elements.locked) elements.locked.hidden = true;
    if (elements.authenticated) elements.authenticated.hidden = false;
    resetFormValues(snapshot);
    setEditing(false, snapshot);
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
        setButtonLoading(elements.saveButton, true);
        setStatus(elements.status, 'Saving profile...', 'loading');
        await auth.saveProfile({ name, phone });
        setStatus(elements.status, 'Profile updated.', 'success');
        isEditing = false;
        render();
      } catch (error) {
        setStatus(elements.status, error.message, 'error');
      } finally {
        setButtonLoading(elements.saveButton, false);
      }
    });
  }

  if (elements.editToggle) {
    elements.editToggle.addEventListener('click', () => {
      const snapshot = auth.getSnapshot();
      if (!snapshot.user) return;
      if (isEditing) {
        setEditing(false, snapshot, true);
        return;
      }
      isEditing = true;
      syncFieldState();
      if (elements.nameInput) elements.nameInput.focus();
      setStatus(elements.status, '');
    });
  }

  if (elements.cancelButton) {
    elements.cancelButton.addEventListener('click', () => {
      const snapshot = auth.getSnapshot();
      if (!snapshot.user) return;
      setEditing(false, snapshot, true);
    });
  }

  window.addEventListener('ayuta:auth-updated', render);
  render();
})();
