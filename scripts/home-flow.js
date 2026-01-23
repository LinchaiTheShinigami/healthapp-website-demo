(function () {
  const STORAGE_KEYS = {
    cart: 'ayuta_cart',
    orders: 'ayuta_orders',
    user: 'ayuta_user',
    session: 'ayuta_session',
    goal: 'ayuta_goal',
    paymentEmail: 'ayuta_payment_email'
  };

  const TAX_RATE = 0.05;
  const SHIPPING_COST = 0;

  const readStorage = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      if (!value) return fallback;
      return JSON.parse(value);
    } catch (error) {
      console.warn('Storage read failed', error);
      return fallback;
    }
  };

  const writeStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Storage write failed', error);
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

  const writeValue = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Storage write failed', error);
    }
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

  const getTotals = (cart) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const taxes = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + taxes + SHIPPING_COST) * 100) / 100;
    return {
      subtotal,
      taxes,
      shipping: SHIPPING_COST,
      total
    };
  };

  const buildOrderId = () => {
    const stamp = Date.now().toString().slice(-5);
    const random = Math.floor(Math.random() * 90 + 10);
    return `AYU-${stamp}-${random}`;
  };

  const setStatus = (node, message, state) => {
    if (!node) return;
    node.textContent = message;
    node.classList.remove('is-success', 'is-error');
    if (state === 'success') node.classList.add('is-success');
    if (state === 'error') node.classList.add('is-error');
  };

  const state = {
    cart: readStorage(STORAGE_KEYS.cart, []),
    orders: readStorage(STORAGE_KEYS.orders, []),
    user: readStorage(STORAGE_KEYS.user, null),
    session: readStorage(STORAGE_KEYS.session, null),
    goal: readValue(STORAGE_KEYS.goal, 'all'),
    paymentEmail: readValue(STORAGE_KEYS.paymentEmail, '')
  };

  if (!Array.isArray(state.cart)) state.cart = [];
  if (!Array.isArray(state.orders)) state.orders = [];

  const elements = {
    goalButtons: Array.from(document.querySelectorAll('[data-goal]')),
    productCards: Array.from(document.querySelectorAll('[data-product-id]')),
    checkoutForm: document.getElementById('checkout-form'),
    checkoutStatus: document.getElementById('checkout-status'),
    checkoutEmail: document.getElementById('checkout-email'),
    cartItems: document.getElementById('cart-items'),
    summarySubtotal: document.getElementById('summary-subtotal'),
    summaryShipping: document.getElementById('summary-shipping'),
    summaryTaxes: document.getElementById('summary-taxes'),
    summaryTotal: document.getElementById('summary-total'),
    clearCart: document.getElementById('clear-cart'),
    registerForm: document.getElementById('registration'),
    registerStatus: document.getElementById('register-status'),
    registerEmail: document.getElementById('register-email'),
    registerName: document.getElementById('register-name'),
    registerPhone: document.getElementById('register-phone'),
    loginForm: document.getElementById('login-form'),
    loginStatus: document.getElementById('login-status'),
    loginEmail: document.getElementById('login-email'),
    ordersStatus: document.getElementById('orders-status'),
    ordersList: document.getElementById('orders-list'),
    clearDemo: document.getElementById('clear-demo'),
    flowSteps: Array.from(document.querySelectorAll('[data-flow-step]')),
    heroGoal: document.getElementById('hero-goal'),
    heroTotal: document.getElementById('hero-total')
  };

  if (!elements.checkoutForm || elements.productCards.length === 0) {
    return;
  }

  const updateGoalFilter = () => {
    elements.goalButtons.forEach((button) => {
      const isActive = button.getAttribute('data-goal') === state.goal;
      button.setAttribute('aria-pressed', String(isActive));
    });

    elements.productCards.forEach((card) => {
      const goals = (card.getAttribute('data-goals') || '').split(',').map((goal) => goal.trim());
      const isVisible = state.goal === 'all' || goals.includes(state.goal);
      card.classList.toggle('is-hidden', !isVisible);
    });
  };

  const updateProductCards = () => {
    elements.productCards.forEach((card) => {
      const id = card.getAttribute('data-product-id');
      const button = card.querySelector('.product-toggle');
      const inCart = state.cart.some((item) => item.id === id);
      card.classList.toggle('is-selected', inCart);
      if (button) {
        button.textContent = inCart ? 'Remove from cart' : 'Add to cart';
      }
    });
  };

  const renderCart = () => {
    if (!elements.cartItems) return;
    elements.cartItems.innerHTML = '';

    if (state.cart.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'No products selected yet.';
      empty.classList.add('order-meta');
      elements.cartItems.appendChild(empty);
      return;
    }

    state.cart.forEach((item) => {
      const row = document.createElement('div');
      row.classList.add('summary-item');

      const name = document.createElement('span');
      name.textContent = item.name;

      const price = document.createElement('strong');
      price.textContent = formatCurrency(item.price);

      row.appendChild(name);
      row.appendChild(price);
      elements.cartItems.appendChild(row);
    });
  };

  const renderTotals = () => {
    const totals = getTotals(state.cart);
    if (elements.summarySubtotal) elements.summarySubtotal.textContent = formatCurrency(totals.subtotal);
    if (elements.summaryShipping) elements.summaryShipping.textContent = formatCurrency(totals.shipping);
    if (elements.summaryTaxes) elements.summaryTaxes.textContent = formatCurrency(totals.taxes);
    if (elements.summaryTotal) elements.summaryTotal.textContent = formatCurrency(totals.total);
    if (elements.heroTotal) elements.heroTotal.textContent = formatCurrency(totals.total);
  };

  const renderHeroGoal = () => {
    const active = elements.goalButtons.find((button) => button.getAttribute('data-goal') === state.goal);
    if (elements.heroGoal) {
      elements.heroGoal.textContent = active ? active.textContent : 'All goals';
    }
  };

  const renderOrders = () => {
    if (!elements.ordersList || !elements.ordersStatus) return;
    elements.ordersList.innerHTML = '';

    if (!state.session || !state.session.email) {
      elements.ordersStatus.textContent = 'Sign in to view orders.';
      return;
    }

    const ordersForEmail = state.orders.filter((order) => order.email === state.session.email);
    if (ordersForEmail.length === 0) {
      elements.ordersStatus.textContent = 'No orders for this email yet.';
      return;
    }

    elements.ordersStatus.textContent = `Signed in as ${state.session.email}.`;
    ordersForEmail.forEach((order) => {
      const card = document.createElement('div');
      card.classList.add('order-item');

      const heading = document.createElement('h4');
      heading.textContent = `Order ${order.id}`;

      const meta = document.createElement('p');
      meta.classList.add('order-meta');
      meta.textContent = `${formatDate(order.createdAt)} | ${formatCurrency(order.total)} | ${order.status}`;

      const tags = document.createElement('div');
      tags.classList.add('order-tags');
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach((item) => {
        const tag = document.createElement('span');
        tag.classList.add('order-tag');
        tag.textContent = item.name;
        tags.appendChild(tag);
      });

      card.appendChild(heading);
      card.appendChild(meta);
      card.appendChild(tags);
      elements.ordersList.appendChild(card);
    });
  };

  const updateFlowState = () => {
    const ordersForEmail = state.session
      ? state.orders.filter((order) => order.email === state.session.email)
      : [];
    const checks = {
      goal: state.goal && state.goal !== 'all',
      products: state.cart.length > 0 || state.orders.length > 0,
      checkout: state.orders.length > 0,
      register: Boolean(state.user && state.user.email),
      orders: ordersForEmail.length > 0
    };

    elements.flowSteps.forEach((step) => {
      const key = step.getAttribute('data-flow-step');
      step.classList.toggle('is-complete', Boolean(checks[key]));
    });
  };

  const persistState = () => {
    writeStorage(STORAGE_KEYS.cart, state.cart);
    writeStorage(STORAGE_KEYS.orders, state.orders);
    writeStorage(STORAGE_KEYS.user, state.user);
    writeStorage(STORAGE_KEYS.session, state.session);
    writeValue(STORAGE_KEYS.goal, state.goal);
    writeValue(STORAGE_KEYS.paymentEmail, state.paymentEmail || '');
  };

  const refreshUI = () => {
    updateGoalFilter();
    updateProductCards();
    renderCart();
    renderTotals();
    renderHeroGoal();
    renderOrders();
    updateFlowState();

    const emailPrefill = state.session?.email || state.user?.email || state.paymentEmail || '';
    if (elements.checkoutEmail && !elements.checkoutEmail.value) elements.checkoutEmail.value = emailPrefill;
    if (elements.registerEmail && !elements.registerEmail.value) elements.registerEmail.value = emailPrefill;
    if (elements.loginEmail && !elements.loginEmail.value) elements.loginEmail.value = emailPrefill;
  };

  elements.goalButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.goal = button.getAttribute('data-goal') || 'all';
      persistState();
      refreshUI();
    });
  });

  elements.productCards.forEach((card) => {
    const button = card.querySelector('.product-toggle');
    if (!button) return;
    button.addEventListener('click', () => {
      const id = card.getAttribute('data-product-id');
      const name = card.getAttribute('data-product-name');
      const price = parseFloat(card.getAttribute('data-product-price') || '0');
      const existingIndex = state.cart.findIndex((item) => item.id === id);
      if (existingIndex >= 0) {
        state.cart.splice(existingIndex, 1);
      } else {
        state.cart.push({ id, name, price });
      }
      persistState();
      refreshUI();
    });
  });

  if (elements.clearCart) {
    elements.clearCart.addEventListener('click', () => {
      state.cart = [];
      persistState();
      refreshUI();
      setStatus(elements.checkoutStatus, 'Cart cleared.', 'success');
    });
  }

  elements.checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (state.cart.length === 0) {
      setStatus(elements.checkoutStatus, 'Add a product before checking out.', 'error');
      return;
    }

    const email = elements.checkoutEmail.value.trim();
    if (!email) {
      setStatus(elements.checkoutStatus, 'Enter an email for the receipt.', 'error');
      return;
    }

    const totals = getTotals(state.cart);
    const stripe = window.AyutaStripeMock;
    const submitButton = elements.checkoutForm.querySelector('.checkout-button');
    if (submitButton) submitButton.disabled = true;

    if (!stripe) {
      setStatus(elements.checkoutStatus, 'Stripe mock is not available.', 'error');
      if (submitButton) submitButton.disabled = false;
      return;
    }

    setStatus(elements.checkoutStatus, 'Processing payment with Stripe mock...', 'success');

    try {
      const paymentIntent = await stripe.createPaymentIntent({
        amount: totals.total,
        currency: 'gbp',
        receiptEmail: email
      });

      const confirmation = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
        payment_method: {
          billing_details: { email }
        }
      });

      if (confirmation.status !== 'succeeded') {
        throw new Error('Payment did not complete');
      }

      const order = {
        id: buildOrderId(),
        items: state.cart,
        total: totals.total,
        status: 'Paid',
        createdAt: new Date().toISOString(),
        email,
        paymentIntentId: paymentIntent.id
      };

      state.orders = [order, ...state.orders];
      state.cart = [];
      state.paymentEmail = email;
      persistState();
      refreshUI();
      setStatus(elements.checkoutStatus, 'Payment approved. Continue to registration.', 'success');
    } catch (error) {
      console.error(error);
      setStatus(elements.checkoutStatus, 'Payment failed. Please retry.', 'error');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });

  if (elements.registerForm) {
    elements.registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = elements.registerName.value.trim();
      const email = elements.registerEmail.value.trim();
      if (!name || !email) {
        setStatus(elements.registerStatus, 'Name and email are required.', 'error');
        return;
      }

      state.user = {
        name,
        email,
        phone: elements.registerPhone.value.trim(),
        updatedAt: new Date().toISOString()
      };
      state.session = { email, loggedInAt: new Date().toISOString() };
      persistState();
      refreshUI();
      setStatus(elements.registerStatus, 'Profile saved and signed in.', 'success');
    });
  }

  if (elements.loginForm) {
    elements.loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = elements.loginEmail.value.trim();
      if (!email) {
        setStatus(elements.loginStatus, 'Enter your email to continue.', 'error');
        return;
      }

      const hasOrder = state.orders.some((order) => order.email === email);
      const hasProfile = state.user && state.user.email === email;
      if (!hasOrder && !hasProfile) {
        setStatus(elements.loginStatus, 'No order found for that email yet.', 'error');
        return;
      }

      state.session = { email, loggedInAt: new Date().toISOString() };
      persistState();
      refreshUI();
      setStatus(elements.loginStatus, 'Logged in. Orders updated below.', 'success');
    });
  }

  if (elements.clearDemo) {
    elements.clearDemo.addEventListener('click', () => {
      const confirmed = window.confirm('Clear all demo data stored in this browser?');
      if (!confirmed) return;
      Object.values(STORAGE_KEYS).forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('Storage clear failed', error);
        }
      });
      state.cart = [];
      state.orders = [];
      state.user = null;
      state.session = null;
      state.goal = 'all';
      state.paymentEmail = '';
      refreshUI();
      setStatus(elements.ordersStatus, 'Demo data cleared.', 'success');
    });
  }

  refreshUI();
})();
