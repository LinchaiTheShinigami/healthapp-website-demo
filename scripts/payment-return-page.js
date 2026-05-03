document.addEventListener('DOMContentLoaded', async function () {
  const store = window.AyutaStore;
  const auth = window.AyutaAuth;
  if (!store) return;

  const elements = {
    status: document.getElementById('payment-return-status'),
    detail: document.getElementById('payment-return-detail'),
    summary: document.getElementById('payment-return-summary'),
    tracker: document.getElementById('order-tracker')
  };

  const setText = (node, value) => {
    if (node) node.textContent = value;
  };

  // Maps an order status string to a 0-based completed step index.
  // Steps: 0=payment, 1=collected, 2=processing, 3=reviewed, 4=complete
  const STATUS_STEP = {
    // Snake-case keys (internal/future use)
    pending: 0,
    payment_pending: 0,
    confirmed: 1,
    payment_confirmed: 1,
    collected: 2,
    sample_collected: 2,
    processing: 3,
    lab_processing: 3,
    reviewed: 4,
    quality_reviewed: 4,
    complete: 5,
    results_ready: 5,
    // Human-readable labels used by order-page.js
    'Awaiting payment confirmation': 0
  };

  const STEP_KEYS = ['payment', 'collected', 'processing', 'reviewed', 'complete'];

  const updateTracker = (status) => {
    if (!elements.tracker) return;
    const completedUpTo = STATUS_STEP[status] !== undefined ? STATUS_STEP[status] : 0;
    const steps = elements.tracker.querySelectorAll('[data-tracker-step]');
    steps.forEach((step, index) => {
      step.classList.remove('is-complete', 'is-active');
      if (index < completedUpTo) {
        step.classList.add('is-complete');
      } else if (index === completedUpTo) {
        step.classList.add('is-active');
      }
    });
  };

  const render = async () => {
    if (auth && typeof auth.whenReady === 'function') {
      await auth.whenReady();
    }

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
    updateTracker(latestOrder.status || 'pending');
  };

  window.addEventListener('ayuta:auth-updated', render);
  window.addEventListener('ayuta:state-updated', render);
  render();
});
