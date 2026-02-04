(function () {
  const store = window.AyutaStore;
  if (!store) return;

  const elements = {
    status: document.getElementById('orders-status'),
    list: document.getElementById('orders-list')
  };

  const render = () => {
    const state = store.loadState();
    if (!elements.status || !elements.list) return;
    elements.list.innerHTML = '';

    if (!state.session || !state.session.email) {
      elements.status.textContent = 'Sign in to view your orders.';
      return;
    }

    const orders = state.orders.filter((order) => order.email === state.session.email);
    if (orders.length === 0) {
      elements.status.textContent = 'No orders yet for this email.';
      return;
    }

    elements.status.textContent = `Signed in as ${state.session.email}.`;
    orders.forEach((order) => {
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
      elements.list.appendChild(card);
    });
  };

  window.addEventListener('ayuta:state-updated', render);
  window.addEventListener('ayuta:auth-updated', render);
  render();
})();
