(function () {
  const ACCESS_KEYS = {
    text: 'ayuta_accessibility_text',
    contrast: 'ayuta_accessibility_contrast'
  };

  const getInitial = (value) => {
    if (!value) return 'U';
    const trimmed = value.trim();
    if (!trimmed) return 'U';
    return trimmed.charAt(0).toUpperCase();
  };

  const readFlag = (key) => {
    try {
      return localStorage.getItem(key) === 'true';
    } catch (error) {
      return false;
    }
  };

  const writeFlag = (key, value) => {
    try {
      localStorage.setItem(key, String(value));
    } catch (error) {
      return;
    }
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

  const getPageKey = () => {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (!page || page === 'index.html') return 'home';
    return page.replace('.html', '');
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

  const toggleAuthControls = (navRoot, isLoggedIn) => {
    const loginButton = navRoot.querySelector('.nav-login');
    const userMenu = navRoot.querySelector('[data-user-menu]');
    if (loginButton) loginButton.hidden = isLoggedIn;
    if (userMenu) userMenu.hidden = !isLoggedIn;
  };

  const applyPageLayout = (navRoot) => {
    const page = getPageKey();
    const navLinks = navRoot.querySelector('.nav-links');
    const mobileButton = navRoot.querySelector('.nav-mobile');
    const homeButton = navRoot.querySelector('.nav-home-btn');
    const userMenuToggle = navRoot.querySelector('[data-user-menu-toggle]');
    const userMenuPanel = navRoot.querySelector('.nav-menu');

    const isOrderPage = page === 'order';
    const isOrdersPage = page === 'orders';
    const isWebappPage = page === 'webapp';

    if (navLinks) navLinks.hidden = isOrderPage || isOrdersPage;
    if (mobileButton) mobileButton.hidden = isOrderPage || isOrdersPage || isWebappPage;
    if (homeButton) homeButton.hidden = !isWebappPage;
    if (userMenuToggle) userMenuToggle.hidden = isOrderPage || isOrdersPage;
    if (userMenuPanel) userMenuPanel.hidden = isOrderPage || isOrdersPage;
  };

  const applyAccessibilityState = (navRoot) => {
    const isLargeText = readFlag(ACCESS_KEYS.text);
    const isHighContrast = readFlag(ACCESS_KEYS.contrast);
    document.body.classList.toggle('is-large-text', isLargeText);
    document.body.classList.toggle('is-high-contrast', isHighContrast);

    const textToggle = navRoot.querySelector('[data-accessibility="text"]');
    const contrastToggle = navRoot.querySelector('[data-accessibility="contrast"]');
    if (textToggle) textToggle.setAttribute('aria-pressed', String(isLargeText));
    if (contrastToggle) contrastToggle.setAttribute('aria-pressed', String(isHighContrast));
  };

  let loginBound = false;
  let accessibilityBound = false;
  let userMenuBound = false;

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

  const bindAccessibility = (navRoot) => {
    if (accessibilityBound) return;
    const textToggle = navRoot.querySelector('[data-accessibility="text"]');
    const contrastToggle = navRoot.querySelector('[data-accessibility="contrast"]');
    if (textToggle) {
      textToggle.addEventListener('click', () => {
        const nextValue = !readFlag(ACCESS_KEYS.text);
        writeFlag(ACCESS_KEYS.text, nextValue);
        applyAccessibilityState(navRoot);
      });
    }
    if (contrastToggle) {
      contrastToggle.addEventListener('click', () => {
        const nextValue = !readFlag(ACCESS_KEYS.contrast);
        writeFlag(ACCESS_KEYS.contrast, nextValue);
        applyAccessibilityState(navRoot);
      });
    }
    accessibilityBound = true;
  };

  const bindUserMenu = (navRoot) => {
    if (userMenuBound) return;
    const userMenu = navRoot.querySelector('[data-user-menu]');
    const toggleButton = navRoot.querySelector('[data-user-menu-toggle]');
    if (!userMenu || !toggleButton) return;

    const closeMenu = () => {
      userMenu.classList.remove('is-open');
      toggleButton.setAttribute('aria-expanded', 'false');
    };

    toggleButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = userMenu.classList.toggle('is-open');
      toggleButton.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (event) => {
      if (!userMenu.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    userMenuBound = true;
  };

  const refresh = (navRoot) => {
    const session = readSession();
    const user = readUser();
    const isLoggedIn = Boolean(session && session.email);
    toggleAuthItems(navRoot, isLoggedIn);
    updateProfileIcon(navRoot, user, session);
    toggleAuthControls(navRoot, isLoggedIn);
    applyPageLayout(navRoot);
    applyAccessibilityState(navRoot);
    navRoot.classList.toggle('is-authenticated', isLoggedIn);
  };

  const init = (navRoot) => {
    if (!navRoot) return;
    bindLoginButtons(document);
    bindAccessibility(navRoot);
    bindUserMenu(navRoot);
    refresh(navRoot);
    window.addEventListener('ayuta:auth-updated', () => refresh(navRoot));
  };

  window.AyutaNav = { init, refresh };
})();
