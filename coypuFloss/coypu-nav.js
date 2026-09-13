/* =========================================================
   COYPU DOCS — navigation
   Single source of truth for: sidebar, quick links, prev/next
   footer, search index and the index-page card grid.

   To add a page: add ONE line to COYPU_PAGES, in reading order.
   ========================================================= */

const COYPU_PAGES = [
  // ---- Getting Started ----
  { category: 'Getting Started', title: 'Introduction',            href: 'index.html',
    desc: 'What Coypu is, what it drives, and what a live-coded pattern looks like.' },
  { category: 'Getting Started', title: 'Setup & Installation',    href: 'setup.html',
    desc: 'Load Coypu into a Pharo image and connect it to a sound engine.' },
  { category: 'Getting Started', title: 'First Sounds',            href: 'first-sounds.html',
    desc: 'The Performance, the Performer and your first rhythm on an instrument.' },
  { category: 'Getting Started', title: 'Coypu by Example',        href: 'by-example.html',
    desc: 'A worked session: from one kick drum to a full arrangement, line by line.' },

  // ---- Guides ----
  { category: 'Guides', title: 'Rhythms: Basics',                  href: 'rhythms-basics.html',
    desc: 'Binary arrays, named rhythms, hex beats, and routing a Sequencer to an instrument.' },
  { category: 'Guides', title: 'Rhythms: Advanced',                href: 'rhythms-advanced.html',
    desc: 'Euclidean patterns, offsets, polymetre, Mondo mini-notation and random walks.' },
  { category: 'Guides', title: 'The Rhythms Explained',            href: 'rhythms-explained.html',
    desc: 'Where each named rhythm comes from, how it is built, and how to use it musically.' },
  { category: 'Guides', title: 'Melody & Scales',                  href: 'melody.html',
    desc: 'Notes, scales, chords, arpeggios and the generative melody tools.' },
  { category: 'Guides', title: 'Effects & Mixing',                 href: 'effects.html',
    desc: 'SuperDirt effect parameters, levels, panning and per-track shaping.' },
  { category: 'Guides', title: 'Phausto & MIDI',                   href: 'phausto-midi.html',
    desc: 'Driving the Phausto DSP engine, external MIDI hardware, Kyma and Pure Data.' },

  // ---- Reference ----
  { category: 'Reference', title: 'Rhythm Library',                href: 'rhythm-library.html',
    desc: 'Every rhythm Coypu can generate, with verified step patterns and origins.' },
  { category: 'Reference', title: 'Player & Message API',          href: 'api.html',
    desc: 'Performance, Performer, Sequencer — the classes and the messages they answer.' },
  { category: 'Reference', title: 'Pattern Operators',             href: 'operators.html',
    desc: 'The symbols and conversion messages that turn plain Pharo values into patterns.' },

  // ---- Performance ----
  { category: 'Performance', title: 'Performing',                  href: 'performing.html',
    desc: 'Transport, tempo, mute and solo, looping and live control during a set.' },
  { category: 'Performance', title: 'Gallery',                     href: 'gallery.html',
    desc: 'Complete patterns worth stealing, each one runnable as written.' },

  // ---- Project ----
  { category: 'Project', title: 'Changelog',                       href: 'changelog.html',
    desc: 'How Coypu is versioned and what has changed.' },
  { category: 'Project', title: 'Community',                       href: 'community.html',
    desc: 'Where to ask, how to report a bug, and how to contribute.' },
  { category: 'Project', title: 'FAQ',                             href: 'faq.html',
    desc: 'Short answers to the questions that come up most often.' },
];

const COYPU_QUICKLINKS = [
  'setup.html',
  'first-sounds.html',
  'rhythm-library.html',
  'performing.html',
];

const COYPU_REPO = 'https://github.com/lucretiomsp/coypu';
const COYPU_EDIT = 'https://github.com/lucretiomsp/musicwithpharo/edit/main/coypuFloss/';
const COYPU_HOME = 'index.html';

/* ---------- current page ---------- */

function coyCurrentPage() {
  const declared = document.body.getAttribute('data-page');
  if (declared) return declared;
  const last = location.pathname.split('/').pop();
  return (!last || last === '') ? 'index.html' : last;
}

function coyIndexOfCurrent() {
  const cur = coyCurrentPage();
  return COYPU_PAGES.findIndex(p => p.href === cur);
}

function coyPageFor(href) {
  return COYPU_PAGES.find(p => p.href === href);
}

/* ---------- sidebar ---------- */

