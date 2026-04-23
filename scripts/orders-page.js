(function () {
  const store = window.AyutaStore;
  const auth = window.AyutaAuth;
  if (!store || !auth) return;

  const elements = {
    locked: document.getElementById('orders-locked'),
    lockedStatus: document.getElementById('orders-locked-status'),
    authenticated: document.getElementById('orders-authenticated'),
    heading: document.getElementById('orders-heading'),
    list: document.getElementById('orders-list'),
    detailCard: document.getElementById('orders-detail-card'),
    selectedTitle: document.getElementById('orders-selected-title'),
    selectedSummary: document.getElementById('orders-selected-summary'),
    selectedStatus: document.getElementById('orders-selected-status'),
    selectedMeta: document.getElementById('orders-selected-meta'),
    progress: document.getElementById('orders-progress'),
    detailStack: document.getElementById('orders-detail-stack'),
    mapKicker: document.getElementById('orders-map-kicker'),
    mapCaption: document.getElementById('orders-map-caption'),
    mapFrame: document.getElementById('orders-map-frame')
  };

  const isLocalPreview = ['127.0.0.1', 'localhost'].includes(window.location.hostname);
  let activeOrderId = null;

  const demoOrders = () => [
    {
      id: 'AYU-260402-86',
      createdAt: '2026-04-02T12:30:00Z',
      status: 'Sample testing in lab',
      total: 149,
      collectionMethod: 'home',
      items: [{ name: 'Foundation' }],
      statusNote: 'The returned sample has been accessioned and is currently being analysed by the lab.',
      labReceivedAt: '2026-04-02T10:40:00Z',
      destinationLabel: 'Ayuta sample receiving hub',
      mapQuery: 'Brighton, UK',
      isDemo: true
    },
    {
      id: 'AYU-260402-85',
      createdAt: '2026-04-02T08:15:00Z',
      status: 'Clinic appointment booked',
      total: 499,
      collectionMethod: 'lab',
      items: [{ name: 'Elite' }],
      statusNote: 'Your venous sample appointment is confirmed and ready for attendance.',
      appointment: {
        date: '04 Apr 2026',
        time: '08:30',
        location: 'Canary Wharf Clinic'
      },
      mapQuery: 'Canary Wharf, London',
      isDemo: true
    },
    {
      id: 'AYU-260401-84',
      createdAt: '2026-04-01T11:10:00Z',
      status: 'Kit sent',
      total: 249,
      collectionMethod: 'home',
      items: [{ name: 'Performance' }],
      statusNote: 'Your home sampling kit has left the warehouse and is on its way.',
      trackingCarrier: 'Royal Mail Tracked 24',
      trackingCode: 'RMAYU47299183GB',
      destinationLabel: 'Ayuta sample receiving hub',
      mapQuery: 'Brighton, UK',
      isDemo: true
    },
    {
      id: 'AYU-260401-83',
      createdAt: '2026-04-01T09:20:00Z',
      status: 'New order',
      total: 149,
      collectionMethod: 'home',
      items: [{ name: 'Foundation' }],
      statusNote: 'Payment has been received and fulfilment has been queued.',
      destinationLabel: 'Ayuta sample receiving hub',
      mapQuery: 'Brighton, UK',
      isDemo: true
    },
    {
      id: 'AYU-251118-18',
      createdAt: '2025-11-18T08:10:00Z',
      status: 'Report sent',
      total: 199,
      collectionMethod: 'lab',
      items: [{ name: 'Foundation' }],
      statusNote: 'Your report has been released to the dashboard and is ready to review.',
      appointment: { date: '18 Nov 2025', time: '08:10', location: 'Canary Wharf Clinic' },
      reportSentAt: '2025-11-19T16:10:00Z',
      mapQuery: 'Canary Wharf, London',
      isDemo: true
    },
    {
      id: 'AYU-251215-26',
      createdAt: '2025-12-15T08:25:00Z',
      status: 'Report sent',
      total: 149,
      collectionMethod: 'home',
      items: [{ name: 'Foundation' }],
      statusNote: 'Your report has been released to the dashboard and is ready to review.',
      reportSentAt: '2025-12-16T14:25:00Z',
      destinationLabel: 'Ayuta sample receiving hub',
      mapQuery: 'Brighton, UK',
      isDemo: true
    },
    {
      id: 'AYU-260112-41',
      createdAt: '2026-01-12T08:30:00Z',
      status: 'Report sent',
      total: 149,
      collectionMethod: 'home',
      items: [{ name: 'Foundation' }],
      statusNote: 'Your report has been released to the dashboard and is ready to review.',
      reportSentAt: '2026-01-13T13:05:00Z',
      destinationLabel: 'Ayuta sample receiving hub',
      mapQuery: 'Brighton, UK',
      isDemo: true
    },
    {
      id: 'AYU-260128-49',
      createdAt: '2026-01-28T09:00:00Z',
      status: 'Report sent',
      total: 299,
      collectionMethod: 'lab',
      items: [{ name: 'Performance' }],
      statusNote: 'Your report has been released to the dashboard and is ready to review.',
      appointment: { date: '28 Jan 2026', time: '09:00', location: 'Canary Wharf Clinic' },
      reportSentAt: '2026-01-29T17:20:00Z',
      mapQuery: 'Canary Wharf, London',
      isDemo: true
    },
    {
      id: 'AYU-260220-57',
      createdAt: '2026-02-20T09:15:00Z',
      status: 'Report sent',
      total: 299,
      collectionMethod: 'lab',
      items: [{ name: 'Performance' }],
      statusNote: 'Your report has been released to the dashboard and is ready to review.',
      appointment: { date: '20 Feb 2026', time: '09:15', location: 'Canary Wharf Clinic' },
      reportSentAt: '2026-02-21T15:40:00Z',
      mapQuery: 'Canary Wharf, London',
      isDemo: true
    },
    {
      id: 'AYU-260310-61',
      createdAt: '2026-03-10T07:40:00Z',
      status: 'Report sent',
      total: 249,
      collectionMethod: 'home',
      items: [{ name: 'Performance' }],
      statusNote: 'Your report has been released to the dashboard and is ready to review.',
      reportSentAt: '2026-03-11T12:35:00Z',
      destinationLabel: 'Ayuta sample receiving hub',
      mapQuery: 'Brighton, UK',
      isDemo: true
    },
    {
      id: 'AYU-260324-63',
      createdAt: '2026-03-24T07:50:00Z',
      status: 'Report sent',
      total: 499,
      collectionMethod: 'lab',
      items: [{ name: 'Elite' }],
      statusNote: 'Your report has been released to the dashboard and is ready to review.',
      appointment: { date: '24 Mar 2026', time: '07:50', location: 'Canary Wharf Clinic' },
      reportSentAt: '2026-03-25T16:15:00Z',
      mapQuery: 'Canary Wharf, London',
      isDemo: true
    },
    {
      id: 'AYU-260331-72',
      createdAt: '2026-03-31T08:10:00Z',
      status: 'Report sent',
      total: 399,
      collectionMethod: 'home',
      items: [{ name: 'Elite' }],
      statusNote: 'Your report has been released to the dashboard and is ready to review.',
      reportSentAt: '2026-03-31T18:20:00Z',
      destinationLabel: 'Ayuta sample receiving hub',
      mapQuery: 'Brighton, UK',
      isDemo: true
    }
  ];

  const mergeUnique = (items, key) => {
    const seen = new Map();
    items.forEach((item) => {
      const id = item && item[key];
      if (!id || seen.has(id)) return;
      seen.set(id, item);
    });
    return Array.from(seen.values());
  };

  const setStatus = (node, message, state) => {
    if (!node) return;
    node.textContent = message || '';
    node.classList.remove('is-success', 'is-error', 'is-loading');
    if (state === 'success') node.classList.add('is-success');
    if (state === 'error') node.classList.add('is-error');
    if (state === 'loading') node.classList.add('is-loading');
  };

  const buildEmptyState = (message, loading) => {
    const node = document.createElement('div');
    node.className = 'empty-state';
    if (loading) node.classList.add('is-loading');
    node.textContent = message;
    return node;
  };

  const formatDateTime = (value) => {
    const date = new Date(value);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const collectionLabel = (value) => (value === 'home' ? 'Home kit' : 'Clinic appointment');

  const packageLabel = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return 'Order';
    return raw.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const normalizeStatus = (value) => {
    const label = String(value || '').trim();
    const lower = label.toLowerCase();
    if (/reported|report sent/.test(lower)) return 'Report sent';
    if (/sample testing|testing in lab|lab/.test(lower) && !/label|clinic/.test(lower)) return 'Sample testing in lab';
    if (/clinic appointment|appointment/.test(lower)) return 'Clinic appointment booked';
    if (/kit sent|dispatched|tracking/.test(lower)) return 'Kit sent';
    if (/awaiting payment|payment confirmation|new order/.test(lower)) return 'New order';
    return label || 'New order';
  };

  const normalizeOrder = (order) => {
    const items = Array.isArray(order.items) && order.items.length
      ? order.items
      : order.packageTier
        ? [{ name: packageLabel(order.packageTier) }]
        : [{ name: 'Order' }];
    const collectionMethod = order.collectionMethod === 'home' ? 'home' : 'lab';
    return {
      ...order,
      id: order.id || store.buildOrderId(),
      createdAt: order.createdAt || new Date().toISOString(),
      items,
      total: Number.isFinite(Number(order.total)) ? Number(order.total) : 0,
      status: normalizeStatus(order.status),
      collectionMethod,
      statusNote: order.statusNote || '',
      appointment: order.appointment || null,
      trackingCarrier: order.trackingCarrier || '',
      trackingCode: order.trackingCode || '',
      labReceivedAt: order.labReceivedAt || '',
      reportSentAt: order.reportSentAt || '',
      destinationLabel: order.destinationLabel || (collectionMethod === 'home' ? 'Ayuta sample receiving hub' : ''),
      mapQuery: order.mapQuery || (collectionMethod === 'home' ? 'Brighton, UK' : (order.appointment?.location || 'Canary Wharf, London'))
    };
  };

  const statusTone = (status) => {
    const value = String(status || '').toLowerCase();
    if (/report/.test(value)) return 'ok';
    if (/new order|kit sent|appointment|testing|sample|pending|processing/.test(value)) return 'pending';
    if (/issue|failed|cancelled|problem/.test(value)) return 'alert';
    return 'pending';
  };

  const stepsFor = (order) =>
    order.collectionMethod === 'home'
      ? ['New order', 'Kit sent', 'Lab Testing', 'Report sent']
      : ['New order', 'Clinic appointment booked', 'Lab Testing', 'Report sent'];

  const currentStepIndex = (order) => {
    const status = normalizeStatus(order.status);
    const steps = stepsFor(order);
    const direct = steps.indexOf(status);
    if (direct >= 0) return direct;
    if (status === 'Sample testing in lab') {
      return steps.indexOf('Lab Testing');
    }
    return 0;
  };

  const clearActiveCards = () =>
    Array.from(elements.list?.children || []).forEach((node) => {
      node.classList.remove('is-active');
      node.setAttribute('aria-pressed', 'false');
    });

  const setLockedState = (snapshot) => {
    if (elements.locked) elements.locked.hidden = false;
    if (elements.authenticated) elements.authenticated.hidden = true;

    if (!elements.lockedStatus) return;
    if (snapshot.loading) {
      setStatus(elements.lockedStatus, 'Checking your session.', 'loading');
      return;
    }
    if (!snapshot.configured) {
      setStatus(elements.lockedStatus, 'Authentication is not configured yet. Add your project values in scripts/auth-config.js.');
      return;
    }
    setStatus(elements.lockedStatus, 'Sign in to view your saved orders.');
  };

  const renderMap = (order) => {
    if (!elements.mapFrame || !elements.mapKicker || !elements.mapCaption) return;
    const isHome = order.collectionMethod === 'home';
    elements.mapKicker.textContent = isHome ? 'Postal destination' : 'Clinic location';
    elements.mapCaption.textContent = isHome
      ? order.destinationLabel || 'Postal destination'
      : order.appointment?.location || 'Clinic location';

    if (!order.mapQuery) {
      elements.mapFrame.innerHTML = '<div class="empty-state">No location is attached to this order yet.</div>';
      return;
    }

    const src = `https://www.google.com/maps?q=${encodeURIComponent(order.mapQuery)}&output=embed`;
    elements.mapFrame.innerHTML = `<iframe src="${src}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" aria-label="${elements.mapCaption.textContent} map"></iframe>`;
  };

  const renderProgress = (order) => {
    if (!elements.progress) return;
    const steps = stepsFor(order);
    const currentIndex = currentStepIndex(order);
    const fill = steps.length > 1 ? (currentIndex / (steps.length - 1)) * 100 : 100;
    elements.progress.innerHTML = `
      <div class="orders-progress-head">
        <div>
          <span class="eyebrow">Fulfilment progress</span>
          <h3>${order.status}</h3>
        </div>
        <span class="orders-progress-note">${collectionLabel(order.collectionMethod)}</span>
      </div>
      <div class="order-progress-track" style="--progress-fill: ${fill}%;">
        <div class="order-progress-bar" aria-hidden="true">
          <span class="order-progress-track-base"></span>
          <span class="order-progress-track-fill"></span>
        </div>
        <div class="order-progress-line">
          ${steps
            .map((step, index) => {
              const state = index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming';
              const stateLabel = state === 'complete' ? 'Complete' : state === 'current' ? 'Current' : 'Pending';
              return `
                <div class="order-progress-step is-${state}">
                  <span class="order-progress-marker" aria-hidden="true"><span class="order-progress-dot"></span></span>
                  <span class="order-progress-label">${step}</span>
                  <span class="order-progress-state">${stateLabel}</span>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  };

  const renderFacts = (order) => {
    if (!elements.detailStack) return;
    const facts = [
      { label: 'Order ID', value: order.id },
      { label: 'Placed', value: store.formatDate(order.createdAt) },
      { label: 'Route', value: collectionLabel(order.collectionMethod) },
      { label: 'Total', value: store.formatCurrency(order.total) },
      { label: 'Current state', value: order.status }
    ];

    if (order.collectionMethod === 'home') {
      facts.push({
        label: 'Tracking',
        value: order.trackingCode ? `${order.trackingCarrier || 'Tracking'} • ${order.trackingCode}` : 'Tracking will appear once the kit is dispatched.'
      });
    } else {
      facts.push({
        label: 'Clinic appointment',
        value: order.appointment
          ? `${order.appointment.date} • ${order.appointment.time} • ${order.appointment.location}`
          : 'Clinic date, time, and location will appear once the appointment is booked.'
      });
    }

    if (order.labReceivedAt) facts.push({ label: 'Lab received', value: formatDateTime(order.labReceivedAt) });
    if (order.reportSentAt) facts.push({ label: 'Report sent', value: formatDateTime(order.reportSentAt) });

    elements.detailStack.innerHTML = `
      <div class="orders-detail-list-simple" role="list">
        ${facts
          .map(
            (fact) => `
              <article class="orders-detail-row" role="listitem">
                <span class="orders-detail-row-label">${fact.label}</span>
                <strong class="orders-detail-row-value">${fact.value}</strong>
              </article>
            `
          )
          .join('')}
      </div>
    `;
  };

  const clearSelection = () => {
    activeOrderId = null;
    if (elements.authenticated) elements.authenticated.classList.add('orders-workbench--list-only');
    if (elements.detailCard) elements.detailCard.hidden = true;
    if (elements.selectedTitle) elements.selectedTitle.textContent = 'Choose an order';
    if (elements.selectedSummary) {
      elements.selectedSummary.textContent = 'Select an order from the list to review status, process, and route details.';
    }
    if (elements.selectedStatus) {
      elements.selectedStatus.textContent = 'Awaiting selection';
      elements.selectedStatus.className = 'metric-status metric-status--pending';
    }
    if (elements.selectedMeta) {
      elements.selectedMeta.innerHTML = '';
      elements.selectedMeta.hidden = true;
    }
    if (elements.progress) elements.progress.innerHTML = '';
    if (elements.detailStack) {
      elements.detailStack.innerHTML = '<div class="empty-state">Select an order to inspect the fulfilment timeline.</div>';
    }
    if (elements.mapKicker) elements.mapKicker.textContent = 'Route map';
    if (elements.mapCaption) elements.mapCaption.textContent = 'Select an order to load the clinic or postal destination.';
    if (elements.mapFrame) elements.mapFrame.innerHTML = '<div class="empty-state">Select an order to view the related location.</div>';
    clearActiveCards();
  };

  const selectOrder = (orders, id) => {
    const order = orders.find((entry) => entry.id === id);
    if (!order) return;
    activeOrderId = order.id;
    if (elements.authenticated) elements.authenticated.classList.remove('orders-workbench--list-only');
    if (elements.detailCard) elements.detailCard.hidden = false;
    if (elements.selectedTitle) elements.selectedTitle.textContent = order.items[0]?.name || 'Order';
    if (elements.selectedSummary) elements.selectedSummary.textContent = 'Fulfilment detail and route information are shown below.';
    if (elements.selectedStatus) {
      elements.selectedStatus.textContent = order.status;
      elements.selectedStatus.className = `metric-status metric-status--${statusTone(order.status)}`;
    }
    if (elements.selectedMeta) {
      elements.selectedMeta.innerHTML = '';
      elements.selectedMeta.hidden = true;
    }
    renderProgress(order);
    renderFacts(order);
    renderMap(order);
    Array.from(elements.list?.children || []).forEach((node) => {
      const active = node.getAttribute('data-order-id') === order.id;
      node.classList.toggle('is-active', active);
      node.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  const buildOrderCard = (order, orders) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'order-item order-item--compact';
    card.setAttribute('data-order-id', order.id);
    card.setAttribute('aria-pressed', 'false');
    card.innerHTML = `
      <div class="order-item-top">
        <div class="order-item-copy">
          <h3>${order.items[0]?.name || 'Order'}</h3>
          <p class="order-item-kicker">${store.formatDate(order.createdAt)} • ${order.id}</p>
        </div>
        <span class="metric-status metric-status--${statusTone(order.status)}">${order.status}</span>
      </div>
    `;
    card.addEventListener('click', () => {
      if (activeOrderId === order.id) {
        clearSelection();
        return;
      }
      selectOrder(orders, order.id);
    });
    return card;
  };

  const render = async () => {
    await auth.whenReady();
    const snapshot = auth.getSnapshot();

    if (!snapshot.user) {
      setLockedState(snapshot);
      return;
    }

    if (elements.locked) elements.locked.hidden = true;
    if (elements.authenticated) elements.authenticated.hidden = false;
    if (!elements.list) return;
    if (elements.heading) setStatus(elements.heading, 'Loading your orders.', 'loading');
    elements.list.innerHTML = '';
    elements.list.appendChild(buildEmptyState('Loading your order history.', true));

    const accountEmail = snapshot.profile?.email || snapshot.user.email || '';
    const localOrders = store.loadState().orders.filter((order) => order.email === accountEmail).map(normalizeOrder);

    let remoteOrders = [];
    let cloudLoadFailed = false;

    try {
      remoteOrders = (await auth.listOrders()).map(normalizeOrder);
    } catch (error) {
      cloudLoadFailed = true;
      console.error(error);
    }

    const merged = mergeUnique([...remoteOrders, ...localOrders], 'id').sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );

    const usedDemo = merged.length === 0;
    const previewDemo = isLocalPreview;
    const orders = usedDemo
      ? demoOrders().map(normalizeOrder)
      : previewDemo
        ? mergeUnique([...merged, ...demoOrders().map(normalizeOrder)], 'id').sort(
            (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
          )
        : merged;

    elements.list.innerHTML = '';

    if (!orders.length) {
      if (elements.heading) setStatus(elements.heading, 'No orders have been saved to this account yet.');
      elements.list.appendChild(buildEmptyState('Your pending and paid bookings will appear here after checkout.'));
      clearSelection();
      return;
    }

    if (elements.heading) {
      setStatus(
        elements.heading,
        previewDemo
          ? `Local preview • ${orders.length} orders in history.`
          : usedDemo
            ? `Sample dataset • ${orders.length} orders in history.`
            : cloudLoadFailed
              ? `Cached view • ${orders.length} orders available.`
              : `${orders.length} orders in history.`
      );
    }

    orders.forEach((order) => elements.list.appendChild(buildOrderCard(order, orders)));

    if (activeOrderId && orders.some((order) => order.id === activeOrderId)) {
      selectOrder(orders, activeOrderId);
      return;
    }
    clearSelection();
  };

  window.addEventListener('ayuta:auth-updated', render);
  window.addEventListener('ayuta:state-updated', render);
  render();
})();
