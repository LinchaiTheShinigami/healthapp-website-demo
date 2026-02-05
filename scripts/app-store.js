(function () {
  const STORAGE_KEYS = {
    cart: 'ayuta_cart',
    orders: 'ayuta_orders',
    results: 'ayuta_results',
    user: 'ayuta_user',
    session: 'ayuta_session',
    goal: 'ayuta_goal',
    paymentEmail: 'ayuta_payment_email'
  };

  const readJson = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      if (!value) return fallback;
      return JSON.parse(value);
    } catch (error) {
      console.warn('Storage read failed', error);
      return fallback;
    }
  };

  const readValue = (key, fallback) => {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (error) {
      console.warn('Storage read failed', error);
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Storage write failed', error);
    }
  };

  const writeValue = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Storage write failed', error);
    }
  };

  const sanitizeState = (state) => {
    const safe = { ...state };
    if (!Array.isArray(safe.cart)) safe.cart = [];
    if (!Array.isArray(safe.orders)) safe.orders = [];
    if (!Array.isArray(safe.results)) safe.results = [];
    return safe;
  };

  const loadState = () =>
    sanitizeState({
      cart: readJson(STORAGE_KEYS.cart, []),
      orders: readJson(STORAGE_KEYS.orders, []),
      results: readJson(STORAGE_KEYS.results, []),
      user: readJson(STORAGE_KEYS.user, null),
      session: readJson(STORAGE_KEYS.session, null),
      goal: readValue(STORAGE_KEYS.goal, 'all'),
      paymentEmail: readValue(STORAGE_KEYS.paymentEmail, '')
    });

  const saveState = (state) => {
    writeJson(STORAGE_KEYS.cart, state.cart || []);
    writeJson(STORAGE_KEYS.orders, state.orders || []);
    writeJson(STORAGE_KEYS.results, state.results || []);
    writeJson(STORAGE_KEYS.user, state.user || null);
    writeJson(STORAGE_KEYS.session, state.session || null);
    writeValue(STORAGE_KEYS.goal, state.goal || 'all');
    writeValue(STORAGE_KEYS.paymentEmail, state.paymentEmail || '');
  };

  const clearState = () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Storage clear failed', error);
      }
    });
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount);

  const formatDate = (value) => {
    const date = new Date(value);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTotals = (cart, taxRate = 0.05, shipping = 0) => {
    const subtotal = cart.reduce((sum, item) => {
      const quantity = Number.isFinite(item.quantity) ? item.quantity : 1;
      return sum + item.price * Math.max(0, quantity);
    }, 0);
    const taxes = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + taxes + shipping) * 100) / 100;
    return { subtotal, taxes, shipping, total };
  };

  const buildOrderId = () => {
    const stamp = Date.now().toString().slice(-5);
    const random = Math.floor(Math.random() * 90 + 10);
    return `AYU-${stamp}-${random}`;
  };

  window.AyutaStore = {
    STORAGE_KEYS,
    loadState,
    saveState,
    clearState,
    formatCurrency,
    formatDate,
    getTotals,
    buildOrderId
  };
})();
