// Dynamically include nav.html into the #nav-placeholder element
fetch('../snippets/nav.html')
  .then(response => response.text())
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
    }
  });
