document.addEventListener('DOMContentLoaded', function () {
  const store = window.AyutaStore;
  if (!store) return;

  const TAX_RATE = 0.05;
  const SHIPPING_COST = 0;

  const goalLabels = {
    wellness: 'General wellness',
    metabolic: 'Metabolic health',
    energy: 'Energy and sleep',
    performance: 'Performance focus'
  };

  const elements = {
    goalButtons: Array.from(document.querySelectorAll('[data-goal]')),
    productItems: Array.from(document.querySelectorAll('.product-list-item')),
    basketItems: Array.from(document.querySelectorAll('[data-basket-items]')),
    summarySubtotal: Array.from(document.querySelectorAll('[data-summary-subtotal]')),
    summaryShipping: Array.from(document.querySelectorAll('[data-summary-shipping]')),
    summaryTaxes: Array.from(document.querySelectorAll('[data-summary-taxes]')),
    summaryTotal: Array.from(document.querySelectorAll('[data-summary-total]')),
    checkoutForm: document.getElementById('checkout-form'),
    checkoutEmail: document.getElementById('checkout-email'),
    checkoutStatus: document.getElementById('checkout-status'),
    registerMessage: document.getElementById('registration-message'),
    registerTrigger: document.querySelector('[data-register-trigger]'),
    stepButtons: Array.from(document.querySelectorAll('[data-order-step]')),
    stepPanels: Array.from(document.querySelectorAll('[data-order-panel]')),
    stepNextButtons: Array.from(document.querySelectorAll('[data-step-next]')),
    swingTarget: document.querySelector('.order-shell'),
    detailName: document.getElementById('detail-name'),
    detailDescription: document.getElementById('detail-description'),
    detailBiomarkers: document.getElementById('detail-biomarkers'),
    detailGoals: document.getElementById('detail-goals'),
    detailPrice: document.getElementById('detail-price'),
    detailToggle: document.getElementById('detail-toggle'),
    expressCheckoutCard: document.getElementById('express-checkout-card'),
    expressCheckoutMount: document.getElementById('express-checkout-element'),
    paymentMount: document.getElementById('payment-element')
  };

  let state = store.loadState();
  let currentStep = 'select';
  let selectedProductId = null;
  let stripeInstance = null;
  let stripeElements = null;
  let stripeReady = false;

  const normalizeCart = () => {
    state.cart = (state.cart || []).map((item) => {
      const quantity = Number.isFinite(item.quantity) ? Math.max(1, item.quantity) : 1;
      return { ...item, quantity };
    });
  };

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

  const parseGoals = (value) =>
    (value || '')
      .split(',')
      .map((goal) => goal.trim())
      .filter(Boolean);

  const formatGoals = (goals) =>
    goals.map((goal) => goalLabels[goal] || goal).join(', ');

  const getProductData = (item) => {
    if (!item) return null;
    return {
      id: item.getAttribute('data-product-id'),
      name: item.getAttribute('data-product-name') || '',
      description: item.getAttribute('data-product-description') || '',
      biomarkers: item.getAttribute('data-product-biomarkers') || '',
      goals: parseGoals(item.getAttribute('data-product-goals')),
      price: parseFloat(item.getAttribute('data-product-price') || '0')
    };
  };

  const updateGoalFilter = () => {
    elements.goalButtons.forEach((button) => {
      const isActive = button.getAttribute('data-goal') === state.goal;
      button.setAttribute('aria-pressed', String(isActive));
    });

    elements.productItems.forEach((item) => {
      const goals = parseGoals(item.getAttribute('data-product-goals'));
      const isVisible = state.goal === 'all' || goals.includes(state.goal);
      item.classList.toggle('is-hidden', !isVisible);
      item.setAttribute('aria-hidden', String(!isVisible));
    });
  };

  const updateDetailToggle = (productId) => {
    if (!elements.detailToggle) return;
    const id = productId || selectedProductId;
    if (!id) return;
    const inCart = state.cart.some((entry) => entry.id === id);
    elements.detailToggle.textContent = inCart ? 'Add another' : 'Add to order';
    elements.detailToggle.setAttribute('data-product-id', id);
  };

  const selectProduct = (item) => {
    if (!item) return;
    selectedProductId = item.getAttribute('data-product-id');
    elements.productItems.forEach((entry) => {
      const isSelected = entry === item;
      entry.classList.toggle('is-active', isSelected);
      entry.setAttribute('aria-selected', String(isSelected));
    });

    const data = getProductData(item);
    if (!data) return;
    if (elements.detailName) elements.detailName.textContent = data.name;
    if (elements.detailDescription) elements.detailDescription.textContent = data.description;
    if (elements.detailBiomarkers) elements.detailBiomarkers.textContent = data.biomarkers;
    if (elements.detailGoals) elements.detailGoals.textContent = formatGoals(data.goals);
    if (elements.detailPrice) elements.detailPrice.textContent = store.formatCurrency(data.price);
    updateDetailToggle(data.id);
  };

  const ensureSelectedProduct = () => {
    const current = elements.productItems.find(
      (item) =>
        item.getAttribute('data-product-id') === selectedProductId &&
        !item.classList.contains('is-hidden')
    );
    if (current) {
      selectProduct(current);
      return;
    }
    const firstVisible = elements.productItems.find((item) => !item.classList.contains('is-hidden'));
    if (firstVisible) {
      selectProduct(firstVisible);
    }
  };

  const renderBasketItems = (container) => {
    if (!container) return;
    container.innerHTML = '';
    if (state.cart.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'Your basket is empty. Add a kit to continue.';
      empty.classList.add('order-meta');
      container.appendChild(empty);
      return;
    }

    state.cart.forEach((item) => {
      const row = document.createElement('div');
      row.classList.add('basket-item');

      const name = document.createElement('span');
      name.textContent = item.name;

      const actions = document.createElement('div');
      actions.classList.add('basket-item-actions');
      const price = document.createElement('span');
      price.classList.add('basket-price');
      const quantity = Number.isFinite(item.quantity) ? item.quantity : 1;
      price.textContent = store.formatCurrency(item.price * quantity);

      const unit = document.createElement('span');
      unit.classList.add('basket-unit');
      unit.textContent = `${store.formatCurrency(item.price)} each`;

      const quantityControls = document.createElement('div');
      quantityControls.classList.add('basket-qty');

      const decrement = document.createElement('button');
      decrement.type = 'button';
      decrement.textContent = '-';
      decrement.setAttribute('aria-label', `Decrease ${item.name} quantity`);
      decrement.setAttribute('data-qty-action', 'decrement');
      decrement.setAttribute('data-qty-id', item.id);

      const qtyValue = document.createElement('span');
      qtyValue.classList.add('basket-qty-value');
      qtyValue.textContent = String(quantity);

      const increment = document.createElement('button');
      increment.type = 'button';
      increment.textContent = '+';
      increment.setAttribute('aria-label', `Increase ${item.name} quantity`);
      increment.setAttribute('data-qty-action', 'increment');
      increment.setAttribute('data-qty-id', item.id);

      quantityControls.appendChild(decrement);
      quantityControls.appendChild(qtyValue);
      quantityControls.appendChild(increment);

      actions.appendChild(price);
      actions.appendChild(unit);
      actions.appendChild(quantityControls);

      row.appendChild(name);
      row.appendChild(actions);
      container.appendChild(row);
    });
  };

  const renderBasket = () => {
    elements.basketItems.forEach(renderBasketItems);
  };

  const renderTotals = () => {
    const totals = store.getTotals(state.cart, TAX_RATE, SHIPPING_COST);
    const subtotal = store.formatCurrency(totals.subtotal);
    const shipping = store.formatCurrency(totals.shipping);
    const taxes = store.formatCurrency(totals.taxes);
    const total = store.formatCurrency(totals.total);
    elements.summarySubtotal.forEach((node) => {
      node.textContent = subtotal;
    });
    elements.summaryShipping.forEach((node) => {
      node.textContent = shipping;
    });
    elements.summaryTaxes.forEach((node) => {
      node.textContent = taxes;
    });
    elements.summaryTotal.forEach((node) => {
      node.textContent = total;
    });
  };

  const getStepState = () => {
    const hasCart = state.cart.length > 0;
    const hasOrder = state.orders.length > 0;
    return {
      select: hasCart || hasOrder,
      payment: hasOrder,
      post: hasOrder
    };
  };

  const isStepEnabled = (stepKey) => {
    if (stepKey === 'select') return true;
    if (stepKey === 'payment') return state.cart.length > 0 || state.orders.length > 0;
    if (stepKey === 'post') return state.orders.length > 0;
    return false;
  };

  const updateSteps = () => {
    const completion = getStepState();
    elements.stepButtons.forEach((step) => {
      const key = step.getAttribute('data-order-step');
      const isActive = key === currentStep;
      const isComplete = Boolean(completion[key]);
      step.classList.toggle('is-active', isActive);
      step.classList.toggle('is-complete', isComplete);
      step.disabled = !isStepEnabled(key);
      if (isActive) {
        step.setAttribute('aria-current', 'step');
      } else {
        step.removeAttribute('aria-current');
      }
    });

    elements.stepPanels.forEach((panel) => {
      const key = panel.getAttribute('data-order-panel');
      panel.classList.toggle('is-active', key === currentStep);
    });

    elements.stepNextButtons.forEach((button) => {
      const target = button.getAttribute('data-step-next');
      button.disabled = !isStepEnabled(target);
    });
  };

  const setActiveStep = (stepKey) => {
    if (!stepKey || !isStepEnabled(stepKey)) return;
    currentStep = stepKey;
    updateSteps();
    if (currentStep === 'payment') {
      initStripeElements();
    }
  };

  const getDefaultStep = () => {
    return 'select';
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

  const initStripeElements = () => {
    if (stripeReady) return;
    if (!elements.paymentMount && !elements.expressCheckoutMount) return;
    if (state.cart.length === 0 && state.orders.length === 0) return;
    if (!window.Stripe) return;

    const stripeKey = document.body.dataset.stripeKey || 'pk_test_123';
    const clientSecret = document.body.dataset.stripeClientSecret;

    if (!clientSecret) {
      setStatus(
        elements.checkoutStatus,
        'Payment initialization failed. Please try again later.',
        'error'
      );
      return;
    }

    stripeInstance = window.Stripe(stripeKey);
    stripeElements = stripeInstance.elements({
      clientSecret: clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#6b7af7',
          colorBackground: '#ffffff',
          colorText: '#30313d'
        }
      }
    });

    try {
      if (elements.paymentMount) {
        const payment = stripeElements.create('payment', {
          layout: { type: 'tabs', defaultCollapsed: false }
        });
        payment.mount(elements.paymentMount);
      }

      if (elements.expressCheckoutMount) {
        const expressCheckout = stripeElements.create('expressCheckout');
        expressCheckout.mount(elements.expressCheckoutMount);
        if (elements.expressCheckoutCard) {
          elements.expressCheckoutCard.hidden = false;
        }
      }

      document.body.classList.add('is-stripe-ready', 'is-payment-element');
      stripeReady = true;
    } catch (error) {
      console.warn('Stripe Payment Element failed to mount', error);
    }
  };

  const maybeSwing = (delta) => {
    if (!elements.swingTarget) return;
    const offset = Math.max(-14, Math.min(14, delta / 8));
    elements.swingTarget.style.transform = `translateY(${offset}px)`;
    window.clearTimeout(maybeSwing.timer);
    maybeSwing.timer = window.setTimeout(() => {
      elements.swingTarget.style.transform = 'translateY(0)';
    }, 160);
  };

  const bindSwing = () => {
    if (!elements.swingTarget) return;
    if (window.matchMedia('(max-width: 980px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const shouldIgnoreEvent = (event) =>
      event.target.closest('input, textarea, select, button, .stripe-element');

    window.addEventListener(
      'wheel',
      (event) => {
        if (shouldIgnoreEvent(event)) return;
        if (Math.abs(event.deltaY) < 4) return;
        maybeSwing(event.deltaY);
        event.preventDefault();
      },
      { passive: false }
    );

    let touchStart = null;
    window.addEventListener(
      'touchstart',
      (event) => {
        touchStart = event.touches[0].clientY;
      },
      { passive: true }
    );

    window.addEventListener(
      'touchmove',
      (event) => {
        if (touchStart === null) return;
        if (shouldIgnoreEvent(event)) return;
        const delta = touchStart - event.touches[0].clientY;
        if (Math.abs(delta) < 4) return;
        maybeSwing(delta);
        event.preventDefault();
      },
      { passive: false }
    );

    window.addEventListener('touchend', () => {
      touchStart = null;
    });
  };

  const refresh = () => {
    state = store.loadState();
    normalizeCart();
    if (!isStepEnabled(currentStep)) {
      currentStep = getDefaultStep();
    }
    updateGoalFilter();
    ensureSelectedProduct();
    renderBasket();
    renderTotals();
    updateSteps();
    updateRegistrationMessage();
    updateCheckoutEmail();
    updateDetailToggle();

    if (currentStep === 'payment') {
      initStripeElements();
    }
  };

  elements.goalButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.goal = button.getAttribute('data-goal') || 'all';
      saveState();
      refresh();
    });
  });

  elements.productItems.forEach((item) => {
    item.addEventListener('click', () => {
      selectProduct(item);
    });
  });

  if (elements.detailToggle) {
    elements.detailToggle.addEventListener('click', () => {
      const id = elements.detailToggle.getAttribute('data-product-id');
      const item = elements.productItems.find(
        (entry) => entry.getAttribute('data-product-id') === id
      );
      if (!item) return;
      const data = getProductData(item);
      const existing = state.cart.find((entry) => entry.id === data.id);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        state.cart.push({ id: data.id, name: data.name, price: data.price, quantity: 1 });
      }
      saveState();
      refresh();
    });
  }

  elements.basketItems.forEach((container) => {
    container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-qty-action]');
      if (!button) return;
      const id = button.getAttribute('data-qty-id');
      const action = button.getAttribute('data-qty-action');
      const entry = state.cart.find((item) => item.id === id);
      if (!entry) return;
      if (action === 'increment') {
        entry.quantity = (entry.quantity || 1) + 1;
      } else if (action === 'decrement') {
        entry.quantity = (entry.quantity || 1) - 1;
        if (entry.quantity <= 0) {
          state.cart = state.cart.filter((item) => item.id !== id);
        }
      }
      saveState();
      refresh();
    });
  });

  if (elements.registerTrigger) {
    elements.registerTrigger.addEventListener('click', () => {
      if (window.AyutaAccount && typeof window.AyutaAccount.open === 'function') {
        window.AyutaAccount.open('register');
      }
    });
  }

  elements.stepButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-order-step');
      setActiveStep(target);
    });
  });

  elements.stepNextButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-step-next');
      setActiveStep(target);
    });
  });

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

      if (!stripeReady) {
        initStripeElements();
      }

      if (!stripeInstance || !stripeElements) {
        setStatus(
          elements.checkoutStatus,
          'Payment initialization failed. Please try again later.',
          'error'
        );
        return;
      }

      const submitButton = elements.checkoutForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
      }

      setStatus(elements.checkoutStatus, 'Processing payment...');

      try {
        const { error, paymentIntent } = await stripeInstance.confirmPayment({
          elements: stripeElements,
          confirmParams: {
            return_url: `${window.location.origin}/payment-success.html`,
            receipt_email: email
          },
          redirect: 'if_required'
        });

        if (error) {
          setStatus(
            elements.checkoutStatus,
            error.message || 'An error occurred during payment.',
            'error'
          );
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Pay now';
          }
          return;
        }

        const totals = store.getTotals(state.cart, TAX_RATE, SHIPPING_COST);
        const order = {
          id: store.buildOrderId(),
          items: state.cart,
          total: totals.total,
          status: 'Paid',
          createdAt: new Date().toISOString(),
          email,
          paymentIntentId: paymentIntent ? paymentIntent.id : 'stripe_payment'
        };

        const resultEntry = createMockResults(order);

        state.orders = [order, ...state.orders];
        state.results = [resultEntry, ...state.results];
        state.cart = [];
        state.paymentEmail = email;
        saveState();
        currentStep = 'post';
        refresh();
        setStatus(elements.checkoutStatus, 'Payment successful!', 'success');
        window.dispatchEvent(new CustomEvent('ayuta:auth-updated'));
      } catch (error) {
        console.error(error);
        setStatus(
          elements.checkoutStatus,
          error.message || 'An error occurred during payment.',
          'error'
        );
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Pay now';
        }
      }
    });
  }

  window.addEventListener('ayuta:state-updated', refresh);
  window.addEventListener('ayuta:auth-updated', refresh);

  currentStep = getDefaultStep();
  bindSwing();
  refresh();
});
