#!/usr/bin/env node
/*
 * Regenerate phaustoFloss/ugen-library.html from the Phausto package source.
 *
 * The UGen Library reference is derived data: every class, its superclass and
 * its description are read out of the Tonel .class.st files rather than typed
 * by hand, so the page cannot drift from the package.
 *
 * Usage:
 *   node _tools/generate-ugen-library.cjs <path-to-Phausto-source-dir>
 *   PHAUSTO_SRC=<path> node _tools/generate-ugen-library.cjs
 *
 * <path> is the directory holding the *.class.st files, normally:
 *   <pharo-image>/pharo-local/iceberg/lucretiomsp/phausto/Phausto
 *
 * Plain Node, no dependencies. Nothing here ships to the built site: Jekyll
 * excludes underscore-prefixed directories from _site.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------- source dir

const root = process.argv[2] || process.env.PHAUSTO_SRC;

if (!root) {
  console.error(`
Missing the Phausto source directory.

  node _tools/generate-ugen-library.cjs <path-to-Phausto-source-dir>

It is the folder containing the *.class.st files, usually:
  <pharo-image>/pharo-local/iceberg/lucretiomsp/phausto/Phausto
`.trim());
  process.exit(1);
}

if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  console.error(`Not a directory: ${root}`);
  process.exit(1);
}

const sourceFiles = fs.readdirSync(root).filter(f => f.endsWith('.class.st'));

if (sourceFiles.length === 0) {
  console.error(`No .class.st files in: ${root}\nIs this the Phausto package directory?`);
  process.exit(1);
}

const out = path.join(__dirname, '..', 'phaustoFloss', 'ugen-library.html');

const esc = s => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// -------------------------------------------------------------- parse Tonel

const classes = {};

for (const f of sourceFiles) {
  const s = fs.readFileSync(path.join(root, f), 'utf8');
  const g = re => { const m = s.match(re); return m ? m[1] : null; };

  const name = g(/#name\s*:\s*'([^']+)'/);
  if (!name) continue;

  // A leading string literal, before the Class { ... } declaration, is the
  // class comment.
  const cm = s.match(/^"([\s\S]*?)"\s*Class\s*\{/);
  let desc = '';

  if (cm) {
    // Tonel escapes a double quote inside a comment by doubling it.
    const raw = cm[1].replace(/""/g, '"').replace(/```[\s\S]*?```/g, ' ');

    // Keep only the prose before any markdown heading or parameter list.
    const kept = [];
    for (const ln of raw.split(/\r?\n/)) {
      if (/^\s*#{1,6}\s*\S/.test(ln)) { if (kept.join('').trim()) break; else continue; }
      if (/^\s*[-*]\s*\*\*/.test(ln)) break;
      if (/^\s*\**\s*parameters?\s*\**\s*:/i.test(ln)) break;
      kept.push(ln);
    }

    desc = kept.join(' ').replace(/\s+/g, ' ').trim();

    // These cells are prose, not rendered markdown.
    desc = desc.replace(/\*\*/g, '').replace(/`/g, '').replace(/_([^_]{1,40})_/g, '$1');

    // First sentence only.
    const stop = desc.search(/\.(\s|$)/);
    if (stop > 0) desc = desc.slice(0, stop + 1);

    desc = desc
      .replace(/^I am an?\s+/i, '')
      .replace(/^I\s+(?=[a-z])/i, '')
      .replace(/^\**\s*/, '')
      .trim();

    if (desc) desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    if (desc.length > 190) desc = desc.slice(0, 187).replace(/\s\S*$/, '') + '\u2026';
  }

  classes[name] = {
    name,
    sup: g(/#superclass\s*:\s*'([^']+)'/),
    tag: g(/#tag\s*:\s*'([^']+)'/) || '(none)',
    desc,
  };
}

// ------------------------------------------------------------------ families
// id, heading, package tags to collect, blurb.
// Tags not listed here are deliberately omitted from the page: tests, the
// Cmajor exporters, the FFI layer, the manifest and the GUI shim.

const FAMILIES = [
  ['oscillators', 'Oscillators', ['Oscillators'],
   'Periodic signal sources: the classic four shapes, wavetable oscillators, the Casio CZ phase-distortion set, and the LFO family used for modulation.'],
  ['noises', 'Noise', ['Noises'],
   'Aperiodic sources. The starting point for percussion, wind and breath, and for any subtractive patch that needs a dense spectrum.'],
  ['envelopes', 'Envelopes', ['Envelopes'],
   'Non-periodic control shapes triggered by a gate. See the <a href="envelopes.html">Envelopes &amp; Modulation</a> guide for how the stages behave.'],
  ['filters', 'Filters', ['Filters'],
   'The largest family: virtual-analogue ladders, state-variable sections, comb and allpass filters, EQ, and the primitive one-pole and one-zero sections. See <a href="filters.html">Filters</a>.'],
  ['effects', 'Effects', ['Effects'],
   'Delays, saturation, modulation effects, wah and the seven reverbs. See <a href="effects.html">Effects, Reverbs &amp; Dynamics</a>.'],
  ['compressors', 'Dynamics', ['Compressors'],
   'Compressors, limiters, gates and expanders, plus the gain computers they are built from. The naming is systematic \u2014 see <a href="effects.html">Effects \u00a77.2</a>.'],
  ['physmodels', 'Physical Models',
   ['PhysModels', 'PhysModels - String Instruments', 'PhysModels - Wind Instruments', 'PhysModels - BiDir Utilities', 'PhysModels - Vocal Synthesis'],
   'Instruments computed from physical simulation, and the waveguide primitives they are assembled from. See <a href="physical-models.html">Physical Modelling</a>.'],
  ['synths', 'Synths', ['Synths'],
   'Complete ready-made instruments \u2014 drums and synth voices you can instantiate and play without wiring anything.'],
  ['dx7', 'Dx7 Operators', ['Dx7'],
   'DX7-style FM operators, envelopes and algorithms. See <a href="synthesis.html">Synthesis \u00a75</a>.'],
  ['basics', 'Basics', ['Basics'],
   'Small building blocks: sample-and-hold, latches, bit crushing, downsampling, lines and toggles.'],
  ['time', 'Counters &amp; Time Tools', ['Basics - Counters/TimeTools'],
   'Pulses, counters, ramps and beat clocks \u2014 time generated inside the signal graph. See <a href="sequencing.html">Sequencing \u00a72</a>.'],
  ['conversion', 'Conversion Tools', ['Basics - ConversionTools'],
   'Unit conversions as UGens: decibels, MIDI note numbers, piano keys, cents, semitones, samples and time constants. See <a href="math.html">Math &amp; Conversion Tools</a>.'],
  ['signals', 'Signals', ['Signals'],
   'Signal plumbing: buses, smoothing, reversal and interpolation.'],
  ['operations', 'Operations', ['Operations'],
   'Arithmetic and routing as objects rather than operators. See <a href="connecting.html">Connecting Unit Generators</a>.'],
  ['math', 'Math', ['Math', 'Interpolators', 'Quantizers'],
   'Mathematical functions, constants, interpolators and quantisers applied sample by sample. See <a href="math.html">Math &amp; Conversion Tools</a>.'],
  ['antialiased', 'Antialiased', ['Antialiased'],
   'Band-limited trigonometric and hyperbolic functions, for waveshaping without aliasing.'],
  ['toolkit', 'Toolkit', ['ToolKit'],
   'Higher-level utilities: sequencers, selectors, loopers, capture and routing helpers.'],
  ['ui', 'UI Primitives', ['UIPrimitives'],
   'Sliders, buttons, checkboxes and bargraphs. See <a href="ui-primitives.html">UI Primitives</a>.'],
  ['turbo', 'TurboPhausto', ['TurboPhausto'],
   'The batteries-included layer: samplers, ready-made synths and engine parts. See <a href="turbophausto.html">TurboPhausto</a>.'],
  ['demo', 'Demos', ['Demo'],
   'Ready-made FAUST demo patches, one line each. See the <a href="demos.html">Demo Gallery</a>.'],
  ['core', 'Core &amp; Infrastructure', ['UnitGenerators', 'Boxes', 'Primitives', 'Routes', 'DSP', '(none)'],
   'The base classes and low-level boxes everything else is built on. See <a href="internals.html">Architecture &amp; Internals</a>.'],
];

// -------------------------------------------------------------- build tables

const used = new Set();
let toc = '', body = '', n = 0;

for (const [id, title, tags, blurb] of FAMILIES) {
  const members = Object.values(classes)
    .filter(c => tags.includes(c.tag))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!members.length) continue;

  n++;
  members.forEach(m => used.add(m.name));
  toc += '        <li><a href="#' + id + '">' + title + '</a></li>\n';

  const rows = members.map(m =>
    '          <tr data-ugen="' + esc((m.name + ' ' + (m.sup || '') + ' ' + m.desc).toLowerCase()) + '">' +
    '<td>' + esc(m.name) + '</td>' +
    '<td>' + esc(m.sup || '\u2014') + '</td>' +
    '<td>' + (m.desc ? esc(m.desc) : '<span class="no-desc">\u2014</span>') + '</td></tr>'
  ).join('\n');

  body +=
'\n    <section id="' + id + '">\n' +
'      <h2>' + n + '. ' + title + ' <span class="fam-count">' + members.length + '</span></h2>\n' +
'      <p>' + blurb + '</p>\n' +
'      <div class="param-table-wrap">\n' +
'      <table class="param-table ugen-table">\n' +
'        <thead><tr><th>Class</th><th>Inherits from</th><th>Description</th></tr></thead>\n' +
'        <tbody>\n' + rows + '\n        </tbody>\n' +
'      </table>\n      </div>\n' +
'    </section>\n';
}

const total = used.size, nextN = n + 1, tsN = n + 2;

// ---------------------------------------------------------------- page shell

const head =
'<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'  <title>Phausto \u2014 UGen Library</title>\n' +
'  <link rel="stylesheet" href="phausto-shared.css">\n' +
'  <' + 'script>if (localStorage.getItem(\'phausto-theme\') === \'dark\') document.documentElement.classList.add(\'dark\');<' + '/script>\n' +
'  <style>\n' +
'    .fam-count { font-size: .62rem; font-weight: 600; letter-spacing: .06em; background: var(--sage-pale);\n' +
'                 color: var(--sage); padding: .12em .5em; border-radius: 3px; vertical-align: middle; margin-left: .5rem; }\n' +
'    .ugen-filter { position: sticky; top: 0; z-index: 5; background: var(--white);\n' +
'                   padding: .8rem 0 .9rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border); }\n' +
'    .ugen-filter input { width: 100%; font-family: var(--sans); font-size: .95rem; padding: .6rem .9rem;\n' +
'                         border: 1px solid var(--border); border-radius: var(--radius);\n' +
'                         background: var(--white); color: var(--text); }\n' +
'    .ugen-filter input:focus { outline: 2px solid var(--sage-pale); outline-offset: -2px; }\n' +
'    .filter-count { font-size: .75rem; color: var(--muted); margin-top: .4rem; display: block; }\n' +
'    .ugen-table td:nth-child(2) { font-family: var(--mono); font-size: .76rem; color: var(--muted); white-space: nowrap; }\n' +
'    .ugen-table td:nth-child(3) { font-size: .84rem; white-space: normal; }\n' +
'    .ugen-table td:first-child { white-space: nowrap; }\n' +
'    .no-desc { color: var(--muted); }\n' +
'    .filtered-out { display: none; }\n' +
'  </style>\n</head>\n' +
'<body data-page="ugen-library.html">\n\n' +
'<nav class="sidebar" id="phausto-sidebar"><!-- injected by phausto-nav.js --></nav>\n\n' +
'<div class="main">\n  <div class="page-header">\n' +
'    <div class="breadcrumb"><a href="index.html">Phausto</a> \u203a Reference \u203a UGen Library</div>\n' +
'    <h1>UGen Library</h1>\n  </div>\n\n  <div class="content">\n\n' +
'    <p class="lede">\n      Every Unit Generator in Phausto, grouped by family, with the class it inherits from and what it\n' +
'      does. ' + total + ' classes are catalogued here \u2014 use the filter to search them.\n    </p>\n\n' +
'    <div class="ugen-filter">\n' +
'      <input type="text" id="ugenFilter" placeholder="Filter by name, superclass or description\u2026" aria-label="Filter unit generators">\n' +
'      <span class="filter-count" id="ugenCount"></span>\n    </div>\n\n' +
'    <nav class="page-toc">\n      <h2>Contents</h2>\n      <ol>\n' + toc +
'        <li><a href="#next-steps">Where to go next</a></li>\n' +
'        <li><a href="#troubleshooting">Troubleshooting</a></li>\n      </ol>\n    </nav>\n\n' +
'    <div class="callout note">\n      <span class="callout-title">Descriptions come from the source</span>\n' +
'      Each description is the opening sentence of the class comment in the Phausto package. Where a\n' +
'      class carries no comment the cell is left blank rather than guessed at \u2014 instantiate it and call\n' +
'      <code>traceAllParams</code> to see what it exposes.\n    </div>\n';

const tail =
'\n    <section id="next-steps" class="next-steps">\n      <h2>' + nextN + '. Where to go next</h2>\n' +
'      <table>\n        <thead><tr><th>Document</th><th>What it covers</th></tr></thead>\n        <tbody>\n' +
'          <tr><td><a href="traits.html">Setter Traits</a></td><td>The selectors these classes respond to, and where they come from.</td></tr>\n' +
'          <tr><td><a href="basics.html">Unit Generators</a></td><td>What every entry in this table has in common.</td></tr>\n' +
'          <tr><td><a href="dsp-api.html">DSP &amp; Parameter API</a></td><td>What to do with a UGen once you have chosen one.</td></tr>\n' +
'          <tr><td><a href="connecting.html">Connecting UGens</a></td><td>Joining several of these into a patch.</td></tr>\n' +
'        </tbody>\n      </table>\n    </section>\n\n' +
'    <section id="troubleshooting" class="troubleshooting">\n      <h2>' + tsN + '. Troubleshooting</h2>\n\n' +
'      <h4>I cannot find a class I know exists</h4>\n' +
'      <p>\n        Clear the filter first \u2014 it hides whole families. Test classes, traits, the Cmajor exporters\n' +
'        and the FFI layer are deliberately not listed here; see\n' +
'        <a href="internals.html">Architecture &amp; Internals</a> and <a href="exporting.html">Exporting</a>.\n      </p>\n\n' +
'      <h4>The class is listed but has no description</h4>\n' +
'      <p>It carries no class comment in the package. The superclass column is usually the best clue.</p>\n\n' +
'      <h4>A class here does not understand the setter I expect</h4>\n' +
'      <p>\n        Setters arrive by trait, and not every class composes every trait. Check\n' +
'        <a href="traits.html">Setter Traits</a>, then confirm with <code>traceAllParams</code>.\n      </p>\n\n' +
'      <h4>Two classes look like they do the same thing</h4>\n' +
'      <p>\n        Usually they differ in channel count (<code>Mono</code> versus <code>Stereo</code>), in\n' +
'        detection method, or in whether they apply a gain or merely compute one. The\n' +
'        <a href="effects.html">dynamics naming guide</a> explains the pattern.\n      </p>\n    </section>\n\n' +
'    <footer class="page-nav" id="phausto-page-nav"><!-- injected --></footer>\n' +
'    <p class="edit-link"><!-- injected --></p>\n\n  </div>\n</div>\n\n' +
'<' + 'script src="phausto-nav.js"><' + '/script>\n' +
'<' + 'script src="sidebar-toggle.js"><' + '/script>\n' +
'<' + 'script>\n' +
'(function () {\n' +
'  var input = document.getElementById("ugenFilter");\n' +
'  var count = document.getElementById("ugenCount");\n' +
'  var rows = Array.prototype.slice.call(document.querySelectorAll("tr[data-ugen]"));\n' +
'  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]")).filter(function (s) {\n' +
'    return s.querySelector("tr[data-ugen]");\n  });\n' +
'  var total = rows.length;\n\n' +
'  function apply() {\n' +
'    var q = input.value.trim().toLowerCase();\n    var shown = 0;\n' +
'    rows.forEach(function (r) {\n' +
'      var hit = !q || r.getAttribute("data-ugen").indexOf(q) !== -1;\n' +
'      r.classList.toggle("filtered-out", !hit);\n      if (hit) shown++;\n    });\n' +
'    sections.forEach(function (s) {\n' +
'      var any = Array.prototype.slice.call(s.querySelectorAll("tr[data-ugen]")).some(function (r) {\n' +
'        return !r.classList.contains("filtered-out");\n      });\n' +
'      s.classList.toggle("filtered-out", !any);\n    });\n' +
'    count.textContent = q ? shown + " of " + total + " unit generators" : total + " unit generators";\n' +
'  }\n\n' +
'  input.addEventListener("input", apply);\n  apply();\n})();\n' +
'<' + '/script>\n</body>\n</html>\n';

// ----------------------------------------------------------------- write out

const page = head + body + tail;
const changed = !fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== page;

fs.writeFileSync(out, page);

console.log(`${changed ? 'updated' : 'unchanged'}: ${path.relative(process.cwd(), out)}`);
console.log(`${total} classes in ${n} families, from ${sourceFiles.length} source files`);

const skipped = Object.values(classes).filter(c => !used.has(c.name));
if (skipped.length) {
  const byTag = {};
  skipped.forEach(c => { byTag[c.tag] = (byTag[c.tag] || 0) + 1; });
  console.log('not listed (by design): ' +
    Object.entries(byTag).sort().map(e => e[0] + '=' + e[1]).join('  '));
}
