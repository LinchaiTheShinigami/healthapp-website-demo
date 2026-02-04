(function () {
  const store = window.AyutaStore;
  if (!store) return;

  const elements = {
    basket: document.getElementById('home-basket-items'),
    count: document.getElementById('home-basket-count'),
    total: document.getElementById('home-basket-total'),
    status: document.getElementById('home-session-status')
  };

  const renderBasket = (state) => {
    if (!elements.basket) return;
    elements.basket.innerHTML = '';
    if (state.cart.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'No items selected yet. Start an order to build your kit.';
      empty.classList.add('order-meta');
      elements.basket.appendChild(empty);
      return;
    }

    state.cart.slice(0, 3).forEach((item) => {
      const row = document.createElement('div');
      row.classList.add('hero-basket-item');
      const name = document.createElement('span');
      name.textContent = item.name;
      const price = document.createElement('strong');
      price.textContent = store.formatCurrency(item.price);
      row.appendChild(name);
      row.appendChild(price);
      elements.basket.appendChild(row);
    });

    if (state.cart.length > 3) {
      const more = document.createElement('p');
      more.textContent = `+${state.cart.length - 3} more in your basket`;
      more.classList.add('order-meta');
      elements.basket.appendChild(more);
    }
  };

  const renderSummary = (state) => {
    if (elements.count) elements.count.textContent = String(state.cart.length);
    if (elements.total) {
      elements.total.textContent = store.formatCurrency(store.getTotals(state.cart).total);
    }
  };

  const renderStatus = (state) => {
    if (!elements.status) return;
    if (state.session && state.session.email) {
      elements.status.textContent = `Signed in as ${state.session.email}.`;
    } else {
      elements.status.textContent = 'Not signed in yet.';
    }
  };

  const refresh = () => {
    const state = store.loadState();
    renderBasket(state);
    renderSummary(state);
    renderStatus(state);
  };

  window.addEventListener('ayuta:state-updated', refresh);
  window.addEventListener('ayuta:auth-updated', refresh);
  refresh();
})();
