(function () {
  const store = window.AyutaStore;
  if (!store) return;

  const TAX_RATE = 0.05;
  const SHIPPING_COST = 0;

  const elements = {
    goalButtons: Array.from(document.querySelectorAll('[data-goal]')),
    menuItems: Array.from(document.querySelectorAll('[data-product-id]')),
    menuCategories: Array.from(document.querySelectorAll('.menu-category')),
    basketItems: document.getElementById('basket-items'),
    summarySubtotal: document.getElementById('summary-subtotal'),
    summaryShipping: document.getElementById('summary-shipping'),
    summaryTaxes: document.getElementById('summary-taxes'),
    summaryTotal: document.getElementById('summary-total'),
    clearCart: document.getElementById('clear-cart'),
    checkoutForm: document.getElementById('checkout-form'),
    checkoutEmail: document.getElementById('checkout-email'),
    checkoutStatus: document.getElementById('checkout-status'),
    registerMessage: document.getElementById('registration-message'),
    registerTrigger: document.querySelector('[data-register-trigger]'),
    steps: Array.from(document.querySelectorAll('.order-step'))
  };

  let state = store.loadState();

  const setStatus = (node, message, stateType) => {
    if (!node) return;
    node.textContent = message;
    node.classList.remove('is-success', 'is-error');
    if (stateType === 'success') node.classList.add('is-success');
    if (stateType === 'error') node.classList.add('is-error');
  };

  const saveState = () => {
    store.saveState(state);
    window.dispatchEvent(new CustomEvent('ayuta:state-updated'));
  };

  const updateGoalFilter = () => {
    elements.goalButtons.forEach((button) => {
      const isActive = button.getAttribute('data-goal') === state.goal;
      button.setAttribute('aria-pressed', String(isActive));
    });

    elements.menuItems.forEach((item) => {
      const goals = (item.getAttribute('data-goals') || '').split(',').map((goal) => goal.trim());
      const isVisible = state.goal === 'all' || goals.includes(state.goal);
      item.classList.toggle('is-hidden', !isVisible);
    });

    elements.menuCategories.forEach((category) => {
      const items = Array.from(category.querySelectorAll('.menu-item'));
      const isVisible = items.some((item) => !item.classList.contains('is-hidden'));
      category.classList.toggle('is-hidden', !isVisible);
    });
  };

  const updateMenuButtons = () => {
    elements.menuItems.forEach((item) => {
      const id = item.getAttribute('data-product-id');
      const button = item.querySelector('.menu-toggle');
      const inCart = state.cart.some((entry) => entry.id === id);
      item.classList.toggle('is-selected', inCart);
      if (button) {
        button.textContent = inCart ? 'Remove' : 'Add';
        button.classList.toggle('is-selected', inCart);
      }
    });
  };

  const renderBasket = () => {
    if (!elements.basketItems) return;
    elements.basketItems.innerHTML = '';
    if (state.cart.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'Your basket is empty. Add a kit to continue.';
      empty.classList.add('order-meta');
      elements.basketItems.appendChild(empty);
      return;
    }

    state.cart.forEach((item) => {
      const row = document.createElement('div');
      row.classList.add('basket-item');

      const name = document.createElement('span');
      name.textContent = item.name;

      const actions = document.createElement('div');
      const price = document.createElement('span');
      price.textContent = store.formatCurrency(item.price);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.setAttribute('data-remove-id', item.id);

      actions.appendChild(price);
      actions.appendChild(remove);

      row.appendChild(name);
      row.appendChild(actions);
      elements.basketItems.appendChild(row);
    });
  };

  const renderTotals = () => {
    const totals = store.getTotals(state.cart, TAX_RATE, SHIPPING_COST);
    if (elements.summarySubtotal) elements.summarySubtotal.textContent = store.formatCurrency(totals.subtotal);
    if (elements.summaryShipping) elements.summaryShipping.textContent = store.formatCurrency(totals.shipping);
    if (elements.summaryTaxes) elements.summaryTaxes.textContent = store.formatCurrency(totals.taxes);
    if (elements.summaryTotal) elements.summaryTotal.textContent = store.formatCurrency(totals.total);
  };

  const updateSteps = () => {
    const checks = {
      goal: state.goal && state.goal !== 'all',
      menu: state.cart.length > 0 || state.orders.length > 0,
      pay: state.orders.length > 0,
      register: Boolean(state.user && state.user.email)
    };

    elements.steps.forEach((step) => {
      const key = step.getAttribute('data-step');
      step.classList.toggle('is-complete', Boolean(checks[key]));
    });
  };

  const updateRegistrationMessage = () => {
    if (!elements.registerMessage) return;
    if (state.orders.length === 0) {
      elements.registerMessage.textContent = 'Payment comes first. You can register right after checkout.';
      return;
    }
    const latest = state.orders[0];
    elements.registerMessage.textContent = `Payment captured for ${latest.id}. Register now to unlock orders and results.`;
  };

  const updateCheckoutEmail = () => {
    if (!elements.checkoutEmail) return;
    if (elements.checkoutEmail.value) return;
    const email = state.session?.email || state.user?.email || state.paymentEmail || '';
    elements.checkoutEmail.value = email;
  };

  const createMockResults = (order) => {
    const templates = [
      { name: 'Vitamin D', value: '6.5 nmol/L', status: 'Optimal' },
      { name: 'HbA1c', value: '1.06 mmol/L', status: 'Optimal' },
      { name: 'Lipid Panel', value: '0.59 mmol/L', status: 'Low' },
      { name: 'Cortisol', value: '2.81 nmol/L', status: 'Optimal' }
    ];
    return {
      orderId: order.id,
      email: order.email,
      createdAt: new Date().toISOString(),
      status: 'Available',
      results: templates
    };
  };

  const refresh = () => {
    state = store.loadState();
    updateGoalFilter();
    updateMenuButtons();
    renderBasket();
    renderTotals();
    updateSteps();
    updateRegistrationMessage();
    updateCheckoutEmail();
  };

  elements.goalButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.goal = button.getAttribute('data-goal') || 'all';
      saveState();
      refresh();
    });
  });

  elements.menuItems.forEach((item) => {
    const button = item.querySelector('.menu-toggle');
    if (!button) return;
    button.addEventListener('click', () => {
      const id = item.getAttribute('data-product-id');
      const name = item.getAttribute('data-product-name');
      const price = parseFloat(item.getAttribute('data-product-price') || '0');
      const existingIndex = state.cart.findIndex((entry) => entry.id === id);
      if (existingIndex >= 0) {
        state.cart.splice(existingIndex, 1);
      } else {
        state.cart.push({ id, name, price });
      }
      saveState();
      refresh();
    });
  });

  if (elements.basketItems) {
    elements.basketItems.addEventListener('click', (event) => {
      const button = event.target.closest('[data-remove-id]');
      if (!button) return;
      const id = button.getAttribute('data-remove-id');
      state.cart = state.cart.filter((entry) => entry.id !== id);
      saveState();
      refresh();
    });
  }

  if (elements.clearCart) {
    elements.clearCart.addEventListener('click', () => {
      state.cart = [];
      saveState();
      refresh();
      setStatus(elements.checkoutStatus, 'Basket cleared.', 'success');
    });
  }

  if (elements.registerTrigger) {
    elements.registerTrigger.addEventListener('click', () => {
      if (window.AyutaAccount && typeof window.AyutaAccount.open === 'function') {
        window.AyutaAccount.open('register');
      }
    });
  }

  if (elements.checkoutForm) {
    elements.checkoutForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (state.cart.length === 0) {
        setStatus(elements.checkoutStatus, 'Add a kit before checking out.', 'error');
        return;
      }

      const email = elements.checkoutEmail.value.trim();
      if (!email) {
        setStatus(elements.checkoutStatus, 'Enter an email for the receipt.', 'error');
        return;
      }

      const totals = store.getTotals(state.cart, TAX_RATE, SHIPPING_COST);
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
          payment_method: { billing_details: { email } }
        });

        if (confirmation.status !== 'succeeded') {
          throw new Error('Payment did not complete');
        }

        const order = {
          id: store.buildOrderId(),
          items: state.cart,
          total: totals.total,
          status: 'Paid',
          createdAt: new Date().toISOString(),
          email,
          paymentIntentId: paymentIntent.id
        };

        const resultEntry = createMockResults(order);

        state.orders = [order, ...state.orders];
        state.results = [resultEntry, ...state.results];
        state.cart = [];
        state.paymentEmail = email;
        saveState();
        refresh();
        setStatus(elements.checkoutStatus, 'Payment approved. Complete registration next.', 'success');
        window.dispatchEvent(new CustomEvent('ayuta:auth-updated'));
      } catch (error) {
        console.error(error);
        setStatus(elements.checkoutStatus, 'Payment failed. Please retry.', 'error');
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  window.addEventListener('ayuta:state-updated', refresh);
  window.addEventListener('ayuta:auth-updated', refresh);
  refresh();
})();
