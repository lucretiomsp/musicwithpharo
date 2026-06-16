/* Coypu docs — mobile sidebar toggle
   Injects hamburger button + overlay, no HTML changes needed beyond the script tag */

(function () {
  // --- inject button ---
  const btn = document.createElement('button');
  btn.id = 'sidebarToggle';
  btn.className = 'sidebar-toggle';
  btn.setAttribute('aria-label', 'Toggle navigation');
  btn.innerHTML = '<span></span><span></span><span></span>';
  document.body.appendChild(btn);

  // --- inject overlay ---
  const overlay = document.createElement('div');
  overlay.id = 'sidebarOverlay';
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  const sidebar = document.querySelector('.sidebar');

  function open() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    btn.classList.add('active');
  }
  function close() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    btn.classList.remove('active');
  }

  btn.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
  overlay.addEventListener('click', close);

  // close on nav link tap
  sidebar.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => { if (window.innerWidth <= 720) close(); })
  );
})();
