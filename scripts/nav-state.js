(function () {
  const ACCESS_KEYS = {
    text: 'ayuta_accessibility_text',
    contrast: 'ayuta_accessibility_contrast'
  };

  const APP_PAGES = new Set(['results', 'orders', 'profile', 'order', 'payment-return']);
  const TRANSITION_STORAGE_KEY = 'ayuta_page_transition';
  const TRANSITION_MAX_AGE_MS = 12000;
  const PAGE_LABELS = {
    results: 'Results dashboard',
    orders: 'Orders',
    order: 'Book tests',
    profile: 'Profile',
    'payment-return': 'Payment',
    clinics: 'Clinics',
    packages: 'Packages',
    partnership: 'Gym partnerships',
    contact: 'Support',
    about: 'About',
    home: 'Home'
  };
  const readStoredTransition = () => {
    try {
      const raw = sessionStorage.getItem(TRANSITION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.href || !parsed?.label || !parsed?.time) return null;
      if (Date.now() - parsed.time > TRANSITION_MAX_AGE_MS) {
        sessionStorage.removeItem(TRANSITION_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch (error) {
      return null;
    }
  };
  const clearStoredTransition = () => {
    try {
      sessionStorage.removeItem(TRANSITION_STORAGE_KEY);
    } catch (error) {
      return;
    }
  };
  const writeStoredTransition = (href, label) => {
    try {
      sessionStorage.setItem(
        TRANSITION_STORAGE_KEY,
        JSON.stringify({
          href,
          label,
          time: Date.now()
        })
      );
    } catch (error) {
      return;
    }
  };
  const pendingTransition = (() => {
    const stored = readStoredTransition();
    if (!stored || !document.body) return null;
    try {
      const target = new URL(stored.href, window.location.href);
      const current = new URL(window.location.href);
      if (target.pathname !== current.pathname || target.search !== current.search) return null;
      document.body.classList.add('has-page-entrance', 'is-page-entering');
      return stored;
    } catch (error) {
      return null;
    }
  })();

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

  const readAuthSnapshot = () => {
    if (!window.AyutaAuth || typeof window.AyutaAuth.getSnapshot !== 'function') return null;
    try {
      return window.AyutaAuth.getSnapshot();
    } catch (error) {
      return null;
    }
  };

  const readStoreState = () => {
    if (!window.AyutaStore || typeof window.AyutaStore.loadState !== 'function') {
      return { cart: [], session: null, user: null };
    }
    return window.AyutaStore.loadState();
  };

  const readSession = () => {
    const snapshot = readAuthSnapshot();
    if (snapshot && snapshot.user) {
      return {
        uid: snapshot.user.uid,
        email: snapshot.profile?.email || snapshot.user.email || '',
        emailVerified: Boolean(snapshot.user.emailVerified)
      };
    }

    return readStoreState().session;
  };

  const readUser = () => {
    const snapshot = readAuthSnapshot();
    if (snapshot && snapshot.user) {
      return snapshot.profile || {
        uid: snapshot.user.uid,
        name: snapshot.user.displayName || '',
        email: snapshot.user.email || '',
        phone: ''
      };
    }

    return readStoreState().user;
  };

  const getPageKey = () => {
    const fromBody = document.body?.getAttribute('data-page-key');
    if (fromBody) return fromBody;
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (!page || page === 'index.html') return 'home';
    return page.replace('.html', '');
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

  const setStatus = (node, message, state) => {
    if (!node) return;
    node.textContent = message || '';
    node.classList.remove('is-success', 'is-error', 'is-loading');
    if (state === 'success') node.classList.add('is-success');
    if (state === 'error') node.classList.add('is-error');
    if (state === 'loading') node.classList.add('is-loading');
  };

  const isModifiedClick = (event) => {
    return event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
  };

  const getPublicHomeHref = () => {
    const brand = document.querySelector('.brand');
    const configuredHref = brand?.getAttribute('data-public-href') || brand?.getAttribute('href');
    if (configuredHref) return configuredHref;
    return window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
  };

  const closeCartDrawer = () => {
    const drawer = document.querySelector('[data-cart-drawer]');
    const backdrop = document.querySelector('.cart-drawer-backdrop');
    if (!drawer) return;
    drawer.hidden = true;
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove('cart-open');
  };

  const getPageLabel = (link, nextUrl) => {
    const explicit = link?.getAttribute('data-transition-label');
    if (explicit) return explicit;

    const navKey = link?.getAttribute('data-nav-key');
    if (navKey && PAGE_LABELS[navKey]) return PAGE_LABELS[navKey];

    const text = link?.textContent?.replace(/\s+/g, ' ').trim();
    if (text) return text;

    const page = nextUrl.pathname.split('/').pop() || 'index.html';
    const key = page === 'index.html' ? 'home' : page.replace('.html', '');
    return PAGE_LABELS[key] || 'page';
  };

  const openPageTransition = (label) => {
    const overlay = document.querySelector('[data-page-transition]');
    const labelNode = document.querySelector('[data-page-transition-label]');
    if (!overlay) return;
    if (labelNode) labelNode.textContent = `Loading ${label || 'page'}`;
    overlay.hidden = false;
    window.requestAnimationFrame(() => {
      overlay.classList.add('is-active');
    });
  };

  const closePageTransition = () => {
    const overlay = document.querySelector('[data-page-transition]');
    if (!overlay) return;
    overlay.classList.remove('is-active');
    overlay.hidden = true;
  };

  const runStoredPageEntrance = () => {
    if (!pendingTransition || !document.body) return;
    openPageTransition(pendingTransition.label);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.body.classList.remove('is-page-entering');
      });
    });
    window.setTimeout(() => {
      closePageTransition();
      clearStoredTransition();
    }, 420);
  };

  const closeLogoutModal = () => {
    const modal = document.querySelector('[data-logout-modal]');
    const status = document.querySelector('[data-logout-status]');
    const confirmButton = document.querySelector('[data-logout-confirm]');
    if (!modal) return;
    modal.hidden = true;
    setStatus(status, '');
    setButtonLoading(confirmButton, false);
    document.body.classList.remove('modal-open');
  };

  const openLogoutModal = () => {
    const modal = document.querySelector('[data-logout-modal]');
    const status = document.querySelector('[data-logout-status]');
    if (!modal) return;
    modal.hidden = false;
    setStatus(status, '');
    document.body.classList.add('modal-open');
  };

  const updateProfileIcon = (navRoot, user, session) => {
    const profile = navRoot.querySelector('[data-profile-initial]');
    if (!profile) return;
    const nameSource = user?.name || session?.email || '';
    profile.textContent = getInitial(nameSource);
  };

  const updateBrandLink = (navRoot, isLoggedIn) => {
    const brand = navRoot.querySelector('.brand');
    if (!brand) return;
    const authHref = brand.getAttribute('data-auth-href');
    const publicHref = brand.getAttribute('data-public-href') || brand.getAttribute('href');
    if (isLoggedIn && authHref) {
      brand.setAttribute('href', authHref);
    } else if (publicHref) {
      brand.setAttribute('href', publicHref);
    }
  };

  const formatSidebarName = (user, session) => {
    const explicit = user?.name?.trim();
    if (explicit) return explicit;
    const email = user?.email || session?.email || '';
    if (!email) return 'Account holder';
    const local = email.split('@')[0] || '';
    const label = local.replace(/[._-]+/g, ' ').trim();
    if (!label) return email;
    return label.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const updateCartCount = (root, cartCount) => {
    root.querySelectorAll('[data-cart-count]').forEach((node) => {
      node.textContent = String(cartCount);
    });

    root.querySelectorAll('.nav-cart').forEach((cartLink) => {
      cartLink.classList.toggle('has-items', cartCount > 0);
      cartLink.setAttribute('aria-label', cartCount > 0 ? `Open cart with ${cartCount} item${cartCount === 1 ? '' : 's'}` : 'Open cart');
    });
  };

  const renderCartDrawer = (state) => {
    const drawer = document.querySelector('[data-cart-drawer]');
    if (!drawer || !window.AyutaStore) return;

    const itemsRoot = drawer.querySelector('[data-cart-drawer-items]');
    const totalRoot = drawer.querySelector('[data-cart-drawer-total]');
    const orderButton = drawer.querySelector('[data-cart-order]');
    const cart = Array.isArray(state.cart) ? state.cart : [];
    const totals = window.AyutaStore.getTotals(cart, 0, 0);
    const collectionMethod = state.collectionMethod === 'home' ? 'Home kit' : 'Clinic appointment';

    if (itemsRoot) {
      if (!cart.length) {
        itemsRoot.innerHTML = '<div class="empty-state">No package selected yet. Choose a package before moving into the payment step.</div>';
      } else {
        itemsRoot.innerHTML = cart
          .map(
            (item) =>
              `<article class="cart-drawer-item"><div class="cart-drawer-item-copy"><h3>${item.name}</h3><p>${collectionMethod}</p></div><div class="cart-drawer-item-actions"><strong>${window.AyutaStore.formatCurrency(item.price)}</strong><button class="icon-button cart-drawer-remove" type="button" data-cart-remove="${item.id}" aria-label="Remove ${item.name} from cart"><span class="fa-solid fa-trash" aria-hidden="true"></span></button></div></article>`
          )
          .join('');
      }
    }

    if (totalRoot) totalRoot.textContent = window.AyutaStore.formatCurrency(totals.total);
    if (orderButton) {
      orderButton.disabled = false;
      orderButton.textContent = cart.length === 0 ? 'Continue to order' : 'Continue to payment';
    }
  };

  const toggleAuthControls = (navRoot, isLoggedIn, isAppShell, pageKey) => {
    const loginButton = navRoot.querySelector('.nav-login');
    const userMenu = navRoot.querySelector('[data-user-menu]');
    const navLinks = navRoot.querySelector('.nav-links');
    const navCta = navRoot.querySelector('.nav-cta');
    const publicCart = navRoot.querySelector('.nav-cart');
    const appCart = document.querySelector('.app-cart');
    const showCartTrigger = pageKey !== 'order' && pageKey !== 'payment-return';

    if (loginButton) loginButton.hidden = isLoggedIn;
    if (userMenu) userMenu.hidden = !isLoggedIn;
    if (navLinks) navLinks.hidden = isLoggedIn && isAppShell;
    if (navCta) navCta.hidden = isLoggedIn && isAppShell;
    if (publicCart) publicCart.hidden = !showCartTrigger || (isLoggedIn && isAppShell);
    if (appCart) appCart.hidden = !(isLoggedIn && isAppShell && showCartTrigger);
    navRoot.hidden = isLoggedIn && isAppShell;

    navRoot.classList.toggle('is-authenticated', isLoggedIn);
    navRoot.classList.toggle('is-app-nav', isLoggedIn && isAppShell);
  };

  const updateSidebar = (isLoggedIn, isAppShell, user, session) => {
    const sidebar = document.querySelector('[data-app-sidebar]');
    if (!sidebar) return;

    const shouldShow = isLoggedIn && isAppShell;
    sidebar.hidden = !shouldShow;
    document.body.classList.toggle('has-app-shell', shouldShow);
    document.body.classList.toggle('is-authenticated', isLoggedIn);

    if (!shouldShow) return;

    const sidebarName = sidebar.querySelector('[data-sidebar-name]');
    if (sidebarName) sidebarName.textContent = formatSidebarName(user, session);
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
  let logoutBound = false;
  let cartDrawerBound = false;
  let pageTransitionBound = false;
  let transitionTimer = null;

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

  const bindLogoutButtons = () => {
    if (logoutBound) return;

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-logout-trigger]');
      if (!trigger) return;
      event.preventDefault();
      openLogoutModal();
    });

    document.querySelectorAll('[data-logout-cancel]').forEach((button) => {
      button.addEventListener('click', closeLogoutModal);
    });

    const confirmButton = document.querySelector('[data-logout-confirm]');
    const statusNode = document.querySelector('[data-logout-status]');
    if (confirmButton) {
      confirmButton.addEventListener('click', async () => {
        if (!window.AyutaAuth || typeof window.AyutaAuth.logout !== 'function') return;
        try {
          setButtonLoading(confirmButton, true);
          setStatus(statusNode, 'Signing out...', 'loading');
          await window.AyutaAuth.logout();
          closeLogoutModal();
          window.location.assign(getPublicHomeHref());
        } catch (error) {
          setStatus(statusNode, 'Sign-out could not be completed. Try again.', 'error');
          console.error(error);
          setButtonLoading(confirmButton, false);
        }
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeLogoutModal();
      }
    });

    logoutBound = true;
  };

  const bindCartDrawer = () => {
    if (cartDrawerBound) return;

    const drawer = document.querySelector('[data-cart-drawer]');
    const orderButton = document.querySelector('[data-cart-order]');
    if (!drawer) return;

    const openDrawer = () => {
      const backdrop = document.querySelector('.cart-drawer-backdrop');
      drawer.hidden = false;
      if (backdrop) backdrop.hidden = false;
      document.body.classList.add('cart-open');
    };

    const toggleDrawer = () => {
      if (drawer.hidden) openDrawer();
      else closeCartDrawer();
    };

    document.querySelectorAll('.nav-cart').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        toggleDrawer();
      });
    });

    document.querySelectorAll('[data-cart-dismiss]').forEach((button) => {
      button.addEventListener('click', closeCartDrawer);
    });

    drawer.addEventListener('click', (event) => {
      const removeButton = event.target.closest('[data-cart-remove]');
      if (!removeButton || !window.AyutaStore) return;
      const id = removeButton.getAttribute('data-cart-remove');
      if (!id) return;
      const state = readStoreState();
      state.cart = Array.isArray(state.cart) ? state.cart.filter((item) => item.id !== id) : [];
      window.AyutaStore.saveState(state);
      renderCartDrawer(state);
      window.dispatchEvent(new CustomEvent('ayuta:state-updated'));
    });

    if (orderButton) {
      orderButton.addEventListener('click', () => {
        const state = readStoreState();
        const hasItems = Array.isArray(state.cart) && state.cart.length > 0;
        const orderHref =
          document.querySelector('.app-cart')?.getAttribute('href') ||
          document.querySelector('.nav-cart')?.getAttribute('href') ||
          'pages/order.html';
        closeCartDrawer();
        globalThis.location.assign(hasItems ? `${orderHref}?step=payment` : orderHref);
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeCartDrawer();
    });

    document.addEventListener('click', (event) => {
      if (drawer.hidden) return;
      const cartTrigger = event.target.closest('.nav-cart');
      if (cartTrigger) return;
      if (!drawer.contains(event.target)) closeCartDrawer();
    });

    cartDrawerBound = true;
  };

  const PUBLIC_TRANSITION_DELAY_MS = 200;

  const bindPageTransitions = () => {
    if (pageTransitionBound) return;

    // When the browser restores this page from the bfcache (back/forward),
    // the DOM is frozen mid-navigation with is-navigating-away still on <body>,
    // which sets pointer-events:none and opacity:0 — making the page unclickable.
    // Clear it unconditionally on any pageshow so the page is always interactive.
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        document.body.classList.remove('is-navigating-away');
        // Force a synchronous reflow so the compositor picks up the style change
        // immediately — without this, Chrome may leave the nav visually invisible
        // even after the class is removed on bfcache restore.
        document.body.getBoundingClientRect();
        if (transitionTimer) {
          globalThis.clearTimeout(transitionTimer);
          transitionTimer = null;
        }
        // Re-run nav refresh so auth/cart state is current after being frozen.
        const navRoot = document.querySelector('.site-nav');
        if (navRoot && globalThis.AyutaNav && typeof globalThis.AyutaNav.refresh === 'function') {
          globalThis.AyutaNav.refresh(navRoot);
        }
      }
    });

    document.addEventListener('click', (event) => {
      // Match nav links OR any plain same-origin anchor
      const link = event.target.closest('a[href]');
      if (!link || isModifiedClick(event)) return;
      if (link.classList.contains('nav-cart')) return;
      if (link.hasAttribute('download') || link.target === '_blank') return;

      // Skip links with no href (active-page links have href removed)
      const href = link.getAttribute('href');
      if (!href) return;

      // Skip hash-only, mailto, tel, and javascript: links
      if (/^(#|mailto:|tel:|javascript:)/i.test(href)) return;

      const nextUrl = new URL(href, window.location.href);
      const currentUrl = new URL(window.location.href);
      if (nextUrl.origin !== currentUrl.origin) return;
      if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search && nextUrl.hash === currentUrl.hash) return;

      const pageKey = getPageKey();
      const session = readSession();
      const snapshot = readAuthSnapshot();
      const isLoggedIn = Boolean((snapshot && snapshot.user) || (session && session.email));

      event.preventDefault();
      closeCartDrawer();
      writeStoredTransition(nextUrl.href, getPageLabel(link, nextUrl));

      // Always use the lightweight fade-out for consistent feel across all auth states
      document.body.classList.add('is-navigating-away');
      if (transitionTimer) window.clearTimeout(transitionTimer);
      transitionTimer = window.setTimeout(() => {
        window.location.assign(nextUrl.href);
      }, PUBLIC_TRANSITION_DELAY_MS);
    });

    pageTransitionBound = true;
  };

  const refresh = (navRoot) => {
    const snapshot = readAuthSnapshot();
    const session = readSession();
    const user = readUser();
    const state = readStoreState();
    const pageKey = getPageKey();
    const isLoggedIn = Boolean((snapshot && snapshot.user) || (session && session.email));
    const isAppShell = APP_PAGES.has(pageKey);

    updateProfileIcon(navRoot, user, session);
    updateBrandLink(navRoot, isLoggedIn);
    updateCartCount(document, Array.isArray(state.cart) ? state.cart.length : 0);
    renderCartDrawer(state);
    toggleAuthControls(navRoot, isLoggedIn, isAppShell, pageKey);
    updateSidebar(isLoggedIn, isAppShell, user, session);
    applyAccessibilityState(navRoot);

    if (!isLoggedIn) {
      closeLogoutModal();
      closeCartDrawer();
      closePageTransition();
      document.body?.classList.remove('is-page-entering');
      clearStoredTransition();
    }
  };

  const markActiveNavLink = (navRoot) => {
    const pageKey = getPageKey();
    // Clear any previously-marked links (e.g. after a soft refresh)
    navRoot.querySelectorAll('[data-nav-key]').forEach((link) => {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });
    document.querySelectorAll('.app-sidebar-link[data-nav-key]').forEach((link) => {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });

    // Match by data-nav-key or by the filename in data-path
    const allNavLinks = [
      ...navRoot.querySelectorAll('[data-nav-key]'),
      ...document.querySelectorAll('.app-sidebar-link[data-nav-key]')
    ];

    allNavLinks.forEach((link) => {
      const navKey = link.dataset.navKey;
      const dataPath = link.dataset.path || '';
      const pathKey = dataPath.split('/').pop().replace('.html', '') || 'home';
      const isActive = navKey === pageKey || pathKey === pageKey ||
        (pageKey === 'home' && (dataPath === 'index.html' || dataPath === ''));

      if (!isActive) return;

      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
      // Keep href so the link stays keyboard-focusable; the page-transition
      // binder already skips same-page navigations, so clicking it is a no-op.
      // Add a direct guard here as a safety net.
      link.addEventListener('click', (e) => {
        if (link.classList.contains('is-active')) e.preventDefault();
      }, { once: false });
    });
  };

  const init = (navRoot) => {
    if (!navRoot) return;
    bindLoginButtons(document);
    bindAccessibility(navRoot);
    bindUserMenu(navRoot);
    bindLogoutButtons();
    bindCartDrawer();
    bindPageTransitions();
    markActiveNavLink(navRoot);
    refresh(navRoot);
    runStoredPageEntrance();
    window.addEventListener('ayuta:auth-updated', () => refresh(navRoot));
    window.addEventListener('ayuta:state-updated', () => refresh(navRoot));
  };

  window.AyutaNav = { init, refresh };
})();
