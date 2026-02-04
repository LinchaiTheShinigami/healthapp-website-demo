function getBasePath() {
  const path = window.location.pathname;
  const page = path.split('/').pop();
  if (!page || page === '' || page === 'index.html') {
    return '';
  }
  return '../';
}

function getNavPath(basePath) {
  return `${basePath}snippets/nav.html`;
}

function setNavLinks(navRoot, basePath) {
  navRoot.querySelectorAll('[data-nav-link][data-path]').forEach(link => {
    const target = link.getAttribute('data-path');
    link.setAttribute('href', `${basePath}${target}`);
  });

  navRoot.querySelectorAll('[data-asset]').forEach(asset => {
    const src = asset.getAttribute('data-asset');
    asset.setAttribute('src', `${basePath}${src}`);
  });
}

function setActiveLink(navRoot) {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  let activeKey = null;
  if (page === '' || page === 'index.html') activeKey = 'home';
  if (page === 'order.html') activeKey = 'order';
  if (page === 'webapp.html') activeKey = 'mobile';
  if (page === 'orders.html') activeKey = 'orders';
  if (page === 'results.html') activeKey = 'results';
  if (page === 'profile.html') activeKey = 'profile';
  if (activeKey) {
    const activeLink = navRoot.querySelector(`[data-nav-key="${activeKey}"]`);
    if (activeLink) {
      activeLink.classList.add('is-active');
      activeLink.setAttribute('aria-current', 'page');
    }
  }
}

function wireNavToggle(navRoot) {
  const toggle = navRoot.querySelector('[data-nav-toggle]');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const isOpen = navRoot.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  navRoot.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navRoot.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const basePath = getBasePath();
const navPlaceholder = document.getElementById('nav-placeholder');

if (navPlaceholder) {
  fetch(getNavPath(basePath))
    .then(response => {
      if (!response.ok) throw new Error('Nav snippet not found');
      return response.text();
    })
    .then(data => {
      navPlaceholder.innerHTML = data;
      const navRoot = navPlaceholder.querySelector('.site-nav');
      if (!navRoot) return;
      setNavLinks(navRoot, basePath);
      setActiveLink(navRoot);
      wireNavToggle(navRoot);
      if (window.AyutaNav && typeof window.AyutaNav.init === 'function') {
        window.AyutaNav.init(navRoot);
      }
      if (window.AyutaAccount && typeof window.AyutaAccount.init === 'function') {
        window.AyutaAccount.init(navRoot);
      }
    })
    .catch(error => {
      navPlaceholder.innerHTML = '<!-- Navigation not found -->';
      console.error(error);
    });
}
