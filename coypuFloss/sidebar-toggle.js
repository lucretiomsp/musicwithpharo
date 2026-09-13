/* Coypu docs — mobile sidebar toggle
   Injects hamburger button + overlay, no HTML changes needed beyond the script tag.
   Must be loaded AFTER coypu-nav.js, which builds the sidebar contents. */

(function () {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // --- inject button ---
  const btn = document.createElement('button');
  btn.id = 'navToggle';
  btn.className = 'nav-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Toggle navigation');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  document.body.appendChild(btn);

  // --- inject overlay ---
  const overlay = document.createElement('div');
  overlay.id = 'sidebarOverlay';
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  function open() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
  function close() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // close on nav link tap
  sidebar.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => { if (window.innerWidth <= 720) close(); })
  );
})();
