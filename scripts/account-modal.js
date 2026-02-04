(function () {
  const getStore = () => window.AyutaStore;
  let modalRoot = null;

  const setStatus = (node, message, state) => {
    if (!node) return;
    node.textContent = message;
    node.classList.remove('is-success', 'is-error');
    if (state === 'success') node.classList.add('is-success');
    if (state === 'error') node.classList.add('is-error');
  };

  const setActiveTab = (tabName) => {
    if (!modalRoot) return;
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
  };

  const prefillFields = () => {
    if (!modalRoot) return;
    const store = getStore();
    if (!store) return;
    const state = store.loadState();
    const loginEmail = modalRoot.querySelector('#account-login-email');
    const registerEmail = modalRoot.querySelector('#account-email');
    const registerName = modalRoot.querySelector('#account-name');
    const registerPhone = modalRoot.querySelector('#account-phone');
    const email = state.session?.email || state.user?.email || state.paymentEmail || '';

    if (loginEmail && !loginEmail.value) loginEmail.value = email;
    if (registerEmail && !registerEmail.value) registerEmail.value = email;
    if (registerName && !registerName.value) registerName.value = state.user?.name || '';
    if (registerPhone && !registerPhone.value) registerPhone.value = state.user?.phone || '';
  };

  const openModal = (tabName) => {
    if (!modalRoot) return;
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
  };

  const init = (navRoot) => {
    modalRoot = document.querySelector('[data-account-modal]');
    if (!modalRoot) return;

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

    const store = getStore();
    if (!store) return;
    const loginForm = modalRoot.querySelector('[data-account-pane="login"]');
    const registerForm = modalRoot.querySelector('[data-account-pane="register"]');
    const loginStatus = modalRoot.querySelector('[data-account-status="login"]');
    const registerStatus = modalRoot.querySelector('[data-account-status="register"]');

    prefillFields();

    if (loginForm) {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const emailField = loginForm.querySelector('#account-login-email');
        const email = emailField ? emailField.value.trim() : '';
        if (!email) {
          setStatus(loginStatus, 'Enter your email to continue.', 'error');
          return;
        }
        const state = store.loadState();
        const hasOrder = state.orders.some((order) => order.email === email);
        const hasProfile = state.user && state.user.email === email;
        if (!hasOrder && !hasProfile) {
          setStatus(loginStatus, 'No order found for that email yet.', 'error');
          return;
        }

        state.session = { email, loggedInAt: new Date().toISOString() };
        store.saveState(state);
        setStatus(loginStatus, 'Logged in. Your pages are updated.', 'success');
        window.dispatchEvent(new CustomEvent('ayuta:auth-updated'));
        window.dispatchEvent(new CustomEvent('ayuta:state-updated'));
        closeModal();
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const nameField = registerForm.querySelector('#account-name');
        const emailField = registerForm.querySelector('#account-email');
        const phoneField = registerForm.querySelector('#account-phone');
        const name = nameField ? nameField.value.trim() : '';
        const email = emailField ? emailField.value.trim() : '';
        if (!name || !email) {
          setStatus(registerStatus, 'Name and email are required.', 'error');
          return;
        }

        const state = store.loadState();
        state.user = {
          name,
          email,
          phone: phoneField ? phoneField.value.trim() : '',
          updatedAt: new Date().toISOString()
        };
        state.session = { email, loggedInAt: new Date().toISOString() };
        store.saveState(state);
        setStatus(registerStatus, 'Profile saved and signed in.', 'success');
        window.dispatchEvent(new CustomEvent('ayuta:auth-updated'));
        window.dispatchEvent(new CustomEvent('ayuta:state-updated'));
        closeModal();
      });
    }
  };

  window.AyutaAccount = {
    init,
    open: openModal,
    close: closeModal
  };
})();
