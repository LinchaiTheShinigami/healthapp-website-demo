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

  // ── Icon lookups ──────────────────────────────────────────────────────────
  const BIOMARKER_ICONS = {
    HbA1c: 'fa-droplet',
    Ferritin: 'fa-bolt',
    Iron: 'fa-bolt',
    'Vitamin D': 'fa-sun',
    'Vitamin B12': 'fa-bolt',
    'Free Testosterone': 'fa-dumbbell',
    'Total Testosterone': 'fa-dumbbell',
    Testosterone: 'fa-dumbbell',
    Cortisol: 'fa-brain',
    'Apolipoprotein B': 'fa-heart-pulse',
    'Apolipoprotein A': 'fa-heart-pulse',
    'C-Reactive': 'fa-fire-flame-simple',
    Cholesterol: 'fa-heart-pulse',
    TSH: 'fa-gauge',
    'Free T3': 'fa-thermometer',
    'Free T4': 'fa-thermometer',
    Oestradiol: 'fa-venus',
    Prolactin: 'fa-circle-dot',
    Folate: 'fa-seedling',
    'Folic Acid': 'fa-seedling',
    'IGF-1': 'fa-arrow-trend-up',
    Zinc: 'fa-shield-halved',
    SHBG: 'fa-link',
  };

  const ELEMENT_ICONS = {
    'Full Blood Count': 'fa-microscope',
    Vitamins: 'fa-capsules',
    Iron: 'fa-bolt',
    Cholesterol: 'fa-heart-pulse',
    HbA1c: 'fa-droplet',
    Testosterone: 'fa-dumbbell',
    Cortisol: 'fa-brain',
    'C-Reactive Protein': 'fa-fire-flame-simple',
    Apolipoprotein: 'fa-heart-pulse',
    Zinc: 'fa-shield-halved',
    SHBG: 'fa-link',
    Folate: 'fa-seedling',
    'Folic Acid': 'fa-seedling',
    Thyroid: 'fa-gauge',
    Oestradiol: 'fa-venus',
    Prolactin: 'fa-circle-dot',
    'IGF-1': 'fa-arrow-trend-up',
  };

  const getBiomarkerIcon = (name) => {
    for (const [key, icon] of Object.entries(BIOMARKER_ICONS)) {
      if (name.includes(key)) return icon;
    }
    return 'fa-vial';
  };

  const getElementIcon = (name) => {
    for (const [key, icon] of Object.entries(ELEMENT_ICONS)) {
      if (name.includes(key)) return icon;
    }
    return 'fa-vial';
  };
  // ─────────────────────────────────────────────────────────────────────────

  const catalog = {
    foundation: {
      id: 'foundation',
      name: 'Foundation',
      description: 'Baseline gym and PT package built from blood count, vitamins, iron, cholesterol, and HbA1c coverage.',
      biomarkersLabel: '5 source tests',
      goals: ['foundation'],
      homePrice: 149,
      labPrice: 199,
      turnaround: '3–5 days home · 2–3 days clinic',
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
      turnaround: '3–5 days home · 2–3 days clinic',
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
      turnaround: '3–5 days home · 2–3 days clinic',
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
    quizStatus: document.getElementById('recommendation-status'),
    tierCards: Array.from(document.querySelectorAll('[data-tier-card]')),
    tierTabChips: Array.from(document.querySelectorAll('[data-tier-tab]')),
    tierSelectButtons: Array.from(document.querySelectorAll('.tier-select-btn'))
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

  const renderBiomarkersInto = (grid, items) => {
    if (!grid) return;
    grid.innerHTML = '';
    (items || []).forEach(([name, category, explanation]) => {
      const icon = getBiomarkerIcon(name);
      const card = document.createElement('div');
      card.className = 'bio-chip';
      card.innerHTML = `<span class="bio-icon fa-solid ${icon}" aria-hidden="true"></span><div class="bio-text"><strong>${name}</strong><span>${category}</span></div><span class="bio-info" tabindex="0" role="button" aria-label="Why ${name} matters">?<span class="bio-tooltip">${explanation}</span></span>`;
      grid.appendChild(card);
    });
  };

  const renderElementsInto = (list, items) => {
    if (!list) return;
    list.innerHTML = '';
    (items || []).forEach((item) => {
      const icon = getElementIcon(item);
      const label = item.replace(/ Blood Test$/, '');
      const row = document.createElement('span');
      row.className = 'detail-element-item';
      row.innerHTML = `<span class="detail-element-icon fa-solid ${icon}" aria-hidden="true"></span>${label}`;
      list.appendChild(row);
    });
  };

  const renderAllTierContent = () => {
    Object.values(catalog).forEach((data) => {
      const grid = document.getElementById(`detail-biomarker-grid-${data.id}`);
      const list = document.getElementById(`detail-elements-list-${data.id}`);
      renderBiomarkersInto(grid, data.biomarkers);
      renderElementsInto(list, data.elements);
    });
  };

  // Keep legacy aliases so any remaining references don't break
  const renderBiomarkers = (items) => renderBiomarkersInto(document.getElementById('detail-biomarker-grid'), items);
  const renderSelectedElements = (items) => renderElementsInto(document.getElementById('detail-elements-list'), items);

  const showCollectionRequirement = (tierId) => {
    const card = tierId ? document.querySelector(`[data-tier-card="${tierId}"]`) : null;
    const warning = card ? card.querySelector('.collection-warning') : elements.collectionWarning;
    const toggle = card ? document.querySelector('.tiers-collection-bar .collection-toggle') : elements.detailRoutePicker;
    if (warning) warning.hidden = false;
    if (toggle) {
      toggle.classList.remove('is-shaking');
      toggle.classList.add('is-required');
      void toggle.offsetWidth;
      toggle.classList.add('is-shaking');
      root.setTimeout(() => toggle.classList.remove('is-shaking'), 420);
    }
    if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
  };

  const clearCollectionRequirement = (tierId) => {
    const card = tierId ? document.querySelector(`[data-tier-card="${tierId}"]`) : null;
    const warning = card ? card.querySelector('.collection-warning') : elements.collectionWarning;
    if (warning) warning.hidden = true;
    // clear shake on the global collection toggle
    const toggle = document.querySelector('.tiers-collection-bar .collection-toggle') || elements.detailRoutePicker;
    toggle?.classList.remove('is-required', 'is-shaking');
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
    // update in-cart state on all tier select buttons
    elements.tierSelectButtons.forEach((btn) => {
      const id = btn.getAttribute('data-product-id');
      const inCart = state.cart.some((entry) => entry.id === id);
      const name = getCatalogItem(id)?.name || id;
      btn.textContent = inCart ? `${name} selected` : `Select ${name}`;
    });
    // legacy detailToggle if still present
    if (elements.detailToggle) {
      const id = productId || selectedProductId;
      if (!id) return;
      const inCart = state.cart.some((entry) => entry.id === id);
      elements.detailToggle.textContent = inCart ? 'Selected for checkout' : 'Select this package';
      elements.detailToggle.setAttribute('data-product-id', id);
    }
  };

  // Mark the currently-in-cart tier card as selected
  const updateTierCardSelectionState = () => {
    const cartId = state.cart[0]?.id || null;
    elements.tierCards.forEach((card) => {
      const tierId = card.getAttribute('data-tier-card');
      card.classList.toggle('is-selected', tierId === cartId);
    });
  };

  // Mobile tab strip: make one tier card visible, activate its chip
  const activateMobileTierTab = (tierId) => {
    elements.tierCards.forEach((card) => {
      card.classList.toggle('is-mobile-active', card.getAttribute('data-tier-card') === tierId);
    });
    elements.tierTabChips.forEach((chip) => {
      const active = chip.getAttribute('data-tier-tab') === tierId;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-selected', String(active));
    });
  };

  const ensureSelectedProduct = () => {
    updateTierCardSelectionState();
    // On mobile, ensure at least one tier card is always visible
    const isMobile = root.matchMedia ? root.matchMedia('(max-width: 760px)').matches : false;
    if (isMobile) {
      const hasActive = elements.tierCards.some((c) => c.classList.contains('is-mobile-active'));
      if (!hasActive) activateMobileTierTab('foundation');
    }
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
    if (collection) {
      clearCollectionRequirement();
    }
    // Update prices on all tier cards whenever collection state changes
    elements.tierCards.forEach((card) => {
      const tierId = card.getAttribute('data-tier-card');
      const data = getCatalogItem(tierId);
      if (!data) return;
      const price = getPriceForCollection(tierId, state.collectionMethodChosen ? state.collectionMethod : null);
      const priceEl = card.querySelector(`#tier-price-${tierId}`);
      if (priceEl) priceEl.textContent = store.formatCurrency(price);
      // Also sync mobile tab chip price
      const chip = document.querySelector(`[data-tier-tab="${tierId}"] .tier-tab-price`);
      if (chip) chip.textContent = store.formatCurrency(price);
    });
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

    activateMobileTierTab(id);
    selectedProductId = id;
    const card = document.querySelector(`[data-tier-card="${id}"]`);
    card?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
    updateTierCardSelectionState();
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

  // Mobile tier tab strip
  elements.tierTabChips.forEach((chip) =>
    chip.addEventListener('click', () => {
      const tierId = chip.getAttribute('data-tier-tab');
      if (tierId) activateMobileTierTab(tierId);
    })
  );

  // Clicking anywhere on a tier card triggers select (same as the footer button)
  elements.tierCards.forEach((card) =>
    card.addEventListener('click', (event) => {
      // Don't intercept clicks on the '?' info triggers, tooltip buttons, or the select button itself
      if (event.target.closest('.collection-info-trigger, .tier-select-btn, .bio-info')) return;
      const tierId = card.getAttribute('data-tier-card');
      if (!tierId) return;
      if (!state.collectionMethodChosen || !state.collectionMethod) {
        showCollectionRequirement(tierId);
        return;
      }
      const data = getCatalogItem(tierId);
      if (!data) return;
      state.cart = [{ id: data.id, name: data.name, price: getPriceForCollection(data.id, state.collectionMethod), quantity: 1 }];
      selectedProductId = tierId;
      saveState();
      refresh();
    })
  );

  // Tier select buttons
  elements.tierSelectButtons.forEach((btn) =>
    btn.addEventListener('click', () => {
      const tierId = btn.getAttribute('data-product-id');
      if (!tierId) return;
      if (!state.collectionMethodChosen || !state.collectionMethod) {
        showCollectionRequirement(tierId);
        return;
      }
      const data = getCatalogItem(tierId);
      if (!data) return;
      state.cart = [{ id: data.id, name: data.name, price: getPriceForCollection(data.id, state.collectionMethod), quantity: 1 }];
      selectedProductId = tierId;
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

  // Render biomarkers + elements into all tier bodies
  renderAllTierContent();

  if (elements.quizButton) elements.quizButton.addEventListener('click', applyRecommendation);

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

  // Tap support for .bio-info hint buttons (biomarker chips + detail-meta tooltips).
  // The collection-info-trigger buttons have their own handler above; exclude them.
  document.addEventListener('click', (event) => {
    const hint = event.target.closest('.bio-info');
    if (hint) {
      event.stopPropagation();
      const isOpen = hint.classList.contains('is-tip-open');
      document.querySelectorAll('.bio-info.is-tip-open').forEach((el) => el.classList.remove('is-tip-open'));
      if (!isOpen) hint.classList.add('is-tip-open');
      return;
    }
    // Close any open hint when tapping elsewhere
    document.querySelectorAll('.bio-info.is-tip-open').forEach((el) => el.classList.remove('is-tip-open'));
  }, true); // capture phase so stopPropagation prevents product-list-item selection when tapping hint

  refresh();
});
