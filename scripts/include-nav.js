// Dynamically include nav.html into the #nav-placeholder element
function getNavPath() {
  // Get current path depth
  const path = window.location.pathname;
  // If at root (e.g. /index.html), use 'snippets/nav.html'
  // If in subfolder (e.g. /pages/about.html), use '../snippets/nav.html'
  if (path.endsWith('index.html') || path === '/' || path === '/index.html') {
    throw new Error('index.html has its own nav, no need to include it.');
  } else {
    return '../snippets/nav.html';
  }
}

fetch(getNavPath())
  .then(response => {
    if (!response.ok) throw new Error('Nav snippet not found');
    return response.text();
  })
  .then(data => {
    document.getElementById('nav-placeholder').innerHTML = data;
    // Highlight active link
    const page = window.location.pathname.split('/').pop();
    if (page === 'index.html' || page === '') {
      document.getElementById('nav-home').classList.add('active');
    } else if (page === 'about.html') {
      document.getElementById('nav-about').classList.add('active');
    } else if (page === 'contact.html') {
      document.getElementById('nav-contact').classList.add('active');
    } else if (page === 'webapp.html') {
      //No button that needs to be set to active
    }
  })
  .catch(error => {
    document.getElementById('nav-placeholder').innerHTML = '<!-- Navigation not found -->';
    console.error(error);
  });
