(function () {
  const store = window.AyutaStore;
  if (!store) return;

  const elements = {
    status: document.getElementById('results-status'),
    list: document.getElementById('results-list')
  };

  const render = () => {
    const state = store.loadState();
    if (!elements.status || !elements.list) return;
    elements.list.innerHTML = '';

    if (!state.session || !state.session.email) {
      elements.status.textContent = 'Sign in to view your results.';
      return;
    }

    const results = state.results.filter((entry) => entry.email === state.session.email);
    if (results.length === 0) {
      elements.status.textContent = 'No results available for this email yet.';
      return;
    }

    elements.status.textContent = `Signed in as ${state.session.email}.`;
    results.forEach((entry) => {
      const card = document.createElement('div');
      card.classList.add('result-item');

      const heading = document.createElement('h3');
      heading.textContent = `Results for ${entry.orderId}`;

      const meta = document.createElement('p');
      meta.classList.add('result-meta');
      meta.textContent = `${store.formatDate(entry.createdAt)} | ${entry.status}`;

      const tags = document.createElement('div');
      tags.classList.add('result-tags');
      const items = Array.isArray(entry.results) ? entry.results : [];
      items.forEach((item) => {
        const tag = document.createElement('span');
        tag.classList.add('result-tag');
        tag.textContent = `${item.name}: ${item.status}`;
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
