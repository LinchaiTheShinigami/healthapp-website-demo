document.addEventListener('DOMContentLoaded', async function () {
  const store = window.AyutaStore;
  const auth = window.AyutaAuth;
  if (!store) return;

  const elements = {
    status: document.getElementById('payment-return-status'),
    detail: document.getElementById('payment-return-detail'),
    summary: document.getElementById('payment-return-summary')
  };

  const setText = (node, value) => {
    if (node) node.textContent = value;
  };

  const render = async () => {
    if (auth && typeof auth.whenReady === 'function') {
      await auth.whenReady();
    }

    const snapshot = auth && typeof auth.getSnapshot === 'function' ? auth.getSnapshot() : null;
    const state = store.loadState();
    const latestOrder = [...(state.orders || [])]
      .filter((order) => order && order.paymentProvider === 'stripe_payment_link')
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];

    if (!latestOrder) {
      setText(elements.status, 'No recent checkout order was found on this device yet.');
      setText(
        elements.detail,
        'Return to the order page, choose a package, and open checkout to create an order record.'
      );
      setText(elements.summary, 'Your order summary will appear here after checkout.');
      return;
    }

    setText(elements.status, `Order ${latestOrder.id} is saved as ${latestOrder.status}.`);
    setText(
      elements.detail,
      'Payment confirmation, collection, and report access will continue from your account timeline.'
    );
    setText(
      elements.summary,
      `${store.formatDate(latestOrder.createdAt)} | ${store.formatCurrency(latestOrder.total)} | ${latestOrder.collectionMethod === 'home' ? 'Home kit' : 'Clinic appointment'}`
    );
  };

  window.addEventListener('ayuta:auth-updated', render);
  window.addEventListener('ayuta:state-updated', render);
  render();
});
