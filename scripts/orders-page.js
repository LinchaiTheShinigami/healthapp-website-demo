(function () {
  const store = window.AyutaStore;
  const auth = window.AyutaAuth;
  if (!store || !auth) return;

  const elements = {
    locked: document.getElementById('orders-locked'),
    lockedStatus: document.getElementById('orders-locked-status'),
    authenticated: document.getElementById('orders-authenticated'),
    status: document.getElementById('orders-status'),
    list: document.getElementById('orders-list')
  };

  const mergeUnique = (items, key) => {
    const seen = new Map();
    items.forEach((item) => {
      const id = item && item[key];
      if (!id || seen.has(id)) return;
      seen.set(id, item);
    });
    return Array.from(seen.values());
  };

  const setLockedState = (snapshot) => {
    if (elements.locked) elements.locked.hidden = false;
    if (elements.authenticated) elements.authenticated.hidden = true;

    if (!elements.lockedStatus) return;
    if (snapshot.loading) {
      elements.lockedStatus.textContent = 'Checking your session.';
      return;
    }
    if (!snapshot.configured) {
      elements.lockedStatus.textContent = 'Authentication is not configured yet. Add your Firebase project values in scripts/auth-config.js.';
      return;
    }
    elements.lockedStatus.textContent = 'Sign in to view your saved orders.';
  };

  const buildOrderCard = (order) => {
    const card = document.createElement('div');
    card.classList.add('order-item');

    const heading = document.createElement('h3');
    heading.textContent = `Order ${order.id}`;

    const meta = document.createElement('p');
    meta.classList.add('order-meta');
    meta.textContent = `${store.formatDate(order.createdAt)} | ${store.formatCurrency(order.total)} | ${order.status}`;

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
    return card;
  };

  const buildEmptyState = (message) => {
    const node = document.createElement('div');
    node.className = 'empty-state';
    node.textContent = message;
    return node;
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
    if (!elements.status || !elements.list) return;

    const accountEmail = snapshot.profile?.email || snapshot.user.email || '';
    const localOrders = store
      .loadState()
      .orders.filter((order) => order.email === accountEmail);

    let remoteOrders = [];
    let cloudLoadFailed = false;

    try {
      remoteOrders = await auth.listOrders();
    } catch (error) {
      cloudLoadFailed = true;
      console.error(error);
    }

    const orders = mergeUnique([...remoteOrders, ...localOrders], 'id').sort((left, right) => {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

    elements.list.innerHTML = '';

    if (orders.length === 0) {
      elements.status.textContent = `Signed in as ${accountEmail}. No orders have been saved for this account yet.`;
      elements.list.appendChild(buildEmptyState('Your paid bookings will appear here after checkout.'));
      return;
    }

    elements.status.textContent = cloudLoadFailed
      ? `Signed in as ${accountEmail}. Showing the orders saved on this device because cloud sync is currently unavailable.`
      : `Signed in as ${accountEmail}.`;

    orders.forEach((order) => {
      elements.list.appendChild(buildOrderCard(order));
    });
  };

  window.addEventListener('ayuta:auth-updated', render);
  window.addEventListener('ayuta:state-updated', render);
  render();
})();
