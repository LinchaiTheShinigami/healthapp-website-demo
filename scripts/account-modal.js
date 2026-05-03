(function () {
  const root = globalThis;
  let modalRoot = null;
  let initialized = false;
  const POST_AUTH_TARGET_KEY = 'ayuta_post_auth_target';

  const getStoreState = () => {
    if (!root.AyutaStore || typeof root.AyutaStore.loadState !== 'function') return null;
    return root.AyutaStore.loadState();
  };

  const getAuthSnapshot = () => {
    if (!root.AyutaAuth || typeof root.AyutaAuth.getSnapshot !== 'function') return null;
    return root.AyutaAuth.getSnapshot();
  };

  const getResultsHref = () => {
    const page = root.location.pathname || '';
    if (page.endsWith('/results.html')) return null;
    return page.includes('/pages/') ? 'results.html' : 'pages/results.html';
  };

  const writePostAuthTarget = (href) => {
    if (!href) return;
    try {
      root.sessionStorage.setItem(POST_AUTH_TARGET_KEY, href);
    } catch (error) {
      console.warn(error);
    }
  };

  const readPostAuthTarget = () => {
    try {
      return root.sessionStorage.getItem(POST_AUTH_TARGET_KEY);
    } catch (error) {
      console.warn(error);
      return null;
    }
  };

  const clearPostAuthTarget = () => {
    try {
      root.sessionStorage.removeItem(POST_AUTH_TARGET_KEY);
    } catch (error) {
      console.warn(error);
    }
  };

  const redirectAfterAuth = () => {
    const target = readPostAuthTarget();
    if (target) {
      clearPostAuthTarget();
      try {
        const nextUrl = new URL(target, root.location.href);
        const currentUrl = new URL(root.location.href);
        const isCurrentView =
          nextUrl.pathname === currentUrl.pathname &&
          nextUrl.search === currentUrl.search &&
          nextUrl.hash === currentUrl.hash;
        if (!isCurrentView) {
          root.location.assign(nextUrl.href);
        }
        return;
      } catch (error) {
        console.warn(error);
      }
    }

    const href = getResultsHref();
    if (!href) return;
    root.location.assign(href);
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

  const clearStatuses = () => {
    if (!modalRoot) return;
    modalRoot.querySelectorAll('[data-account-status]').forEach((node) => setStatus(node, ''));
  };

  const setActiveTab = (tabName) => {
    if (!modalRoot) return;
    const title = modalRoot.querySelector('#account-title');
    const tabs = modalRoot.querySelectorAll('[data-account-tab]');
    const panes = modalRoot.querySelectorAll('[data-account-pane]');

    tabs.forEach((tab) => {
      const isActive = tab.getAttribute('data-account-tab') === tabName;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    panes.forEach((pane) => {
      const isActive = pane.getAttribute('data-account-pane') === tabName;
      pane.classList.toggle('is-active', isActive);
    });

    if (title) title.textContent = tabName === 'register' ? 'Create your account' : 'Your Ayuta account';
    clearStatuses();
  };

  const prefillFields = () => {
    if (!modalRoot) return;

    const authSnapshot = getAuthSnapshot();
    const storeState = getStoreState();
    const email = authSnapshot?.profile?.email || authSnapshot?.user?.email || storeState?.session?.email || storeState?.user?.email || storeState?.paymentEmail || '';
    const name = authSnapshot?.profile?.name || storeState?.user?.name || '';
    const phone = authSnapshot?.profile?.phone || storeState?.user?.phone || '';

    const loginEmail = modalRoot.querySelector('#account-login-email');
    const registerEmail = modalRoot.querySelector('#account-email');
    const registerName = modalRoot.querySelector('#account-name');
    const registerPhone = modalRoot.querySelector('#account-phone');

    if (loginEmail && !loginEmail.value) loginEmail.value = email;
    if (registerEmail && !registerEmail.value) registerEmail.value = email;
    if (registerName && !registerName.value) registerName.value = name;
    if (registerPhone && !registerPhone.value) registerPhone.value = phone;
  };

  const openModal = (tabName, options) => {
    if (!modalRoot) return;
    if (options && typeof options.returnTo === 'string') {
      writePostAuthTarget(options.returnTo);
    } else {
      clearPostAuthTarget();
    }
    modalRoot.hidden = false;
    modalRoot.classList.add('is-open');
    setActiveTab(tabName || 'login');
    prefillFields();
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    if (!modalRoot) return;
    modalRoot.hidden = true;
    modalRoot.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    clearStatuses();
  };

  const bindLoginForm = () => {
    const auth = root.AyutaAuth;
    const loginForm = modalRoot.querySelector('[data-account-pane="login"]');
    const loginStatus = modalRoot.querySelector('[data-account-status="login"]');
    const resetButton = modalRoot.querySelector('[data-account-reset]');

    if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const emailField = loginForm.querySelector('#account-login-email');
        const passwordField = loginForm.querySelector('#account-login-password');
        const email = emailField ? emailField.value.trim() : '';
        const password = passwordField ? passwordField.value : '';

        if (!email || !password) {
          setStatus(loginStatus, 'Enter your email and password.', 'error');
          return;
        }

        const submitButton = loginForm.querySelector('button[type="submit"]');
        try {
          setButtonLoading(submitButton, true);
          setStatus(loginStatus, 'Signing in...', 'loading');
          await auth.whenReady();
          await auth.login({ email, password });
          setStatus(loginStatus, 'Signed in.', 'success');
          closeModal();
          redirectAfterAuth();
        } catch (error) {
          setStatus(loginStatus, error.message, 'error');
        } finally {
          setButtonLoading(submitButton, false);
        }
      });
    }

    if (resetButton) {
      resetButton.addEventListener('click', async () => {
        const emailField = modalRoot.querySelector('#account-login-email');
        const loginEmail = emailField ? emailField.value.trim() : '';

        try {
          setButtonLoading(resetButton, true);
          setStatus(loginStatus, 'Sending reset email...', 'loading');
          await auth.sendPasswordReset(loginEmail);
          setStatus(loginStatus, 'Password reset email sent. Check your inbox.', 'success');
        } catch (error) {
          setStatus(loginStatus, error.message, 'error');
        } finally {
          setButtonLoading(resetButton, false);
        }
      });
    }
  };

  const bindRegisterForm = () => {
    const auth = root.AyutaAuth;
    const registerForm = modalRoot.querySelector('[data-account-pane="register"]');
    const registerStatus = modalRoot.querySelector('[data-account-status="register"]');

    if (!registerForm) return;

    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const nameField = registerForm.querySelector('#account-name');
      const emailField = registerForm.querySelector('#account-email');
      const phoneField = registerForm.querySelector('#account-phone');
      const passwordField = registerForm.querySelector('#account-password');

      const name = nameField ? nameField.value.trim() : '';
      const email = emailField ? emailField.value.trim() : '';
      const phone = phoneField ? phoneField.value.trim() : '';
      const password = passwordField ? passwordField.value : '';

      if (!name || !email || password.length < 8) {
        setStatus(registerStatus, 'Enter your name, email, and a password with at least 8 characters.', 'error');
        return;
      }

      const submitButton = registerForm.querySelector('button[type="submit"]');
      try {
        setButtonLoading(submitButton, true);
        setStatus(registerStatus, 'Creating your account...', 'loading');
        await auth.whenReady();
        const result = await auth.register({ name, email, phone, password });
        setStatus(
          registerStatus,
          result.verificationSent
            ? 'Account created. You are signed in and a verification email has been sent.'
            : 'Account created. You are now signed in.',
          'success'
        );
        closeModal();
        redirectAfterAuth();
      } catch (error) {
        setStatus(registerStatus, error.message, 'error');
      } finally {
        setButtonLoading(submitButton, false);
      }
    });
  };

  const init = () => {
    if (initialized) return;
    modalRoot = document.querySelector('[data-account-modal]');
    if (!modalRoot || !root.AyutaAuth) return;

    modalRoot.querySelectorAll('[data-account-close]').forEach((button) => {
      button.addEventListener('click', closeModal);
    });

    modalRoot.addEventListener('click', (event) => {
      if (event.target.matches('[data-account-modal]')) {
        closeModal();
      }
    });

    modalRoot.querySelectorAll('[data-account-tab]').forEach((tab) => {
      tab.addEventListener('click', () => setActiveTab(tab.getAttribute('data-account-tab')));
    });

    bindLoginForm();
    bindRegisterForm();
    prefillFields();

    root.addEventListener('ayuta:auth-updated', () => {
      const snapshot = getAuthSnapshot();
      if (snapshot && snapshot.user && modalRoot.classList.contains('is-open')) {
        closeModal();
      } else {
        prefillFields();
      }
    });

    initialized = true;
  };

  root.AyutaAccount = {
    init,
    open: openModal,
    close: closeModal
  };
})();
