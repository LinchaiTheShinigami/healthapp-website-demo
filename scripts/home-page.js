(function () {
  const auth = window.AyutaAuth;
  const store = window.AyutaStore;
  const status = document.getElementById('home-session-status');

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  const redirectToResults = () => {
    if (window.location.pathname.endsWith('/pages/results.html')) return;
    window.location.replace('pages/results.html');
  };

  const render = async () => {
    if (!auth || !store) return;
    await auth.whenReady();
    const snapshot = auth.getSnapshot();
    const state = store.loadState();

    if (snapshot.user || state.session?.email) {
      redirectToResults();
      return;
    }

    setStatus('Sign in to turn Ayuta into your results dashboard.');
  };

  window.addEventListener('ayuta:auth-updated', render);
  render();
})();
