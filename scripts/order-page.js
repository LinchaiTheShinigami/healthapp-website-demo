document.addEventListener('DOMContentLoaded', function () {
  const root = globalThis;
  const store = root.AyutaStore;
  if (!store) return;

  const TAX_RATE = 0;
  const COLLECTION_CONTENT = {
    home: {
      label: 'Home kit',
      message: 'Home kit selected. Complete a finger-prick sample at home, then return it by post to the lab using the prepaid packaging included.',
      summary: 'Home kit with finger-prick sampling and prepaid return post. Results in 3–5 working days.',
      basketLabel: 'Home kit'
    },
    lab: {
      label: 'Clinic appointment',
      message: 'Clinic appointment selected. Choose from 13 partner locations for a full venous draw with same-day processing.',
      summary: 'Clinic appointment with venous draw at one of 13 partner locations. Results in 2–3 working days.',
      basketLabel: 'Clinic appointment'
    }
  };
  const COLLECTION_INFO = {
    home: {
      kicker: 'Home kit',
      title: 'Capillary finger-prick testing from home',
      lead: 'Use the home kit when privacy and schedule flexibility matter most.',
      details: [
        ['Sample type', 'Finger-prick capillary sample collected at home using the kit provided.'],
        ['Return route', 'Return the completed sample by post to the lab using the prepaid packaging included with your kit.'],
        ['Timeline', 'Results are typically ready within 3–5 working days, including return postage and lab processing.']
      ]
    },
    lab: {
      kicker: 'Clinic appointment',
      title: 'Venous blood draw at a partner clinic',
      lead: 'Use the clinic route when you want a professional draw and same-day processing.',
      details: [
        ['Sample type', 'Full venous draw completed by a trained phlebotomist.'],
        ['Network', '13 partner locations are available across the current clinic footprint.'],
        ['Timeline', 'Results are typically ready within 2–3 working days from your clinic appointment.'],
        ['Booking', 'Book your clinic appointment through this website when placing your order.']
      ]
    }
  };
  const stripePaymentLinks = root.AYUTA_STRIPE_PAYMENT_LINKS || {};

  const catalog = {
    foundation: {
      id: 'foundation',
      name: 'Foundation',
      description: 'Baseline gym and PT package built from blood count, vitamins, iron, cholesterol, and HbA1c coverage.',
      biomarkersLabel: '5 source tests',
      goals: ['foundation'],
      homePrice: 149,
      labPrice: 199,
      turnaround: 'Results in 3–5 working days (home kit) or 2–3 working days (clinic)',
      focus: 'Baseline training reset',
      elements: [
        'Full Blood Count Blood Test',
        'Ultimate Vitamins Blood Test',
        'Ultimate Iron Blood Test',
        'Cholesterol Profile Blood Test',
        'HbA1c'
      ],
      why: 'Best when you want a clean baseline before starting a new block, nutrition plan, or PT engagement.',
      biomarkers: [
        ['HbA1c', 'Glucose control', 'Useful for establishing a baseline on blood sugar management before a training or nutrition block.'],
        ['Ferritin', 'Iron stores', 'Low iron stores can reduce training tolerance, recovery, and day-to-day energy.'],
        ['Vitamin D', 'Recovery and resilience', 'Useful when immunity, musculoskeletal recovery, or general resilience needs context.']
      ]
    },
    performance: {
      id: 'performance',
      name: 'Performance',
      description: 'Expanded training and recovery package built on Foundation with hormone, inflammation, and advanced lipid markers.',
      biomarkersLabel: '11 source tests',
      goals: ['performance'],
      homePrice: 249,
      labPrice: 299,
      turnaround: 'Results in 3–5 working days (home kit) or 2–3 working days (clinic)',
      focus: 'Training and recovery focus',
      elements: [
        'Full Blood Count Blood Test',
        'Ultimate Vitamins Blood Test',
        'Ultimate Iron Blood Test',
        'Cholesterol Profile Blood Test',
        'HbA1c',
        'Ultimate Testosterone Blood Test',
        'Cortisol',
        'C-Reactive Protein',
        'Apolipoprotein A',
        'Apolipoprotein B',
        'Zinc'
      ],
      why: 'Best for regular gym, PT, or hybrid training clients who need a stronger view of readiness, recovery, and metabolic drift.',
      biomarkers: [
        ['Free Testosterone', 'Hormone balance', 'Relevant for recovery, strength progression, and endocrine context in active clients.'],
        ['Cortisol', 'Stress response', 'Useful for understanding recovery load, sleep disruption, and training stress.'],
        ['Apolipoprotein B', 'Cardiometabolic risk', 'Adds a sharper view of lipid-related cardiovascular risk than a basic cholesterol snapshot alone.']
      ]
    },
    elite: {
      id: 'elite',
      name: 'Elite',
      description: 'Highest-depth gym and PT package built on Performance with thyroid and additional endocrine coverage.',
      biomarkersLabel: '15 source tests',
      goals: ['elite'],
      homePrice: 399,
      labPrice: 499,
      turnaround: 'Results in 3–5 working days (home kit) or 2–3 working days (clinic)',
      focus: 'Deep performance monitoring',
      elements: [
        'Full Blood Count Blood Test',
        'Ultimate Vitamins Blood Test',
        'Ultimate Iron Blood Test',
        'Cholesterol Profile Blood Test',
        'HbA1c',
        'Ultimate Testosterone Blood Test',
        'Cortisol',
        'C-Reactive Protein',
        'Apolipoprotein A',
        'Apolipoprotein B',
        'Zinc',
        'Ultimate Thyroid Function Blood Test',
        'Oestradiol',
        'Prolactin',
        'Folic Acid'
      ],
      why: 'Best for advanced monitoring, coached clients, or anyone who wants broad longitudinal visibility across systems rather than a lighter spot check.',
      biomarkers: [
        ['TSH', 'Thyroid overview', 'Useful for deeper review when fatigue, recovery, weight change, or adaptation needs more endocrine context.'],
        ['Oestradiol', 'Hormone regulation', 'Adds deeper endocrine visibility for clients who need a fuller hormone picture.'],
        ['Prolactin', 'Hormonal signalling', 'Helpful when recovery, libido, cycle issues, or endocrine drift needs closer follow-up.']
      ]
    }
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
    detailBiomarkers: document.getElementById('detail-biomarkers'),
    detailGoals: document.getElementById('detail-goals'),
    detailTurnaround: document.getElementById('detail-turnaround'),
    detailPrice: document.getElementById('detail-price'),
    detailToggle: document.getElementById('detail-toggle'),
    detailBiomarkerGrid: document.getElementById('detail-biomarker-grid'),
    detailElementsList: document.getElementById('detail-elements-list'),
    detailRoutePicker: document.getElementById('detail-route-picker'),
    collectionStatus: document.getElementById('collection-status'),
    collectionWarning: document.getElementById('collection-warning'),
    collectionNotes: Array.from(document.querySelectorAll('[data-collection-note]')),
    collectionInfoButtons: Array.from(document.querySelectorAll('[data-collection-info]')),
    collectionInfoPanels: Array.from(document.querySelectorAll('[data-collection-info-panel]')),
    collectionModal: document.querySelector('[data-collection-modal]'),
    collectionModalKicker: document.querySelector('[data-collection-modal-kicker]'),
    collectionModalTitle: document.querySelector('[data-collection-modal-title]'),
    collectionModalLead: document.querySelector('[data-collection-modal-lead]'),
    collectionModalDetails: document.querySelector('[data-collection-modal-details]'),
    collectionModalClose: Array.from(document.querySelectorAll('[data-collection-modal-close]')),
    quizPriority: document.getElementById('quiz-priority'),
    quizIntensity: document.getElementById('quiz-intensity'),
    quizButton: document.getElementById('recommendation-button'),
    quizStatus: document.getElementById('recommendation-status')
  };

  let state = store.loadState();
  let currentStep = 'select';
  let selectedProductId = null;
  let requestedStep = new URLSearchParams(root.location.search).get('step');
  let activeInfoTrigger = null;
  const mobileCollectionInfoQuery = root.matchMedia ? root.matchMedia('(max-width: 760px)') : null;

  const getAuthSnapshot = () =>
    root.AyutaAuth && typeof root.AyutaAuth.getSnapshot === 'function'
      ? root.AyutaAuth.getSnapshot()
      : null;

  const getCatalogItem = (id) => catalog[id] || null;
  const getCollection = () =>
    state.collectionMethodChosen && COLLECTION_CONTENT[state.collectionMethod]
      ? COLLECTION_CONTENT[state.collectionMethod]
      : null;
  const getPriceForCollection = (productId, collectionMethod) => {
    const item = getCatalogItem(productId);
    if (!item) return 0;
    if (collectionMethod === 'lab') return item.labPrice;
    if (collectionMethod === 'home') return item.homePrice;
    return Math.max(item.homePrice, item.labPrice);
  };
  const getPaymentLinkUrl = (productId, collectionMethod) => {
    const products = stripePaymentLinks.products || {};
    const productLinks = products[productId] || {};
    return productLinks[collectionMethod] || productLinks.default || '';
  };
  const isConfiguredPaymentLink = (value) =>
    typeof value === 'string' && /^https?:\/\//i.test(value) && !value.includes('REPLACE_ME');
  const parseGoals = (value) => (value || '').split(',').map((goal) => goal.trim()).filter(Boolean);

  const setStatus = (node, message, type) => {
    if (!node) return;
    node.textContent = message;
    node.classList.remove('is-success', 'is-error', 'is-loading');
    if (type === 'success') node.classList.add('is-success');
    if (type === 'error') node.classList.add('is-error');
    if (type === 'loading') node.classList.add('is-loading');
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

  const isMobileCollectionInfo = () => Boolean(mobileCollectionInfoQuery?.matches);

  const getCollectionInfo = (method) => COLLECTION_INFO[method] || null;

  const setInfoButtonExpanded = (method, isExpanded) => {
    elements.collectionInfoButtons.forEach((button) => {
      if (button.getAttribute('data-collection-info') === method) {
        button.setAttribute('aria-expanded', String(isExpanded));
      } else if (isExpanded) {
        button.setAttribute('aria-expanded', 'false');
      }
    });
  };

  const renderCollectionInfoPanel = (panel, method) => {
    const info = getCollectionInfo(method);
    if (!panel || !info) return;
    panel.innerHTML = `
      <strong>${info.title}</strong>
      <ul>
        ${info.details.map(([label, value]) => `<li><strong>${label}:</strong> ${value}</li>`).join('')}
      </ul>
    `;
  };

  const closeInlineCollectionInfo = () => {
    elements.collectionInfoPanels.forEach((panel) => {
      panel.hidden = true;
    });
    elements.collectionInfoButtons.forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
    });
  };

  const openInlineCollectionInfo = (method) => {
    elements.collectionInfoPanels.forEach((panel) => {
      const isTarget = panel.getAttribute('data-collection-info-panel') === method;
      if (isTarget) renderCollectionInfoPanel(panel, method);
      panel.hidden = !isTarget;
    });
    setInfoButtonExpanded(method, true);
  };

  const renderCollectionInfoModal = (method) => {
    const info = getCollectionInfo(method);
    if (!info) return false;
    if (elements.collectionModalKicker) elements.collectionModalKicker.textContent = info.kicker;
    if (elements.collectionModalTitle) elements.collectionModalTitle.textContent = info.title;
    if (elements.collectionModalLead) elements.collectionModalLead.textContent = info.lead;
    if (elements.collectionModalDetails) {
      elements.collectionModalDetails.innerHTML = info.details
        .map(([label, value]) => `<article><strong>${label}</strong><span>${value}</span></article>`)
        .join('');
    }
    return true;
  };

  const closeCollectionModal = () => {
    if (!elements.collectionModal) return;
    elements.collectionModal.hidden = true;
    document.body.classList.remove('modal-open');
    elements.collectionInfoButtons.forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
    });
    if (activeInfoTrigger) {
      activeInfoTrigger.focus();
      activeInfoTrigger = null;
    }
  };

  const openCollectionModal = (method, trigger) => {
    if (!elements.collectionModal || !renderCollectionInfoModal(method)) return;
    activeInfoTrigger = trigger || null;
    closeInlineCollectionInfo();
    elements.collectionModal.hidden = false;
    document.body.classList.add('modal-open');
    setInfoButtonExpanded(method, true);
    elements.collectionModal.querySelector('[data-collection-modal-close]')?.focus();
  };

  const toggleCollectionInfo = (method, trigger) => {
    if (!getCollectionInfo(method)) return;
    if (isMobileCollectionInfo()) {
      if (trigger?.getAttribute('aria-expanded') === 'true') closeInlineCollectionInfo();
      else openInlineCollectionInfo(method);
      return;
    }
    openCollectionModal(method, trigger);
  };

  const saveState = () => {
    store.saveState(state);
    root.dispatchEvent(new CustomEvent('ayuta:state-updated'));
  };

  const openLoginForCurrentOrderFlow = () => {
    root.AyutaAccount?.open?.('login', { returnTo: root.location.href });
  };

  const normalizeState = () => {
    const hasPersistedCheckoutState = Boolean((state.cart && state.cart.length) || (state.orders && state.orders.length));
    if (!COLLECTION_CONTENT[state.collectionMethod]) state.collectionMethod = null;
    if (!state.goal || !['all', 'foundation', 'performance', 'elite'].includes(state.goal)) state.goal = 'all';
    if (typeof state.collectionMethodChosen !== 'boolean') {
      state.collectionMethodChosen = Boolean(hasPersistedCheckoutState && state.collectionMethod);
    }
    if (!state.collectionMethodChosen) {
      state.collectionMethod = null;
    }
    state.cart = (state.cart || [])
      .slice(0, 1)
      .filter((item) => Boolean(getCatalogItem(item.id)))
      .map((item) => ({
        ...item,
        name: getCatalogItem(item.id).name,
        price: getPriceForCollection(item.id, state.collectionMethodChosen ? state.collectionMethod : null),
        quantity: 1
      }));
  };

  const getProductData = (item) => {
    if (!item) return null;
    const id = item.getAttribute('data-product-id');
    const details = getCatalogItem(id);
    if (!details) return null;
    return {
      ...details,
      rangeLabel: item.getAttribute('data-product-range') || '',
      price: getPriceForCollection(id, state.collectionMethodChosen ? state.collectionMethod : null)
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

  const renderSelectedElements = (items) => {
    if (!elements.detailElementsList) return;
    elements.detailElementsList.innerHTML = '';
    (items || []).forEach((item) => {
      const row = document.createElement('span');
      row.className = 'detail-element-item';
      row.textContent = item;
      elements.detailElementsList.appendChild(row);
    });
  };

  const showCollectionRequirement = () => {
    if (elements.collectionWarning) elements.collectionWarning.hidden = false;
    if (elements.detailRoutePicker) {
      elements.detailRoutePicker.classList.remove('is-shaking');
      elements.detailRoutePicker.classList.add('is-required');
      void elements.detailRoutePicker.offsetWidth;
      elements.detailRoutePicker.classList.add('is-shaking');
      root.setTimeout(() => elements.detailRoutePicker?.classList.remove('is-shaking'), 420);
    }
    if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
  };

  const clearCollectionRequirement = () => {
    if (elements.collectionWarning) elements.collectionWarning.hidden = true;
    elements.detailRoutePicker?.classList.remove('is-required', 'is-shaking');
  };

  const updateCollectionOptionNotes = (productId) => {
    const item = getCatalogItem(productId || selectedProductId);
    if (!item) return;
    const savings = Math.max(item.labPrice - item.homePrice, 0);
    elements.collectionNotes.forEach((node) => {
      const method = node.getAttribute('data-collection-note');
      if (method === 'home') {
        node.textContent = savings > 0 ? `Save ${store.formatCurrency(savings)}` : 'Lower price route';
      } else if (method === 'lab') {
        node.textContent = `${store.formatCurrency(item.labPrice)} clinic price`;
      }
    });
  };

  const updateGoalFilter = () => {
    elements.goalButtons.forEach((button) => {
      const isActive = button.getAttribute('data-goal') === state.goal;
      button.setAttribute('aria-pressed', String(isActive));
    });

    elements.productItems.forEach((item) => {
      const data = getProductData(item);
      const visible = Boolean(data) && (state.goal === 'all' || data.goals.includes(state.goal));
      item.classList.toggle('is-hidden', !visible);
      item.setAttribute('aria-hidden', String(!visible));
    });
  };

  const updateDetailToggle = (productId) => {
    if (!elements.detailToggle) return;
    const id = productId || selectedProductId;
    if (!id) return;
    const inCart = state.cart.some((entry) => entry.id === id);
    elements.detailToggle.textContent = inCart ? 'Selected for checkout' : 'Select this package';
    elements.detailToggle.setAttribute('data-product-id', id);
  };

  const selectProduct = (item) => {
    if (!item) return;
    const data = getProductData(item);
    if (!data) return;

    selectedProductId = data.id;
    elements.productItems.forEach((entry) => {
      const selected = entry === item;
      entry.classList.toggle('is-active', selected);
      entry.setAttribute('aria-selected', String(selected));
    });

    if (elements.detailName) elements.detailName.textContent = data.name;
    if (elements.detailBiomarkers) elements.detailBiomarkers.textContent = data.biomarkersLabel;
    if (elements.detailGoals) elements.detailGoals.textContent = data.focus;
    if (elements.detailTurnaround) elements.detailTurnaround.textContent = data.turnaround;
    if (elements.detailPrice) {
      elements.detailPrice.textContent = store.formatCurrency(
        getPriceForCollection(data.id, state.collectionMethodChosen ? state.collectionMethod : null)
      );
    }
    updateCollectionOptionNotes(data.id);
    renderSelectedElements(data.elements);
    renderBiomarkers(data.biomarkers);
    updateDetailToggle(data.id);
  };

  const ensureSelectedProduct = () => {
    const current = elements.productItems.find(
      (item) => item.getAttribute('data-product-id') === selectedProductId && !item.classList.contains('is-hidden')
    );
    if (current) {
      selectProduct(current);
      return;
    }

    const firstVisible = elements.productItems.find((item) => !item.classList.contains('is-hidden'));
    if (firstVisible) selectProduct(firstVisible);
  };

  const renderBasketItems = (container) => {
    if (!container) return;
    container.innerHTML = '';

    if (state.cart.length === 0) {
      container.innerHTML = '<p class="order-meta">No package selected yet. Choose one tier to continue to checkout.</p>';
      return;
    }

    state.cart.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'basket-item';
      row.innerHTML = `<div class="basket-item-main"><div class="basket-item-head"><strong class="basket-title">${item.name}</strong><span class="basket-collection">${getCollection()?.basketLabel || 'Collection required'}</span></div></div><div class="basket-item-actions"><span class="basket-price">${store.formatCurrency(item.price)}</span><button class="text-button basket-remove" type="button" aria-label="Remove ${item.name} from checkout" data-remove-id="${item.id}">Remove</button></div>`;
      container.appendChild(row);
    });
  };

  const renderBasket = () => elements.basketItems.forEach(renderBasketItems);

  const renderTotals = () => {
    const totals = store.getTotals(state.cart, TAX_RATE, 0);
    const subtotal = store.formatCurrency(totals.subtotal);
    const total = store.formatCurrency(totals.total);

    elements.summarySubtotal.forEach((node) => {
      node.textContent = subtotal;
    });
    elements.summaryShipping.forEach((node) => {
      node.textContent = store.formatCurrency(0);
    });
    elements.summaryShippingLabels.forEach((node) => {
      node.textContent = getCollection()?.label || 'Collection';
    });
    elements.summaryTaxes.forEach((node) => {
      node.textContent = store.formatCurrency(0);
    });
    elements.summaryTotal.forEach((node) => {
      node.textContent = total;
    });
  };

  const isStepEnabled = (step) =>
    step === 'select' || (step === 'payment' ? state.cart.length > 0 || state.orders.length > 0 : false);

  const updateSteps = () => {
    const complete = {
      select: state.cart.length > 0 || state.orders.length > 0,
      payment: state.orders.length > 0,
      post: state.orders.length > 0
    };

    elements.stepButtons.forEach((button) => {
      const key = button.getAttribute('data-order-step');
      const active = key === currentStep;
      button.classList.toggle('is-active', active);
      button.classList.toggle('is-complete', Boolean(complete[key]));
      button.disabled = !isStepEnabled(key);
      if (active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });

    elements.stepPanels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.getAttribute('data-order-panel') === currentStep);
    });

    elements.stepNextButtons.forEach((button) => {
      button.disabled = !isStepEnabled(button.getAttribute('data-step-next'));
    });
  };

  const setActiveStep = (step) => {
    if (!step || !isStepEnabled(step)) return;
    currentStep = step;
    updateSteps();
  };

  const updateCollectionUI = () => {
    const collection = getCollection();
    elements.collectionButtons.forEach((button) => {
      const active = state.collectionMethodChosen && button.getAttribute('data-collection') === state.collectionMethod;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (elements.collectionStatus) {
      elements.collectionStatus.textContent = collection
        ? collection.message
        : 'Select a collection route to confirm pricing and add this package.';
    }
    if (collection) clearCollectionRequirement();
  };

  const updateRegistrationMessage = () => {
    if (!elements.registerMessage) return;
    const snapshot = getAuthSnapshot();

    if (!snapshot?.configured) {
      elements.registerMessage.textContent = 'Account services are not configured yet. Add the project values before opening checkout.';
      return;
    }

    if (!snapshot.user) {
      elements.registerMessage.textContent = 'Sign in before opening checkout so the order can be saved to your account.';
      return;
    }

    const latestOrder = state.orders[0];
    elements.registerMessage.textContent = !latestOrder
      ? 'You are signed in. Choose one package and continue to hosted checkout.'
      : `Latest order ${latestOrder.id} is ${latestOrder.status}. Results stay locked until payment is confirmed and a report is attached.`;
  };

  const updateCheckoutEmail = () => {
    if (!elements.checkoutEmail || elements.checkoutEmail.value) return;
    const snapshot = getAuthSnapshot();
    elements.checkoutEmail.value =
      snapshot?.profile?.email || snapshot?.user?.email || state.session?.email || state.user?.email || state.paymentEmail || '';
  };

  const applyRecommendation = () => {
    const priority = elements.quizPriority?.value || 'baseline';
    const intensity = elements.quizIntensity?.value || 'light';
    let id = 'foundation';

    if (priority === 'deep' || (priority === 'training' && intensity === 'high')) id = 'elite';
    else if (priority === 'training' || intensity === 'steady' || intensity === 'high') id = 'performance';

    state.goal = id;
    saveState();
    refresh();

    const item = elements.productItems.find((entry) => entry.getAttribute('data-product-id') === id);
    if (!item) return;

    selectProduct(item);
    item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    setStatus(elements.quizStatus, `${getCatalogItem(id).name} looks like the closest match.`, 'success');
  };

  const refresh = () => {
    state = store.loadState();
    normalizeState();
    if (requestedStep && isStepEnabled(requestedStep)) {
      currentStep = requestedStep;
      requestedStep = null;
      root.history.replaceState({}, '', root.location.pathname);
    }
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
  };

  elements.goalButtons.forEach((button) =>
    button.addEventListener('click', () => {
      state.goal = button.getAttribute('data-goal') || 'all';
      saveState();
      refresh();
    })
  );

  elements.collectionButtons.forEach((button) =>
    button.addEventListener('click', () => {
      state.collectionMethod = button.getAttribute('data-collection') || 'home';
      state.collectionMethodChosen = true;
      normalizeState();
      saveState();
      refresh();
    })
  );

  elements.collectionInfoButtons.forEach((button) =>
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleCollectionInfo(button.getAttribute('data-collection-info'), button);
    })
  );

  elements.collectionModalClose.forEach((node) => {
    node.addEventListener('click', closeCollectionModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCollectionModal();
      closeInlineCollectionInfo();
    }
  });

  if (mobileCollectionInfoQuery) {
    const handleInfoModeChange = () => {
      closeCollectionModal();
      closeInlineCollectionInfo();
    };
    if (typeof mobileCollectionInfoQuery.addEventListener === 'function') {
      mobileCollectionInfoQuery.addEventListener('change', handleInfoModeChange);
    } else if (typeof mobileCollectionInfoQuery.addListener === 'function') {
      mobileCollectionInfoQuery.addListener(handleInfoModeChange);
    }
  }

  elements.productItems.forEach((item) => item.addEventListener('click', () => selectProduct(item)));

  if (elements.quizButton) elements.quizButton.addEventListener('click', applyRecommendation);

  if (elements.detailToggle) {
    elements.detailToggle.addEventListener('click', () => {
      if (!state.collectionMethodChosen || !state.collectionMethod) {
        showCollectionRequirement();
        return;
      }
      const id = elements.detailToggle.getAttribute('data-product-id');
      const details = getCatalogItem(id);
      if (!details) return;
      state.cart = [{ id: details.id, name: details.name, price: getPriceForCollection(details.id, state.collectionMethod), quantity: 1 }];
      saveState();
      refresh();
    });
  }

  elements.basketItems.forEach((container) => {
    container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-remove-id]');
      if (!button) return;
      const id = button.getAttribute('data-remove-id');
      state.cart = state.cart.filter((item) => item.id !== id);
      saveState();
      refresh();
    });
  });

  if (elements.registerTrigger) {
    elements.registerTrigger.addEventListener('click', openLoginForCurrentOrderFlow);
  }

  elements.stepButtons.forEach((button) =>
    button.addEventListener('click', () => setActiveStep(button.getAttribute('data-order-step')))
  );
  elements.stepNextButtons.forEach((button) =>
    button.addEventListener('click', () => setActiveStep(button.getAttribute('data-step-next')))
  );

  if (elements.checkoutForm) {
    elements.checkoutForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (state.cart.length === 0) {
        setStatus(elements.checkoutStatus, 'Add a package before checking out.', 'error');
        return;
      }

      const authSnapshot = getAuthSnapshot();
      if (!authSnapshot?.user) {
        setStatus(elements.checkoutStatus, 'Sign in before paying so your order can be stored in your account.', 'error');
        openLoginForCurrentOrderFlow();
        return;
      }

      const selectedItem = state.cart[0];
      const email = authSnapshot.profile?.email || authSnapshot.user.email || elements.checkoutEmail.value.trim();
      if (!email) {
        setStatus(elements.checkoutStatus, 'Enter an email for the receipt.', 'error');
        return;
      }

      const paymentLinkUrl = getPaymentLinkUrl(selectedItem.id, state.collectionMethod);
      if (!isConfiguredPaymentLink(paymentLinkUrl)) {
        setStatus(
          elements.checkoutStatus,
          'Checkout is not configured for this package yet. Add the hosted checkout URL before taking payment.',
          'error'
        );
        return;
      }

      const submitButton = elements.checkoutForm.querySelector('button[type="submit"]');
      if (submitButton) {
        setButtonLoading(submitButton, true);
      }

      setStatus(elements.checkoutStatus, 'Saving your order and opening checkout...', 'loading');

      try {
        const totals = store.getTotals(state.cart, TAX_RATE, 0);
        const order = {
          id: store.buildOrderId(),
          items: state.cart,
          total: totals.total,
          status: 'Awaiting payment confirmation',
          createdAt: new Date().toISOString(),
          email,
          ownerUid: authSnapshot.user.uid,
          collectionMethod: state.collectionMethod,
          packageTier: selectedItem.id,
          paymentProvider: 'stripe_payment_link',
          paymentMode: 'hosted_checkout',
          paymentVerification: 'pending_confirmation',
          paymentLinkUrl
        };

        state.orders = [order, ...state.orders];
        state.paymentEmail = email;
        saveState();

        try {
          await root.AyutaAuth.saveOrder(order);
        } catch (syncError) {
          console.warn(syncError);
        }

        root.dispatchEvent(new CustomEvent('ayuta:auth-updated'));
        root.location.assign(paymentLinkUrl);
      } catch (error) {
        console.error(error);
        setStatus(
          elements.checkoutStatus,
          error.message || 'The order could not be saved before checkout opened.',
          'error'
        );
        if (submitButton) {
          setButtonLoading(submitButton, false);
        }
      }
    });
  }

  root.addEventListener('ayuta:state-updated', refresh);
  root.addEventListener('ayuta:auth-updated', refresh);
  refresh();
});
