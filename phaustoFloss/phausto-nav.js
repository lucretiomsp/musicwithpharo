/* =========================================================
   PHAUSTO DOCS — navigation
   Single source of truth for: sidebar, quick links, prev/next
   footer, search index and the index-page card grid.

   To add a page: add ONE line to PHAUSTO_PAGES, in reading order.
   ========================================================= */

const PHAUSTO_PAGES = [
  // ---- Getting Started ----
  { category: 'Getting Started', title: 'Introduction',              href: 'index.html',
    desc: 'What Phausto is, how it relates to FAUST, and what you can build with it.' },
  { category: 'Getting Started', title: 'Installation',              href: 'setup.html',
    desc: 'Load Phausto into a Pharo image and place the native FAUST libraries.' },
  { category: 'Getting Started', title: 'First Sounds',              href: 'first-sounds.html',
    desc: 'The DSP lifecycle: create, init, start, stop, destroy — and your first tone.' },
  { category: 'Getting Started', title: 'Learn in the Image',        href: 'masterlu.html',
    desc: 'MasterLu, the interactive in-image tutorial: 16 runnable Phausto lessons.' },

  // ---- Guides ----
  { category: 'Guides', title: 'Unit Generators',                    href: 'basics.html',
    desc: 'What a UGen is, the uLevel parameter, labels, and the UGen categories.' },
  { category: 'Guides', title: 'Connecting Unit Generators',         href: 'connecting.html',
    desc: 'The chuck operator, parallel composition, arithmetic, recursion and splits.' },
  { category: 'Guides', title: 'Parameters & Control',               href: 'parameters.html',
    desc: 'Naming parameters, setValue:parameter:, triggering, sweeps and automation.' },
  { category: 'Guides', title: 'Envelopes & Modulation',             href: 'envelopes.html',
    desc: 'ADSR and friends, LFOs, smoothing, and using envelopes beyond amplitude.' },
  { category: 'Guides', title: 'Synthesis Techniques',               href: 'synthesis.html',
    desc: 'Subtractive, additive, modal and FM synthesis, with runnable patches.' },
  { category: 'Guides', title: 'Filters',                            href: 'filters.html',
    desc: 'The 60-class filter tree: ladders, state-variable, comb, resonators, EQ.' },
  { category: 'Guides', title: 'Effects, Reverbs & Dynamics',        href: 'effects.html',
    desc: 'Delays, saturation, modulation effects, reverbs, compressors and limiters.' },
  { category: 'Guides', title: 'Physical Modelling',                 href: 'physical-models.html',
    desc: 'Modal percussion, strings, winds, exciters and bidirectional waveguides.' },
  { category: 'Guides', title: 'Sequencing & Sampling',              href: 'sequencing.html',
    desc: 'Pulses, counters, time tools and the TpSampler multisample player.' },
  { category: 'Guides', title: 'MIDI & Playing Notes',               href: 'midi.html',
    desc: 'playNote:prefix:dur:, MIDI-enabled DSPs, keyboards and controller mapping.' },

  // ---- Reference ----
  { category: 'Reference', title: 'UGen Library',                    href: 'ugen-library.html',
    desc: 'Every Unit Generator, grouped by family, with superclass and usage.' },
  { category: 'Reference', title: 'DSP & Parameter API',             href: 'dsp-api.html',
    desc: 'The complete DSP protocol: lifecycle, parameter access, UI introspection.' },
  { category: 'Reference', title: 'Setter Traits',                   href: 'traits.html',
    desc: 'The 22 traits that supply the fluid setter API shared across all UGens.' },
  { category: 'Reference', title: 'UI Primitives',                   href: 'ui-primitives.html',
    desc: 'Sliders, buttons, checkboxes, bargraphs and their FAUST metadata.' },
  { category: 'Reference', title: 'Math & Conversion Tools',         href: 'math.html',
    desc: 'Unary and binary operations, constants, and unit conversion UGens.' },
  { category: 'Reference', title: 'Demo Gallery',                    href: 'demos.html',
    desc: 'The built-in FAUST demo patches, ready to run in one line each.' },

  // ---- Advanced ----
  { category: 'Advanced', title: 'Raw FAUST & the Box API',          href: 'faust-box.html',
    desc: 'Drop to FAUST source strings, or build boxes directly through the Box API.' },
  { category: 'Advanced', title: 'TurboPhausto',                     href: 'turbophausto.html',
    desc: 'The batteries-included engine: racks, synths, samplers and Coypu live coding.' },
  { category: 'Advanced', title: 'Exporting',                        href: 'exporting.html',
    desc: 'Export patches to CMajor, JUCE plugins with APVTS, and Bela boards.' },
  { category: 'Advanced', title: 'Architecture & Internals',         href: 'internals.html',
    desc: 'The FFI bridge, the dynamic engine, renderers, buffers and the box pipeline.' },

  // ---- Project ----
  { category: 'Project', title: 'Changelog',                         href: 'changelog.html',
    desc: 'Notable changes to Phausto and to this manual.' },
  { category: 'Project', title: 'Community',                         href: 'community.html',
    desc: 'Where to ask questions, report bugs, and share what you have made.' },
  { category: 'Project', title: 'FAQ',                               href: 'faq.html',
    desc: 'Short answers to the questions that come up most often.' },
];

