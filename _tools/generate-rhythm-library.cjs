#!/usr/bin/env node
/*
 * Regenerate coypuFloss/rhythm-library.html from the Coypu package source.
 *
 * Step patterns, step counts, onset positions and which rhythms accept a
 * note-string variant are all DERIVED FROM SOURCE, never typed by hand. The
 * curated part is the prose: origin labels and the ethnomusicological notes,
 * which live in NOTES below.
 *
 * Usage:
 *   node _tools/generate-rhythm-library.cjs <path-to-Coypu-src-dir>
 *   COYPU_SRC=<path> node _tools/generate-rhythm-library.cjs
 *
 * <path> is the directory containing the Coypu package, i.e. the `src` folder
 * of a checkout of github.com/lucretiomsp/coypu (branch `master`), or any
 * directory holding the *.st files.
 *
 * Plain Node, no dependencies. Jekyll excludes _-prefixed dirs from _site.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------- source dir

const root = process.argv[2] || process.env.COYPU_SRC;

if (!root) {
  console.error(`
Missing the Coypu source directory.

  node _tools/generate-rhythm-library.cjs <path-to-Coypu-src-dir>

The src/ folder of a checkout of github.com/lucretiomsp/coypu (branch master).
`.trim());
  process.exit(1);
}
if (!fs.existsSync(root)) { console.error(`Not found: ${root}`); process.exit(1); }

const out = path.join(__dirname, '..', 'coypuFloss', 'rhythm-library.html');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ------------------------------------------------------------- parse the source

function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git') continue;
    const p = path.join(d, e.name);
    e.isDirectory() ? walk(p, acc) : (e.name.endsWith('.st') && acc.push(p));
  }
  return acc;
}

const files = walk(root);
if (!files.length) { console.error(`No .st files under: ${root}`); process.exit(1); }

const src = {};            // selector -> { pattern|hex|computed, notesVariant, broken }
const noteVariants = new Set();
const brokenVariants = new Set();

for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');

  for (const m of s.matchAll(/^(\w+(?: class)?) >> (.+?) \[\n([\s\S]*?)\n\]$/gm)) {
    const [, , selRaw, body] = m;
    const sel = selRaw.includes(':')
      ? selRaw.split(/\s+/).filter(t => t.endsWith(':')).join('')
      : selRaw.split(/\s+/)[0];

    // note-string variants: `<rhythm>: aStringOfNotes`
    if (/^[a-zA-Z]+:$/.test(sel) && /aStringOfNotes|aStringWithDirtNotes/.test(selRaw)) {
      noteVariants.add(sel.slice(0, -1));
      if (body.includes('pattern size') && !/pattern\s*:=/.test(body)) {
        brokenVariants.add(sel.slice(0, -1));
      }
    }

    if (!body.includes('<rhythmCreation>')) continue;

    const arr = (body.match(/pattern\s*:=\s*#\(([^)]*)\)/) || [])[1];
    const hex = (body.match(/'([0-9A-Fa-f]{4,})'\s*hexBeat/) || [])[1];
    src[sel] = {
      pattern: arr ? arr.trim().split(/\s+/).join('') : null,
      hex: hex || null,
      onTheFly: body.includes('<onTheFlyEssentials>'),
    };
  }
}

// Formulaic rhythms: reproduce what the source computes, at a 16-step reference.
const REF = 16;
const bit = b => (b ? '1' : '0');
const range = n => Array.from({ length: n }, (_, i) => i + 1);

const COMPUTED = {
  downbeats:   { bits: range(REF).map(i => bit(i % 4 === 1)).join(''), rule: 'a trigger on every 4th pulse' },
  upbeats:     { bits: range(REF).map(i => bit(i % 4 === 3)).join(''), rule: 'a trigger on the 3rd pulse of each group of 4' },
  quavers:     { bits: range(REF).map(i => bit(i % 4 === 1 || i % 4 === 3)).join(''), rule: 'a trigger on pulses 1 and 3 of each group of 4' },
  semiquavers: { bits: '1'.repeat(REF), rule: 'every pulse triggered' },
  trigs:       { bits: '1'.repeat(REF), rule: 'every pulse triggered' },
  rests:       { bits: '0'.repeat(REF), rule: 'no triggers at all' },
  randomTrigs: { bits: null, rule: 'a fresh random pattern on every evaluation' },
  'randomTrigsWithProbability:': { bits: null, rule: 'random, with the density you specify' },
};

function expand(sel) {
  const e = src[sel];
  if (!e) return null;
  if (e.pattern) return e.pattern;
  if (e.hex) return [...e.hex].map(c => parseInt(c, 16).toString(2).padStart(4, '0')).join('');
  if (COMPUTED[sel]) return COMPUTED[sel].bits;
  return null;
}

function onsets(bits) {
  return bits ? [...bits].map((b, i) => (b === '1' ? i + 1 : null)).filter(Boolean) : [];
}

function grouping(bits) {
  const o = onsets(bits);
  if (o.length < 2) return null;
  const g = [];
  for (let i = 1; i < o.length; i++) g.push(o[i] - o[i - 1]);
  g.push(bits.length - o[o.length - 1] + o[0]);
  return g.join('+');
}

// ------------------------------------------------------------------ curated prose

const NOTES = {
  tresillo: ['Pan-Caribbean',
    'Three strokes over eight pulses, grouped 3+3+2. The most widespread rhythmic cell in Afro-Atlantic music: it underlies the Cuban son, Puerto Rican bomba, Brazilian maxixe, the New Orleans second line and modern reggaeton. In Cuban practice it is the first half of the son clave.'],
  claveSon: ['Cuba',
    'The five-stroke key pattern of Cuban son, and through it of salsa and most Afro-Cuban popular music. <em>Clave</em> means key or keystone: every other part in the ensemble orients to it. Its third stroke falls on step 7 — move that one stroke to step 8 and you have the rumba clave.'],
  rumba: ['Cuba',
    'The rumba clave, spine of secular Afro-Cuban drumming — guaguancó, yambú and columbia. It differs from the son clave by a single stroke, the third landing on step 8 rather than 7, which gives it a harder push against the pulse. It took shape in the solares of Havana and Matanzas in the nineteenth century.'],
  tumbao: ['Cuba',
    'The habanera cell, and the bass tumbao derived from it. It travelled out of Cuba into Mexican danzón and Argentine tango, and — as Jelly Roll Morton\u2019s \u201cSpanish tinge\u201d — into early jazz. Coypu\u2019s name for it reflects its later life as a bass pattern in son and salsa.'],
  banda: ['Haiti · Cuba · Guinea',
    'Five strokes in eight: <em>cinquillo</em> in Cuba, <em>banda</em> in Haitian Vodou drumming, and part of <em>moribayasa</em> among the Malinke of Guinea — three names for one rhythm, and a neat illustration of Atlantic circulation. Structurally it is tresillo with the gaps filled in.'],
  bomba: ['Puerto Rico',
    'From the Puerto Rican bomba, among the oldest African-derived genres in the Caribbean, developed by enslaved people on the island\u2019s sugar plantations. The dense cluster on steps 4–7 is its signature. Bomba is a dialogue form: the lead <em>subidor</em> drum answers the dancer rather than leading her.'],
  plena: ['Puerto Rico',
    'Puerto Rican plena — the \u201csung newspaper\u201d, a topical narrative song form from early twentieth-century Ponce, played on hand-held <em>pandero</em> frame drums.'],
  cumbiaClave: ['Colombia',
    'The key pattern of Colombian cumbia, a coastal form braiding Indigenous gaita flutes, African drumming and European song into one of Latin America\u2019s most exported rhythms.'],
  bossa: ['Brazil',
    'The bossa nova clave, from the Rio de Janeiro of the late 1950s — in essence João Gilberto\u2019s guitar reduction of samba. Its five strokes sit as evenly as sixteen steps allow: the pattern usually cited as the Euclidean rhythm E(5,16). Note that Coypu\u2019s own <code>#(5 16) euclidean</code> uses a Bresenham variant yielding a rotation of this rather than the bossa pattern itself — use <code>bossa</code> when you want the clave.'],
  shiko: ['West Africa',
    'A bell timeline from West African practice, carried into Caribbean music. Like all timelines its job is to stay invariant: drummers, dancers and singers orient to it, and it does not change with the section.'],
  gahu: ['Ewe · Ghana, Togo, Benin',
    'From the Ewe <em>gahu</em>, a twentieth-century recreational dance said to have been carried home by Ewe traders returning from Nigeria.'],
  soukous: ['Congo',
    'The pattern behind Congolese soukous — the guitar-led dance music that grew out of Cuban records re-imported to Kinshasa and Brazzaville in the 1940s and 50s, then swept the continent. The paired strokes give it a forward lurch.'],
  adowa: ['Ashanti · Ghana',
    'Ashanti funeral and ceremonial music from Ghana, played on <em>atumpan</em> talking drums with a bell. Coypu\u2019s pattern is back-weighted — its strokes fall at the end of the cycle, pulling toward the downbeat that follows.'],
  sikyi: ['Ashanti · Ghana',
    'An Ashanti recreational dance, lighter in function than adowa. Note that in the current Coypu source <code>sikyi</code> and <code>adowa</code> carry an identical pattern, so the two selectors sound the same — the distinction is documentary rather than rhythmic.'],
  bembe: ['Yoruba · Afro-Cuban',
    'In Afro-Cuban practice <em>bembé</em> names a Yoruba-derived ceremonial music whose bell pattern is normally a seven-stroke timeline in twelve pulses. Coypu implements Godfried Toussaint\u2019s sixteen-pulse reinterpretation, which keeps the syncopation while fitting a binary grid. It is an adaptation, not the ternary original — and it is exactly what <code>#(6 16) euclidean</code> produces, so the Euclidean claim is verifiable rather than decorative.'],
  aksak: ['Balkans · Anatolia',
    '<em>Aksak</em> is Turkish for \u201climping\u201d — the family of Balkan and Anatolian metres that group pulses in uneven twos and threes rather than evenly. Coypu\u2019s source calls this one a <em>pseudo</em> aksak: a ten-pulse approximation of the feel.'],
  trueAksak: ['Balkans · Anatolia',
    'A genuine additive metre in thirteen pulses rather than an approximation — and unplayable on any grid that assumes powers of two. This is the pattern to reach for when you want the real asymmetric lilt.'],
  jungleKick: ['UK Jungle',
    'Jungle emerged in early-1990s London out of hardcore rave: heavily resequenced breakbeats — above all the Amen break — over slow, dub-derived basslines. The kick is sparse because the break carries the motion.'],
  jungleSnare: ['UK Jungle',
    'The displaced backbeat that gives jungle its lurching half-time feel against a doubled tempo.'],
  jungleRim: ['UK Jungle',
    'The busiest of the three jungle patterns, its strokes clustered in the second half of the cycle. Use it for ghost notes and rim work underneath the kick and snare.'],
  downbeats: ['Metric',
    'Four-to-the-floor. <code>16 downbeats</code> gives four evenly spaced hits across sixteen steps — the foundation of house, techno and disco.'],
  upbeats: ['Metric',
    'The complement of <code>downbeats</code>. Layer the two for the classic kick-and-offbeat-hat pairing.'],
  quavers: ['Metric', 'Eighth notes.'],
  semiquavers: ['Metric', 'Sixteenth notes — a trigger on every step. Identical in output to <code>trigs</code>.'],
  trigs: ['Metric',
    'Every pulse triggered. Identical to <code>semiquavers</code>; both names exist for readability — <code>trigs</code> when you mean \u201cfire constantly\u201d, <code>semiquavers</code> when you mean a note value.'],
  rests: ['Metric',
    'No triggers at all. Use it to hold a slot in the Performance silently, or as a blank you fill in later.'],
  wholes: ['Metric', 'One trigger per bar, with a 16-step duration — a whole note that lasts its bar.'],
  semibreves: ['Metric',
    'A semibreve <em>is</em> a whole note, but in Coypu the two are not identical: both fire once per sixteen steps, yet <code>semibreves</code> sets a 32-step duration and a 0.9 gate time while <code>wholes</code> sets 16. For a note that lasts exactly its bar, use <code>wholes</code>.'],
  breves: ['Metric', 'A breve — double the whole note. One trigger per 32 steps, with a 32-step duration and a 0.8 gate time.'],
  randomTrigs: ['Generative',
    'A fresh random pattern of ones and zeros on every evaluation, at roughly even density. <code>16 randomTrigs to: #hh</code> is the quickest way to get something moving.'],
  'randomTrigsWithProbability:': ['Generative',
    'As <code>randomTrigs</code>, but you set the density. <code>16 randomTrigsWithProbability: 30</code> fires on roughly 30% of steps; low values give sparse, spacious patterns, high values approach <code>trigs</code>.'],
};

const REGIONS = [
  ['caribbean', 'Cuba &amp; the Caribbean', '🌴',
   ['tresillo', 'claveSon', 'rumba', 'tumbao', 'banda', 'bomba', 'plena'],
   'The clave family and its relatives. These are <em>timelines</em>: unvarying reference patterns that the rest of an ensemble orients to, rather than parts that develop.'],
  ['southamerica', 'South America', '🇧🇷',
   ['bossa', 'cumbiaClave'],
   'Two key patterns from the Atlantic coast of South America, both descended from the same Afro-Atlantic timeline tradition as the Cuban claves.'],
  ['africa', 'West &amp; Central Africa', '🥁',
   ['shiko', 'gahu', 'soukous', 'adowa', 'sikyi', 'bembe'],
   'Bell and drum timelines from the traditions the Caribbean patterns descend from — plus one twentieth-century popular form, soukous, that travelled back across the Atlantic in the other direction.'],
  ['balkans', 'Balkans &amp; Anatolia', '🪗',
   ['aksak', 'trueAksak'],
   'Additive metres, which group pulses unevenly instead of subdividing a bar evenly. Neither fits a sixteen-step grid, which is the point of them.'],
  ['electronic', 'Electronic', '🎛',
   ['jungleKick', 'jungleSnare', 'jungleRim'],
   'Three parts of one jungle kit, all thirty-two steps long. Route them to separate instruments and run them together.'],
  ['metric', 'Metric &amp; Utility', '📐',
   ['downbeats', 'upbeats', 'quavers', 'semiquavers', 'trigs', 'rests', 'wholes', 'semibreves', 'breves'],
   'Not world rhythms but note values and grid divisions — and in practice the ones you will reach for most. Their patterns scale with the receiver, so the visualisations below are shown at 16 steps.'],
  ['generative', 'Generative', '🎲',
   ['randomTrigs', 'randomTrigsWithProbability:'],
   'Patterns that differ every time you evaluate them. There is no fixed visualisation because there is no fixed pattern.'],
];

// ------------------------------------------------------------------ render

function visualise(bits) {
  if (!bits) return '<div class="step-vis step-vis-none">pattern differs on every evaluation</div>';
  let h = '<div class="step-vis">';
  for (let i = 0; i < bits.length; i++) {
    if (i > 0 && i % 4 === 0) h += '<div class="beat-sep"></div>';
    h += `<div class="s${bits[i] === '1' ? ' on' : ''}"></div>`;
  }
  return h + '</div>';
}

let toc = '', body = '', n = 0, documented = 0;
const seen = new Set();

for (const [id, title, flag, members, blurb] of REGIONS) {
  n++;
  toc += `        <li><a href="#${id}">${title}</a></li>\n`;
  body += `\n    <section id="${id}">\n      <h2>${n}. ${flag} ${title} <span class="fam-count">${members.length}</span></h2>\n      <p>${blurb}</p>\n\n      <div class="rhythm-grid">\n`;

  for (const sel of members) {
    if (!src[sel]) { console.warn(`  !! ${sel} has no <rhythmCreation> in source — skipped`); continue; }
    seen.add(sel); documented++;

    const bits = expand(sel);
    const [origin, prose] = NOTES[sel] || ['', ''];
    const steps = bits ? bits.length : null;
    const on = onsets(bits);
    const grp = bits ? grouping(bits) : null;
    const callName = sel.endsWith(':') ? sel.slice(0, -1) : sel;
    const example = sel.endsWith(':')
      ? `<span>16</span> ${callName}: 30 to: #hh.`
      : `<span>${steps && steps > 16 ? steps : 16}</span> ${sel} to: #perc.`;

    const facts = [];
    if (steps) facts.push(`${steps} steps`);
    if (on.length) facts.push(`onsets ${on.join(', ')}`);
    if (grp) facts.push(`grouping ${grp}`);
    if (COMPUTED[sel] && COMPUTED[sel].rule) facts.push(COMPUTED[sel].rule);

    const variant = noteVariants.has(callName)
      ? (brokenVariants.has(callName)
          ? `<span class="variant broken" title="raises doesNotUnderstand — see Troubleshooting">${callName}: \u2014 broken</span>`
          : `<span class="variant">${callName}: '\u2026notes\u2026'</span>`)
      : '';

    const search = `${sel} ${origin} ${prose}`.replace(/<[^>]*>/g, '').toLowerCase();

    body +=
`        <div class="rhythm-card" data-name="${esc(sel)}" data-search="${esc(search)}">
          <div class="rhythm-card-top">
            <span class="rhythm-name">#${esc(sel)}</span>
            <span class="rhythm-origin">${origin}</span>
          </div>
          <p class="rhythm-desc">${prose}</p>
          ${visualise(bits)}
          <p class="rhythm-facts">${facts.join(' · ')}</p>
          <div class="rhythm-code">${example}</div>
          ${variant}
        </div>
`;
  }
  body += '      </div>\n    </section>\n';
}

const missing = Object.keys(src).filter(s => !seen.has(s));
const nextN = n + 1, tsN = n + 2;

// ------------------------------------------------------------------ page

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coypu — Rhythm Library</title>
  <link rel="stylesheet" href="coypu-shared.css">
  <${''}script>if (localStorage.getItem('coypu-theme') === 'dark') document.documentElement.classList.add('dark');<${''}/script>
  <style>
    .fam-count { font-size: .62rem; font-weight: 600; letter-spacing: .06em; background: var(--sage-pale);
                 color: var(--sage); padding: .12em .5em; border-radius: 3px; vertical-align: middle; margin-left: .5rem; }
    .rhythm-filter { position: sticky; top: 0; z-index: 5; background: var(--white);
                     padding: .8rem 0 .9rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border); }
    .rhythm-filter input { width: 100%; font-family: var(--sans); font-size: .95rem; padding: .6rem .9rem;
                           border: 1px solid var(--border); border-radius: var(--radius);
                           background: var(--white); color: var(--text); }
    .rhythm-filter input:focus { outline: 2px solid var(--sage-pale); outline-offset: -2px; }
    .filter-count { font-size: .75rem; color: var(--muted); margin-top: .4rem; display: block; }

    .rhythm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
    .rhythm-card { border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem 1.1rem;
                   transition: border-color .15s, box-shadow .15s; background: var(--white); }
    .rhythm-card:hover { border-color: var(--sage); box-shadow: 0 2px 12px rgba(78,124,95,.12); }
    .rhythm-card-top { display: flex; justify-content: space-between; align-items: baseline; gap: .6rem; margin-bottom: .4rem; }
    .rhythm-name { font-family: var(--mono); font-size: .95rem; font-weight: 600; color: var(--sage); }
    .rhythm-origin { font-size: .68rem; text-transform: uppercase; letter-spacing: .05em;
                     color: var(--muted); text-align: right; white-space: nowrap; }
    .rhythm-desc { font-size: .85rem; line-height: 1.6; margin-bottom: .7rem; color: var(--text); }

    .step-vis { display: flex; gap: 2px; align-items: center; margin: .6rem 0 .45rem;
                flex-wrap: nowrap; overflow-x: auto; padding-bottom: .2rem; }
    .step-vis .s { width: 11px; height: 20px; flex: 0 0 11px; border-radius: 2px;
                   background: var(--sage-pale); border: 1px solid var(--border); }
    .step-vis .s.on { background: var(--sage); border-color: var(--sage); }
    .step-vis .beat-sep { width: 4px; flex: 0 0 4px; }
    .step-vis-none { font-size: .78rem; color: var(--muted); font-style: italic; }

    .rhythm-facts { font-family: var(--mono); font-size: .7rem; color: var(--muted); margin-bottom: .6rem; }
    .rhythm-code { font-family: var(--mono); font-size: .8rem; background: var(--code-bg);
                   color: #c8e6cf; padding: .5rem .7rem; border-radius: var(--radius); }
    .rhythm-code span { color: var(--sage-light); }
    .variant { display: inline-block; margin-top: .5rem; font-family: var(--mono); font-size: .7rem;
               color: var(--muted); border: 1px dashed var(--border); border-radius: 3px; padding: .12em .45em; }
    .variant.broken { color: #a05500; border-color: #e0a060; border-style: solid; }
    .filtered-out { display: none; }
  </style>
</head>
<body data-page="rhythm-library.html">

<nav class="sidebar" id="coypu-sidebar"><!-- injected by coypu-nav.js --></nav>

<div class="main">
  <div class="page-header">
    <div class="breadcrumb"><a href="index.html">Coypu</a> › Reference › Rhythm Library</div>
    <h1>Rhythm Library</h1>
  </div>

  <div class="content">

    <p class="lede">
      Every rhythm Coypu can generate — ${documented} of them — with the step pattern, onset positions
      and grouping read straight from the package source, and notes on where each one comes from.
    </p>

    <div class="rhythm-filter">
      <input type="text" id="rhythmFilter" placeholder="Filter by name, region or description…" aria-label="Filter rhythms">
      <span class="filter-count" id="rhythmCount"></span>
    </div>

    <nav class="page-toc">
      <h2>Contents</h2>
      <ol>
${toc}        <li><a href="#reading">How to read these patterns</a></li>
        <li><a href="#next-steps">Where to go next</a></li>
        <li><a href="#troubleshooting">Troubleshooting</a></li>
      </ol>
    </nav>

    <div class="callout tip">
      <span class="callout-title">Looking for the long version?</span>
      This page is the quick reference. <a href="rhythms-explained.html">The Rhythms Explained</a>
      covers the same patterns at length — where each one comes from, how the clave family derives
      from a single cell, and how to combine them.
    </div>

    <div class="callout note">
      <span class="callout-title">Patterns are generated, not transcribed</span>
      Every step visualisation, onset list and grouping on this page is computed from the Coypu
      source by <code>_tools/generate-rhythm-library.cjs</code>. If a pattern here disagrees with
      what you hear, the source has changed and the page needs regenerating — the two cannot drift
      silently.
    </div>
${body}
    <section id="reading">
      <h2>${nextN - 1}. How to read these patterns</h2>

      <p>
        Each card shows the rhythm as a row of steps: a filled cell is a trigger, an empty one a
        rest, with a small gap every four steps to mark the beat. Underneath, three facts computed
        from the pattern itself.
      </p>

      <div class="param-table-wrap">
      <table class="param-table">
        <thead><tr><th>Fact</th><th>Meaning</th></tr></thead>
        <tbody>
          <tr><td>steps</td><td>The length of the underlying pattern. Multiply by this number, not by 16 — <code>13 trueAksak</code> and <code>26 trueAksak</code> are right, <code>16 trueAksak</code> truncates mid-cycle.</td></tr>
          <tr><td>onsets</td><td>Which steps carry a trigger, counting from 1.</td></tr>
          <tr><td>grouping</td><td>The gaps between successive onsets, wrapping round the cycle. This is the number that tells you what a rhythm actually <em>feels</em> like — tresillo\u2019s 3+3+2 is the whole of its character.</td></tr>
        </tbody>
      </table>
      </div>

      <p>
        A dashed tag under a card means the rhythm also accepts a note string, so you can give it
        pitches as well as a rhythm:
      </p>

<pre><code><span class="num">16</span> claveSon: <span class="str">'36 38 42 46'</span> to: #perc.</code></pre>

      <p>
        Not every rhythm has that variant. Those that do are tagged; the rest take the plain form and
        you add notes separately with <code>notes:</code>.
      </p>
    </section>

    <section id="next-steps" class="next-steps">
      <h2>${nextN}. Where to go next</h2>
      <table>
        <thead><tr><th>Document</th><th>What it covers</th></tr></thead>
        <tbody>
          <tr><td><a href="rhythms-explained.html">The Rhythms Explained</a></td><td>The long version: origins, structure, and how to combine them.</td></tr>
          <tr><td><a href="rhythms-basics.html">Rhythms: Basics</a></td><td>How to build and route a rhythm in the first place.</td></tr>
          <tr><td><a href="rhythms-advanced.html">Rhythms: Advanced</a></td><td>Euclidean patterns, offsets and polymetre — generating rhythms rather than recalling them.</td></tr>
          <tr><td><a href="performing.html">Performing</a></td><td>Running several of them at once, and changing them live.</td></tr>
        </tbody>
      </table>
    </section>

    <section id="troubleshooting" class="troubleshooting">
      <h2>${tsN}. Troubleshooting</h2>

      <h4><code>16 bomba: '36 38'</code> raises doesNotUnderstand</h4>
      <p>
        A bug in the Coypu source: <code>Integer&gt;&gt;bomba:</code> never assigns its
        <code>pattern</code> variable, so it is nil when the method reads
        <code>pattern size</code>. The plain <code>16 bomba</code> works fine — add notes separately
        with <code>notes:</code> until it is fixed.
      </p>

      <h4>A rhythm sounds truncated or lurches at the loop point</h4>
      <p>
        The receiver is not a multiple of the pattern length. <code>trueAksak</code> is 13 steps and
        <code>aksak</code> is 10, so neither divides 16. Use <code>13 trueAksak</code>,
        <code>26 trueAksak</code>, <code>10 aksak</code> and so on.
      </p>

      <h4><code>adowa</code> and <code>sikyi</code> sound identical</h4>
      <p>They are. Both carry the same eight-step pattern in the current source — see their cards above.</p>

      <h4>A jungle pattern does not line up with my other parts</h4>
      <p>
        All three are 32 steps, not 16. Give them a multiple of 32, and give anything running
        alongside them a length that divides into it.
      </p>

      <h4>I cannot find a rhythm I am sure exists</h4>
      <p>
        Clear the filter — it hides whole regions. Beyond these ${documented}, rhythms can also be
        <em>generated</em> rather than recalled: see Euclidean patterns and hex beats in
        <a href="rhythms-advanced.html">Rhythms: Advanced</a>.
      </p>

      <h4>How do I list the rhythms from inside the image?</h4>
      <p>
        <code>Rhythm list</code> returns a Dictionary of every selector carrying the
        <code>&lt;rhythmCreation&gt;</code> pragma, together with its comment. That pragma is also
        what this page is generated from.
      </p>
    </section>

    <footer class="page-nav" id="coypu-page-nav"><!-- injected --></footer>
    <p class="edit-link"><!-- injected --></p>

  </div>
</div>

<${''}script src="coypu-nav.js"><${''}/script>
<${''}script src="sidebar-toggle.js"><${''}/script>
<${''}script>
(function () {
  var input = document.getElementById("rhythmFilter");
  var count = document.getElementById("rhythmCount");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".rhythm-card"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]")).filter(function (s) {
    return s.querySelector(".rhythm-card");
  });
  var total = cards.length;

  function apply() {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (c) {
      var hit = !q || c.getAttribute("data-search").indexOf(q) !== -1;
      c.classList.toggle("filtered-out", !hit);
      if (hit) shown++;
    });
    sections.forEach(function (s) {
      var any = Array.prototype.slice.call(s.querySelectorAll(".rhythm-card")).some(function (c) {
        return !c.classList.contains("filtered-out");
      });
      s.classList.toggle("filtered-out", !any);
    });
    count.textContent = q ? shown + " of " + total + " rhythms" : total + " rhythms";
  }

  input.addEventListener("input", apply);
  apply();
})();
<${''}/script>
</body>
</html>
`;

fs.writeFileSync(out, page);
console.log(`wrote ${path.relative(process.cwd(), out)}`);

// ---------------------------------------------------------- shared data file
// Emitted so other pages can draw TUBS notation from the same source-derived
// patterns. Nothing should ever hand-write a rhythm's steps into a page.

const dataOut = path.join(__dirname, '..', 'coypuFloss', 'coypu-rhythms.js');
const data = {};
for (const sel of Object.keys(src)) {
  const bits = expand(sel);
  data[sel] = {
    bits: bits || null,
    steps: bits ? bits.length : null,
    onsets: onsets(bits),
    grouping: bits ? grouping(bits) : null,
    rule: (COMPUTED[sel] && COMPUTED[sel].rule) || null,
    origin: (NOTES[sel] && NOTES[sel][0]) || '',
    noteVariant: noteVariants.has(sel.endsWith(':') ? sel.slice(0, -1) : sel),
  };
}

fs.writeFileSync(dataOut,
  '/* GENERATED by _tools/generate-rhythm-library.cjs — do not edit.\n' +
  '   Every Coypu rhythm, derived from the package source. Consumed by\n' +
  '   coypu-tubs.js to draw Time Unit Box System notation. */\n\n' +
  'const COYPU_RHYTHMS = ' + JSON.stringify(data, null, 1) + ';\n');

console.log(`wrote ${path.relative(process.cwd(), dataOut)}`);
console.log(`${documented} rhythms documented in ${n} regions (source has ${Object.keys(src).length})`);
if (missing.length) console.log(`NOT DOCUMENTED — add to REGIONS: ${missing.join(' ')}`);
if (brokenVariants.size) console.log(`broken note-variants in source: ${[...brokenVariants].join(' ')}`);