function coyBuildSidebar() {
  const host = document.getElementById('coypu-sidebar');
  if (!host) return;
  const cur = coyCurrentPage();

  const quick = COYPU_QUICKLINKS
    .map(href => coyPageFor(href))
    .filter(Boolean)
    .map(p => `<a href="${p.href}">${p.title}</a>`)
    .join('');

  let nav = '';
  let lastCategory = null;
  for (const p of COYPU_PAGES) {
    if (p.category !== lastCategory) {
      nav += `<div class="nav-category">${p.category}</div>`;
      lastCategory = p.category;
    }
    const current = p.href === cur ? ' aria-current="page"' : '';
    nav += `<a href="${p.href}"${current}>${p.title}</a>`;
  }

  host.innerHTML = `
    <div class="sidebar-logo">
      <a href="${COYPU_HOME}" class="logo-mark">🦫 <span>Coypu</span></a>
      <p>Live Coding Music in Pharo</p>
    </div>

    <div class="nav-quicklinks">
      <div class="nav-category">Quick links</div>
      <div class="quicklink-row">${quick}</div>
    </div>

    <div class="sidebar-nav">${nav}</div>

    <div class="sidebar-footer">
      <a href="${COYPU_REPO}" target="_blank" rel="noopener">GitHub ↗</a>
      <button type="button" id="coypu-theme-toggle" class="theme-toggle"
              aria-label="Toggle light and dark theme">◐ Theme</button>
      <button type="button" id="coypu-search-open" class="theme-toggle"
              aria-label="Search the documentation">⌘K Search</button>
    </div>`;
}

/* ---------- prev / up / next ---------- */

function coyBuildPageNav() {
  const host = document.getElementById('coypu-page-nav');
  if (!host) return;
  const i = coyIndexOfCurrent();
  if (i < 0) return;

  const prev = i > 0 ? COYPU_PAGES[i - 1] : null;
  const next = i < COYPU_PAGES.length - 1 ? COYPU_PAGES[i + 1] : null;

  let html = '';
  html += prev
    ? `<a href="${prev.href}" class="prev">
         <span class="nav-dir">Previous</span>
         <span class="nav-title">← ${prev.title}</span>
       </a>`
    : '<span></span>';

  html += `<a href="${COYPU_HOME}" class="up">
             <span class="nav-dir">Up</span>
             <span class="nav-title">Documentation Home</span>
           </a>`;

  html += next
    ? `<a href="${next.href}" class="next">
         <span class="nav-dir">Next</span>
         <span class="nav-title">${next.title} →</span>
       </a>`
    : '<span></span>';

  host.innerHTML = html;
}

/* ---------- edit on GitHub ---------- */

function coyBuildEditLink() {
  const host = document.querySelector('.edit-link');
  if (!host) return;
  host.innerHTML =
    `<a href="${COYPU_EDIT}${coyCurrentPage()}" target="_blank" rel="noopener">Edit this page on GitHub</a>`;
}

/* ---------- index card grid ---------- */

function coyBuildIndexGrid() {
  const host = document.getElementById('coypu-index-grid');
  if (!host) return;

  let html = '';
  let lastCategory = null;
  for (const p of COYPU_PAGES) {
    if (p.href === COYPU_HOME) continue;
    if (p.category !== lastCategory) {
      if (lastCategory !== null) html += '</div>';
      html += `<h2 class="index-category">${p.category}</h2><div class="index-grid">`;
      lastCategory = p.category;
    }
    html += `<a href="${p.href}" class="doc-card">
               <span class="card-title">${p.title}</span>
               <span class="card-desc">${p.desc}</span>
             </a>`;
  }
  if (lastCategory !== null) html += '</div>';
  host.innerHTML = html;
}

/* ---------- theme ---------- */

function coyInitTheme() {
  const btn = document.getElementById('coypu-theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('coypu-theme', dark ? 'dark' : 'light'); } catch (e) {}
  });
}

/* ---------- search (⌘K) ---------- */

function coyInitSearch() {
  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.innerHTML = `
    <div class="search-panel" role="dialog" aria-label="Search documentation">
      <input type="text" class="search-input" placeholder="Search pages…" aria-label="Search pages">
      <div class="search-results"></div>
    </div>`;
  document.body.appendChild(overlay);

  const input   = overlay.querySelector('.search-input');
  const results = overlay.querySelector('.search-results');

  function render(term) {
    const q = term.trim().toLowerCase();
    const hits = q
      ? COYPU_PAGES.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q))
      : COYPU_PAGES;
    results.innerHTML = hits.length
      ? hits.map(p => `<a href="${p.href}">
                         <span class="hit-title">${p.title}</span>
                         <span class="hit-cat">${p.category}</span>
                       </a>`).join('')
      : '<p class="search-empty">No matching page.</p>';
  }

  function open()  { overlay.classList.add('visible'); input.value = ''; render(''); input.focus(); }
  function close() { overlay.classList.remove('visible'); }

  input.addEventListener('input', () => render(input.value));
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
    if (e.key === 'Escape') close();
  });

  const opener = document.getElementById('coypu-search-open');
  if (opener) opener.addEventListener('click', open);
}

/* ---------- boot ---------- */

(function () {
  coyBuildSidebar();
  coyBuildPageNav();
  coyBuildEditLink();
  coyBuildIndexGrid();
  coyInitTheme();
  coyInitSearch();
})();