const PHAUSTO_QUICKLINKS = [
  'setup.html',
  'first-sounds.html',
  'ugen-library.html',
  'synthesis.html',
];

const PHAUSTO_REPO   = 'https://github.com/lucretiomsp/phausto';
const PHAUSTO_EDIT   = 'https://github.com/lucretiomsp/musicwithpharo/edit/main/phaustoFloss/';
const PHAUSTO_HOME   = 'index.html';

/* ---------- current page ---------- */

function phCurrentPage() {
  const declared = document.body.getAttribute('data-page');
  if (declared) return declared;
  const last = location.pathname.split('/').pop();
  return (!last || last === '') ? 'index.html' : last;
}

function phIndexOfCurrent() {
  const cur = phCurrentPage();
  return PHAUSTO_PAGES.findIndex(p => p.href === cur);
}

function phPageFor(href) {
  return PHAUSTO_PAGES.find(p => p.href === href);
}

/* ---------- sidebar ---------- */

function phBuildSidebar() {
  const host = document.getElementById('phausto-sidebar');
  if (!host) return;
  const cur = phCurrentPage();

  const quick = PHAUSTO_QUICKLINKS
    .map(href => phPageFor(href))
    .filter(Boolean)
    .map(p => `<a href="${p.href}">${p.title}</a>`)
    .join('');

  let nav = '';
  let lastCategory = null;
  for (const p of PHAUSTO_PAGES) {
    if (p.category !== lastCategory) {
      nav += `<div class="nav-category">${p.category}</div>`;
      lastCategory = p.category;
    }
    const current = p.href === cur ? ' aria-current="page"' : '';
    nav += `<a href="${p.href}"${current}>${p.title}</a>`;
  }

  host.innerHTML = `
    <div class="sidebar-logo">
      <a href="${PHAUSTO_HOME}" class="logo-mark">🎛 <span>Phausto</span></a>
      <p>FAUST × Pharo</p>
    </div>

    <div class="nav-quicklinks">
      <div class="nav-category">Quick links</div>
      <div class="quicklink-row">${quick}</div>
    </div>

    <div class="sidebar-nav">${nav}</div>

    <div class="sidebar-footer">
      <a href="${PHAUSTO_REPO}" target="_blank" rel="noopener">GitHub ↗</a>
      <button type="button" id="phausto-theme-toggle" class="theme-toggle"
              aria-label="Toggle light and dark theme">◐ Theme</button>
      <button type="button" id="phausto-search-open" class="theme-toggle"
              aria-label="Search the documentation">⌘K Search</button>
    </div>`;
}

/* ---------- prev / up / next ---------- */

function phBuildPageNav() {
  const host = document.getElementById('phausto-page-nav');
  if (!host) return;
  const i = phIndexOfCurrent();
  if (i < 0) return;

  const prev = i > 0 ? PHAUSTO_PAGES[i - 1] : null;
  const next = i < PHAUSTO_PAGES.length - 1 ? PHAUSTO_PAGES[i + 1] : null;

  let html = '';
  html += prev
    ? `<a href="${prev.href}" class="prev">
         <span class="nav-dir">Previous</span>
         <span class="nav-title">← ${prev.title}</span>
       </a>`
    : '<span></span>';

  html += `<a href="${PHAUSTO_HOME}" class="up">
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

function phBuildEditLink() {
  const host = document.querySelector('.edit-link');
  if (!host) return;
  host.innerHTML =
    `<a href="${PHAUSTO_EDIT}${phCurrentPage()}" target="_blank" rel="noopener">Edit this page on GitHub</a>`;
}

/* ---------- index card grid ---------- */

function phBuildIndexGrid() {
  const host = document.getElementById('phausto-index-grid');
  if (!host) return;

  let html = '';
  let lastCategory = null;
  for (const p of PHAUSTO_PAGES) {
    if (p.href === PHAUSTO_HOME) continue;
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

function phInitTheme() {
  const btn = document.getElementById('phausto-theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('phausto-theme', dark ? 'dark' : 'light'); } catch (e) {}
  });
}

/* ---------- search (⌘K) ---------- */

function phInitSearch() {
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
      ? PHAUSTO_PAGES.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q))
      : PHAUSTO_PAGES;
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

  const opener = document.getElementById('phausto-search-open');
  if (opener) opener.addEventListener('click', open);
}

/* ---------- boot ---------- */

(function () {
  phBuildSidebar();
  phBuildPageNav();
  phBuildEditLink();
  phBuildIndexGrid();
  phInitTheme();
  phInitSearch();
})();
