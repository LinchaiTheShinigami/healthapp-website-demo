(function () {
  const getInitial = (value) => {
    if (!value) return 'U';
    const trimmed = value.trim();
    if (!trimmed) return 'U';
    return trimmed.charAt(0).toUpperCase();
  };

  const readSession = () => {
    if (window.AyutaStore) {
      const state = window.AyutaStore.loadState();
      return state.session;
    }
    try {
      return JSON.parse(localStorage.getItem('ayuta_session') || 'null');
    } catch (error) {
      return null;
    }
  };

  const readUser = () => {
    if (window.AyutaStore) {
      const state = window.AyutaStore.loadState();
      return state.user;
    }
    try {
      return JSON.parse(localStorage.getItem('ayuta_user') || 'null');
    } catch (error) {
      return null;
    }
  };

  const toggleAuthItems = (navRoot, isLoggedIn) => {
    navRoot.querySelectorAll('[data-auth="required"]').forEach((item) => {
      item.hidden = !isLoggedIn;
    });
  };

  const updateProfileIcon = (navRoot, user, session) => {
    const profile = navRoot.querySelector('[data-profile-initial]');
    if (!profile) return;
    const nameSource = user?.name || session?.email || '';
    profile.textContent = getInitial(nameSource);
  };

  let loginBound = false;

  const bindLoginButtons = (navRoot) => {
    if (loginBound) return;
    const root = navRoot || document;
    root.querySelectorAll('[data-login-trigger]').forEach((button) => {
      button.addEventListener('click', () => {
        if (window.AyutaAccount && typeof window.AyutaAccount.open === 'function') {
          window.AyutaAccount.open('login');
        }
      });
    });
    loginBound = true;
  };

  const refresh = (navRoot) => {
    const session = readSession();
    const user = readUser();
    const isLoggedIn = Boolean(session && session.email);
    toggleAuthItems(navRoot, isLoggedIn);
    updateProfileIcon(navRoot, user, session);
    navRoot.classList.toggle('is-authenticated', isLoggedIn);
  };

  const init = (navRoot) => {
    if (!navRoot) return;
    bindLoginButtons(document);
    refresh(navRoot);
    window.addEventListener('ayuta:auth-updated', () => refresh(navRoot));
  };

  window.AyutaNav = { init, refresh };
})();
