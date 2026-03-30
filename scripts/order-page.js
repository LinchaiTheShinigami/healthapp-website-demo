document.addEventListener('DOMContentLoaded', function () {
  const store = window.AyutaStore;
  if (!store) return;

  const TAX_RATE = 0.05;
  const SHIPPING_COSTS = { lab: 0, home: 4.99 };
  const COLLECTION_CONTENT = {
    lab: {
      label: 'Booking fee',
      message:
        'Book a professional draw in London, Manchester, Birmingham, Bristol, Leeds, or Edinburgh with no shipping fee.',
      summary: 'Available as a partner lab visit with same-week appointment slots.'
    },
    home: {
      label: 'Kit shipping',
      message:
        'Receive a home kit in 24 to 48 hours with prepaid return packaging and clear sample instructions.',
      summary: 'Available as a home kit with tracked delivery and prepaid return packaging.'
    }
  };
  const goalLabels = {
    wellness: 'General wellness',
    metabolic: 'Metabolic health',
    energy: 'Energy and sleep',
    performance: 'Performance',
    womens: 'Women’s health',
    mens: 'Men’s health',
    allergy: 'Food sensitivity',
    glp1: 'GLP-1 monitoring'
  };
  const catalog = {
    core: {
      why: 'A good starting point when you want a broad snapshot instead of chasing a single symptom.',
      turnaround: 'Results in 24 to 72 hours after processing',
      biomarkers: [
        ['Ferritin', 'Iron stores', 'Useful when checking iron reserves, fatigue, and recovery.'],
        ['HbA1c', 'Blood sugar', 'Shows average blood sugar control over the last two to three months.'],
        ['Vitamin D', 'Nutrients', 'Commonly checked when mood, immunity, or bone health is a concern.']
      ]
    },
    womens: {
      why: 'Useful when hormones, menstrual symptoms, energy, or iron status need a clearer starting point.',
      turnaround: 'Results in 24 to 72 hours after processing',
      biomarkers: [
        ['FSH', 'Hormones', 'Supports assessment of ovarian function and cycle-related changes.'],
        ['Oestradiol', 'Hormones', 'A key hormone marker linked to cycle health, mood, and symptoms.'],
        ['Ferritin', 'Iron stores', 'Low iron stores can contribute to tiredness and heavy-cycle symptoms.']
      ]
    },
    mens: {
      why: 'Built for customers checking long-term energy, testosterone, metabolic markers, and general men’s health screening.',
      turnaround: 'Results in 24 to 72 hours after processing',
      biomarkers: [
        ['Testosterone', 'Hormones', 'Core marker for male hormone balance and related symptoms.'],
        ['PSA', 'Prostate', 'Common screening marker used in prostate-health conversations.'],
        ['ALT', 'Liver health', 'Used to review liver stress and medication or alcohol impact.']
      ]
    },
    glp1: {
      why: 'Designed for people using GLP-1 medications like Mounjaro who want ongoing metabolic and safety monitoring.',
      turnaround: 'Results in 24 to 72 hours after processing',
      biomarkers: [
        ['HbA1c', 'Blood sugar', 'Shows longer-term glucose control during treatment.'],
        ['Creatinine', 'Kidney function', 'Helps monitor kidney filtration and hydration-related changes.'],
        ['ALT', 'Liver health', 'Useful for spotting liver stress or medication-related changes.']
      ]
    },
    metabolic: {
      why: 'Best when the main question is blood sugar, cholesterol, inflammation, or early metabolic drift.',
      turnaround: 'Results in 24 to 72 hours after processing',
      biomarkers: [
        ['HbA1c', 'Blood sugar', 'Main long-range glucose marker.'],
        ['LDL Cholesterol', 'Heart health', 'Key part of cardiovascular risk review.'],
        ['CRP', 'Inflammation', 'General inflammatory marker that adds broader context.']
      ]
    },
    allergy: {
      why: 'Useful for people exploring possible food-related triggers and wanting more structure before a deeper clinical conversation.',
      turnaround: 'Results in 3 to 5 days after the lab receives the sample',
      biomarkers: [
        ['Total IgE', 'Immune response', 'A broad allergy-related immune marker.'],
        ['CRP', 'Inflammation', 'Shows general inflammation rather than a specific allergy.'],
        ['Coeliac Screen', 'Digestive health', 'Helps flag whether gluten-related follow-up should be considered.']
      ]
    },
    energy: {
      why: 'A targeted panel for people who feel run down, sleep poorly, or want to understand fatigue-related markers.',
      turnaround: 'Results in 24 to 72 hours after processing',
      biomarkers: [
        ['Cortisol', 'Stress response', 'Provides context on stress and recovery patterns.'],
        ['Vitamin B12', 'Nutrients', 'Supports red blood cell production and neurological function.'],
        ['TSH', 'Thyroid', 'Useful for screening whether thyroid function needs deeper review.']
      ]
    },
    performance: {
      why: 'Good for active customers monitoring recovery load, hormonal balance, and readiness to train.',
      turnaround: 'Results in 24 to 72 hours after processing',
      biomarkers: [
        ['Cortisol', 'Stress response', 'High or low cortisol can affect performance, stress, and recovery.'],
        ['Testosterone', 'Hormones', 'Relevant for performance, recovery, and muscle-building goals.'],
        ['CK', 'Recovery', 'A muscle breakdown marker that can rise with hard training.']
      ]
    }
  };
  const resultsTemplates = {
    core: [
      { name: 'Ferritin', value: 68, unit: 'ug/L', displayValue: '68 ug/L', status: 'Optimal', range: '30 to 400 ug/L', history: [['Jan', 51], ['Mar', 58], ['May', 63], ['Jul', 68]] },
      { name: 'HbA1c', value: 39, unit: 'mmol/mol', displayValue: '39 mmol/mol', status: 'Optimal', range: '20 to 41 mmol/mol', history: [['Jan', 43], ['Mar', 42], ['May', 40], ['Jul', 39]] },
      { name: 'Vitamin D', value: 54, unit: 'nmol/L', displayValue: '54 nmol/L', status: 'Watch', range: '50 to 125 nmol/L', history: [['Jan', 34], ['Mar', 41], ['May', 47], ['Jul', 54]] }
    ],
    womens: [
      { name: 'Ferritin', value: 29, unit: 'ug/L', displayValue: '29 ug/L', status: 'Watch', range: '30 to 150 ug/L', history: [['Jan', 18], ['Mar', 21], ['May', 25], ['Jul', 29]] },
      { name: 'Oestradiol', value: 312, unit: 'pmol/L', displayValue: '312 pmol/L', status: 'Within range', range: 'Cycle dependent', history: [['Jan', 280], ['Mar', 295], ['May', 305], ['Jul', 312]] },
      { name: 'Vitamin B12', value: 385, unit: 'ng/L', displayValue: '385 ng/L', status: 'Optimal', range: '190 to 900 ng/L', history: [['Jan', 298], ['Mar', 332], ['May', 361], ['Jul', 385]] }
    ],
    mens: [
      { name: 'Testosterone', value: 17.4, unit: 'nmol/L', displayValue: '17.4 nmol/L', status: 'Optimal', range: '8.6 to 29.0 nmol/L', history: [['Jan', 14.1], ['Mar', 15.2], ['May', 16.5], ['Jul', 17.4]] },
      { name: 'PSA', value: 1.2, unit: 'ug/L', displayValue: '1.2 ug/L', status: 'Within range', range: '0 to 4.0 ug/L', history: [['Jan', 1.1], ['Mar', 1.1], ['May', 1.2], ['Jul', 1.2]] },
      { name: 'HbA1c', value: 40, unit: 'mmol/mol', displayValue: '40 mmol/mol', status: 'Optimal', range: '20 to 41 mmol/mol', history: [['Jan', 44], ['Mar', 42], ['May', 41], ['Jul', 40]] }
    ],
    glp1: [
      { name: 'HbA1c', value: 38, unit: 'mmol/mol', displayValue: '38 mmol/mol', status: 'Improving', range: '20 to 41 mmol/mol', history: [['Jan', 48], ['Mar', 44], ['May', 41], ['Jul', 38]] },
      { name: 'ALT', value: 24, unit: 'U/L', displayValue: '24 U/L', status: 'Within range', range: '0 to 41 U/L', history: [['Jan', 31], ['Mar', 29], ['May', 27], ['Jul', 24]] },
      { name: 'Creatinine', value: 82, unit: 'umol/L', displayValue: '82 umol/L', status: 'Stable', range: '64 to 104 umol/L', history: [['Jan', 84], ['Mar', 83], ['May', 82], ['Jul', 82]] }
    ]
  };

  const elements = {
    goalButtons: Array.from(document.querySelectorAll('[data-goal]')),
    collectionButtons: Array.from(document.querySelectorAll('[data-collection]')),
    productItems: Array.from(document.querySelectorAll('.product-list-item')),
    basketItems: Array.from(document.querySelectorAll('[data-basket-items]')),
    summarySubtotal: Array.from(document.querySelectorAll('[data-summary-subtotal]')),
    summaryShipping: Array.from(document.querySelectorAll('[data-summary-shipping]')),
    summaryShippingLabels: Array.from(document.querySelectorAll('[data-summary-shipping-label]')),
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
    detailName: document.getElementById('detail-name'),
    detailDescription: document.getElementById('detail-description'),
    detailBiomarkers: document.getElementById('detail-biomarkers'),
    detailGoals: document.getElementById('detail-goals'),
    detailTurnaround: document.getElementById('detail-turnaround'),
    detailWhy: document.getElementById('detail-why'),
    detailCollection: document.getElementById('detail-collection'),
    detailPrice: document.getElementById('detail-price'),
    detailToggle: document.getElementById('detail-toggle'),
    detailBiomarkerGrid: document.getElementById('detail-biomarker-grid'),
    expressCheckoutCard: document.getElementById('express-checkout-card'),
    expressCheckoutMount: document.getElementById('express-checkout-element'),
    paymentMount: document.getElementById('payment-element'),
    collectionStatus: document.getElementById('collection-status'),
    quizSex: document.getElementById('quiz-sex'),
    quizPriority: document.getElementById('quiz-priority'),
    quizButton: document.getElementById('recommendation-button'),
    quizStatus: document.getElementById('recommendation-status')
  };

  let state = store.loadState();
  let currentStep = 'select';
  let selectedProductId = null;
  let stripeInstance = null;
  let stripeElements = null;
  let stripeReady = false;
  const getAuthSnapshot = () => (window.AyutaAuth && typeof window.AyutaAuth.getSnapshot === 'function' ? window.AyutaAuth.getSnapshot() : null);

  const setStatus = (node, message, type) => {
    if (!node) return;
    node.textContent = message;
    node.classList.remove('is-success', 'is-error');
    if (type === 'success') node.classList.add('is-success');
    if (type === 'error') node.classList.add('is-error');
  };
  const saveState = () => {
    store.saveState(state);
    window.dispatchEvent(new CustomEvent('ayuta:state-updated'));
  };
  const parseGoals = (value) => (value || '').split(',').map((goal) => goal.trim()).filter(Boolean);
  const formatGoals = (goals) => goals.map((goal) => goalLabels[goal] || goal).join(', ');
  const getCollection = () => COLLECTION_CONTENT[state.collectionMethod] || COLLECTION_CONTENT.lab;
  const getShippingCost = () => SHIPPING_COSTS[state.collectionMethod] ?? 0;
  const normalizeState = () => {
    state.cart = (state.cart || []).map((item) => ({ ...item, quantity: Number.isFinite(item.quantity) ? Math.max(1, item.quantity) : 1 }));
    if (!COLLECTION_CONTENT[state.collectionMethod]) state.collectionMethod = 'lab';
  };
  const getProductData = (item) => {
    if (!item) return null;
    const id = item.getAttribute('data-product-id');
    return {
      id,
      name: item.getAttribute('data-product-name') || '',
      description: item.getAttribute('data-product-description') || '',
      biomarkersLabel: item.getAttribute('data-product-biomarkers') || '',
      goals: parseGoals(item.getAttribute('data-product-goals')),
      price: parseFloat(item.getAttribute('data-product-price') || '0'),
      ...(catalog[id] || catalog.core)
    };
  };
  const renderBiomarkers = (items) => {
    if (!elements.detailBiomarkerGrid) return;
    elements.detailBiomarkerGrid.innerHTML = '';
    (items || []).forEach(([name, category, explanation]) => {
      const card = document.createElement('div');
      card.className = 'bio-chip';
      card.innerHTML = `<div class="bio-text"><strong>${name}</strong><span>${category}</span></div><span class="bio-info" tabindex="0" role="button" aria-label="Why ${name} matters">i<span class="bio-tooltip">${explanation}</span></span>`;
      elements.detailBiomarkerGrid.appendChild(card);
    });
  };
  const updateGoalFilter = () => {
    elements.goalButtons.forEach((button) => {
      const isActive = button.getAttribute('data-goal') === state.goal;
      button.setAttribute('aria-pressed', String(isActive));
    });
    elements.productItems.forEach((item) => {
      const visible = state.goal === 'all' || parseGoals(item.getAttribute('data-product-goals')).includes(state.goal);
      item.classList.toggle('is-hidden', !visible);
      item.setAttribute('aria-hidden', String(!visible));
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
      const selected = entry === item;
      entry.classList.toggle('is-active', selected);
      entry.setAttribute('aria-selected', String(selected));
    });
    const data = getProductData(item);
    if (!data) return;
    if (elements.detailName) elements.detailName.textContent = data.name;
    if (elements.detailDescription) elements.detailDescription.textContent = data.description;
    if (elements.detailBiomarkers) elements.detailBiomarkers.textContent = data.biomarkersLabel;
    if (elements.detailGoals) elements.detailGoals.textContent = formatGoals(data.goals);
    if (elements.detailTurnaround) elements.detailTurnaround.textContent = data.turnaround;
    if (elements.detailWhy) elements.detailWhy.textContent = data.why;
    if (elements.detailCollection) elements.detailCollection.textContent = getCollection().summary;
    if (elements.detailPrice) elements.detailPrice.textContent = store.formatCurrency(data.price);
    renderBiomarkers(data.biomarkers);
    updateDetailToggle(data.id);
  };
  const ensureSelectedProduct = () => {
    const current = elements.productItems.find((item) => item.getAttribute('data-product-id') === selectedProductId && !item.classList.contains('is-hidden'));
    if (current) return selectProduct(current);
    const firstVisible = elements.productItems.find((item) => !item.classList.contains('is-hidden'));
    if (firstVisible) selectProduct(firstVisible);
  };
  const renderBasketItems = (container) => {
    if (!container) return;
    container.innerHTML = '';
    if (state.cart.length === 0) {
      container.innerHTML = '<p class="order-meta">Your basket is empty. Add a test to continue.</p>';
      return;
    }
    state.cart.forEach((item) => {
      const quantity = Number.isFinite(item.quantity) ? item.quantity : 1;
      const row = document.createElement('div');
      row.className = 'basket-item';
      row.innerHTML = `<span>${item.name}</span><div class="basket-item-actions"><span class="basket-price">${store.formatCurrency(item.price * quantity)}</span><span class="basket-unit">${store.formatCurrency(item.price)} each</span><div class="basket-qty"><button type="button" aria-label="Decrease ${item.name} quantity" data-qty-action="decrement" data-qty-id="${item.id}">-</button><span class="basket-qty-value">${quantity}</span><button type="button" aria-label="Increase ${item.name} quantity" data-qty-action="increment" data-qty-id="${item.id}">+</button></div></div>`;
      container.appendChild(row);
    });
  };
  const renderBasket = () => elements.basketItems.forEach(renderBasketItems);
  const renderTotals = () => {
    const totals = store.getTotals(state.cart, TAX_RATE, getShippingCost());
    const values = {
      subtotal: store.formatCurrency(totals.subtotal),
      shipping: store.formatCurrency(totals.shipping),
      taxes: store.formatCurrency(totals.taxes),
      total: store.formatCurrency(totals.total)
    };
    elements.summarySubtotal.forEach((node) => (node.textContent = values.subtotal));
    elements.summaryShipping.forEach((node) => (node.textContent = values.shipping));
    elements.summaryShippingLabels.forEach((node) => (node.textContent = getCollection().label));
    elements.summaryTaxes.forEach((node) => (node.textContent = values.taxes));
    elements.summaryTotal.forEach((node) => (node.textContent = values.total));
  };
  const isStepEnabled = (step) => step === 'select' || (step === 'payment' ? state.cart.length > 0 || state.orders.length > 0 : state.orders.length > 0);
  const updateSteps = () => {
    const complete = { select: state.cart.length > 0 || state.orders.length > 0, payment: state.orders.length > 0, post: state.orders.length > 0 };
    elements.stepButtons.forEach((button) => {
      const key = button.getAttribute('data-order-step');
      const active = key === currentStep;
      button.classList.toggle('is-active', active);
      button.classList.toggle('is-complete', Boolean(complete[key]));
      button.disabled = !isStepEnabled(key);
      if (active) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
    elements.stepPanels.forEach((panel) => panel.classList.toggle('is-active', panel.getAttribute('data-order-panel') === currentStep));
    elements.stepNextButtons.forEach((button) => (button.disabled = !isStepEnabled(button.getAttribute('data-step-next'))));
  };
  const setActiveStep = (step) => {
    if (!step || !isStepEnabled(step)) return;
    currentStep = step;
    updateSteps();
    if (currentStep === 'payment') initStripeElements();
  };
  const updateCollectionUI = () => {
    elements.collectionButtons.forEach((button) => {
      const active = button.getAttribute('data-collection') === state.collectionMethod;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (elements.collectionStatus) elements.collectionStatus.textContent = getCollection().message;
    if (selectedProductId) {
      const item = elements.productItems.find((entry) => entry.getAttribute('data-product-id') === selectedProductId);
      if (item) selectProduct(item);
    }
  };
  const updateRegistrationMessage = () => {
    if (!elements.registerMessage) return;
    const snapshot = getAuthSnapshot();
    if (!snapshot?.configured) {
      elements.registerMessage.textContent = 'Add your Firebase project details before taking live registrations and checkout.';
      return;
    }

    if (!snapshot.user) {
      elements.registerMessage.textContent = 'Sign in or register before paying so your order and biomarker results are saved to your account.';
      return;
    }

    elements.registerMessage.textContent = state.orders.length === 0
      ? 'You are signed in. Pay with this account to save your order and follow-up results.'
      : `Payment captured for ${state.orders[0].id}. Your account can now access the order and biomarker charts.`;
  };
  const updateCheckoutEmail = () => {
    if (!elements.checkoutEmail || elements.checkoutEmail.value) return;
    const snapshot = getAuthSnapshot();
    elements.checkoutEmail.value = snapshot?.profile?.email || snapshot?.user?.email || state.session?.email || state.user?.email || state.paymentEmail || '';
  };
  const createMockResults = (order) => {
    const key = order.items[0]?.id || 'core';
    const base = resultsTemplates[key] || resultsTemplates.core;
    return {
      orderId: order.id,
      email: order.email,
      createdAt: new Date().toISOString(),
      status: 'Available',
      panelName: order.items[0]?.name || 'Core Health Panel',
      collectionMethod: order.collectionMethod,
      results: base.map((item) => ({ ...item, history: item.history.map(([label, value]) => ({ label, value })) }))
    };
  };
  const initStripeElements = () => {
    if (stripeReady || (!elements.paymentMount && !elements.expressCheckoutMount) || (!state.cart.length && !state.orders.length) || !window.Stripe) return;
    const stripeKey = document.body.dataset.stripeKey || 'pk_test_123';
    const clientSecret = document.body.dataset.stripeClientSecret;
    if (!clientSecret) return setStatus(elements.checkoutStatus, 'Payment initialization failed. Please try again later.', 'error');
    stripeInstance = window.Stripe(stripeKey);
    stripeElements = stripeInstance.elements({ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#6b8f71', colorBackground: '#ffffff', colorText: '#203129' } } });
    try {
      if (elements.paymentMount) stripeElements.create('payment', { layout: { type: 'tabs', defaultCollapsed: false } }).mount(elements.paymentMount);
      if (elements.expressCheckoutMount) {
        stripeElements.create('expressCheckout').mount(elements.expressCheckoutMount);
        if (elements.expressCheckoutCard) elements.expressCheckoutCard.hidden = false;
      }
      document.body.classList.add('is-stripe-ready', 'is-payment-element');
      stripeReady = true;
    } catch (error) {
      console.warn('Stripe Payment Element failed to mount', error);
    }
  };
  const applyRecommendation = () => {
    const sex = elements.quizSex?.value || 'any';
    const priority = elements.quizPriority?.value || 'general';
    let id = 'core';
    let goal = 'wellness';
    if (priority === 'glp1') [id, goal] = ['glp1', 'glp1'];
    else if (priority === 'digestion') [id, goal] = ['allergy', 'allergy'];
    else if (priority === 'sleep') [id, goal] = ['energy', 'energy'];
    else if (priority === 'performance') [id, goal] = ['performance', 'performance'];
    else if (priority === 'metabolic') [id, goal] = ['metabolic', 'metabolic'];
    else if (priority === 'hormones' && sex === 'female') [id, goal] = ['womens', 'womens'];
    else if (priority === 'hormones' && sex === 'male') [id, goal] = ['mens', 'mens'];
    else if (sex === 'female') [id, goal] = ['womens', 'womens'];
    else if (sex === 'male') [id, goal] = ['mens', 'mens'];
    state.goal = goal;
    saveState();
    refresh();
    const item = elements.productItems.find((entry) => entry.getAttribute('data-product-id') === id);
    if (!item) return;
    selectProduct(item);
    item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    setStatus(elements.quizStatus, `${getProductData(item).name} looks like the closest match.`, 'success');
  };
  const refresh = () => {
    state = store.loadState();
    normalizeState();
    if (!isStepEnabled(currentStep)) currentStep = 'select';
    updateGoalFilter();
    ensureSelectedProduct();
    updateCollectionUI();
    renderBasket();
    renderTotals();
    updateSteps();
    updateRegistrationMessage();
    updateCheckoutEmail();
    updateDetailToggle();
    if (currentStep === 'payment') initStripeElements();
  };

  elements.goalButtons.forEach((button) => button.addEventListener('click', () => { state.goal = button.getAttribute('data-goal') || 'all'; saveState(); refresh(); }));
  elements.collectionButtons.forEach((button) => button.addEventListener('click', () => { state.collectionMethod = button.getAttribute('data-collection') || 'lab'; saveState(); refresh(); }));
  elements.productItems.forEach((item) => item.addEventListener('click', () => selectProduct(item)));
  if (elements.quizButton) elements.quizButton.addEventListener('click', applyRecommendation);
  if (elements.detailToggle) {
    elements.detailToggle.addEventListener('click', () => {
      const id = elements.detailToggle.getAttribute('data-product-id');
      const item = elements.productItems.find((entry) => entry.getAttribute('data-product-id') === id);
      if (!item) return;
      const data = getProductData(item);
      const existing = state.cart.find((entry) => entry.id === data.id);
      if (existing) existing.quantity = (existing.quantity || 1) + 1;
      else state.cart.push({ id: data.id, name: data.name, price: data.price, quantity: 1 });
      saveState();
      refresh();
    });
  }
  elements.basketItems.forEach((container) => {
    container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-qty-action]');
      if (!button) return;
      const id = button.getAttribute('data-qty-id');
      const entry = state.cart.find((item) => item.id === id);
      if (!entry) return;
      entry.quantity = (entry.quantity || 1) + (button.getAttribute('data-qty-action') === 'increment' ? 1 : -1);
      if (entry.quantity <= 0) state.cart = state.cart.filter((item) => item.id !== id);
      saveState();
      refresh();
    });
  });
  if (elements.registerTrigger) elements.registerTrigger.addEventListener('click', () => window.AyutaAccount?.open?.('register'));
  elements.stepButtons.forEach((button) => button.addEventListener('click', () => setActiveStep(button.getAttribute('data-order-step'))));
  elements.stepNextButtons.forEach((button) => button.addEventListener('click', () => setActiveStep(button.getAttribute('data-step-next'))));
  if (elements.checkoutForm) {
    elements.checkoutForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (state.cart.length === 0) return setStatus(elements.checkoutStatus, 'Add a test before checking out.', 'error');
      const authSnapshot = getAuthSnapshot();
      if (!authSnapshot?.user) {
        setStatus(elements.checkoutStatus, 'Sign in or register before paying so your order can be stored in your account.', 'error');
        window.AyutaAccount?.open?.('login');
        return;
      }
      const email = authSnapshot.profile?.email || authSnapshot.user.email || elements.checkoutEmail.value.trim();
      if (!email) return setStatus(elements.checkoutStatus, 'Enter an email for the receipt.', 'error');
      if (!stripeReady) initStripeElements();
      if (!stripeInstance || !stripeElements) return setStatus(elements.checkoutStatus, 'Payment initialization failed. Please try again later.', 'error');
      const submitButton = elements.checkoutForm.querySelector('button[type="submit"]');
      if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Processing...'; }
      setStatus(elements.checkoutStatus, 'Processing payment...');
      try {
        const { error, paymentIntent } = await stripeInstance.confirmPayment({
          elements: stripeElements,
          confirmParams: { return_url: `${window.location.origin}/payment-success.html`, receipt_email: email },
          redirect: 'if_required'
        });
        if (error) {
          setStatus(elements.checkoutStatus, error.message || 'An error occurred during payment.', 'error');
          if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'Pay now'; }
          return;
        }
        const totals = store.getTotals(state.cart, TAX_RATE, getShippingCost());
        const order = {
          id: store.buildOrderId(),
          items: state.cart,
          total: totals.total,
          status: 'Paid',
          createdAt: new Date().toISOString(),
          email,
          ownerUid: authSnapshot.user.uid,
          collectionMethod: state.collectionMethod,
          paymentIntentId: paymentIntent ? paymentIntent.id : 'stripe_payment'
        };
        const resultEntry = createMockResults(order);
        state.orders = [order, ...state.orders];
        state.results = [resultEntry, ...state.results];
        state.cart = [];
        state.paymentEmail = email;
        saveState();
        try {
          await window.AyutaAuth.saveOrder(order);
          await window.AyutaAuth.saveResult(resultEntry);
          setStatus(elements.checkoutStatus, 'Payment successful. Your order was saved to your account.', 'success');
        } catch (syncError) {
          console.error(syncError);
          setStatus(elements.checkoutStatus, syncError.message || 'Payment successful, but account sync failed.', 'error');
        }
        currentStep = 'post';
        refresh();
        window.dispatchEvent(new CustomEvent('ayuta:auth-updated'));
      } catch (error) {
        console.error(error);
        setStatus(elements.checkoutStatus, error.message || 'An error occurred during payment.', 'error');
        if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'Pay now'; }
      }
    });
  }

  window.addEventListener('ayuta:state-updated', refresh);
  window.addEventListener('ayuta:auth-updated', refresh);
  refresh();
});
