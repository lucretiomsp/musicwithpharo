/* =========================================================
   COYPU DOCS — TUBS renderer
   Time Unit Box System: the standard ethnomusicological
   notation for cyclic rhythms — one box per pulse, marked
   where a stroke falls.

   Renders any <div class="tubs" data-rhythm="NAME"></div>
   from the data in coypu-rhythms.js, which is generated from
   the Coypu source. Load this AFTER coypu-rhythms.js.

   Group separators are drawn every 4 pulses for binary
   patterns, and at the onsets themselves for additive metres
   (10, 13 …), which is where the grouping actually lies.
   ========================================================= */

(function () {
  if (typeof COYPU_RHYTHMS === 'undefined') return;

  function onsetsOf(bits) {
    const o = [];
    for (let i = 0; i < bits.length; i++) if (bits[i] === '1') o.push(i + 1);
    return o;
  }

  function render(el) {
    const name = el.getAttribute('data-rhythm');
    const r = COYPU_RHYTHMS[name];

    if (!r) {
      el.innerHTML = '<p class="tubs-missing">No pattern for <code>' + name + '</code>.</p>';
      return;
    }

    // Patterns with no fixed shape (randomTrigs and friends).
    if (!r.bits) {
      el.innerHTML =
        '<figure class="tubs-fig">' +
          '<p class="tubs-none">' + (r.rule || 'differs on every evaluation') + '</p>' +
          '<figcaption><code>#' + name + '</code> — no fixed pattern to draw</figcaption>' +
        '</figure>';
      return;
    }

    const bits   = r.bits;
    const steps  = bits.length;
    const onsets = onsetsOf(bits);
    const binary = steps % 4 === 0;
    const showEveryNumber = steps <= 16;

    // Where to draw the heavier group lines.
    const breaks = new Set();
    if (binary) {
      for (let i = 4; i < steps; i += 4) breaks.add(i);
    } else {
      onsets.forEach(function (o) { if (o - 1 > 0) breaks.add(o - 1); });
    }

    let boxes = '', nums = '';
    for (let i = 0; i < steps; i++) {
      const on = bits[i] === '1';
      const cls = 'tubs-box' + (on ? ' on' : '') + (breaks.has(i) ? ' grp' : '');
      boxes += '<span class="' + cls + '" aria-hidden="true">' + (on ? '\u00d7' : '') + '</span>';
      const label = (showEveryNumber || i % 4 === 0) ? (i + 1) : '';
      nums += '<span class="tubs-num' + (breaks.has(i) ? ' grp' : '') + '">' + label + '</span>';
    }

    const facts = [
      steps + ' steps',
      onsets.length ? 'onsets ' + onsets.join(', ') : 'no onsets',
      r.grouping ? 'grouping ' + r.grouping : null,
    ].filter(Boolean).join(' \u00b7 ');

    el.innerHTML =
      '<figure class="tubs-fig">' +
        '<div class="tubs-scroll">' +
          '<div class="tubs-row" role="img" aria-label="' +
            name + ': strokes on steps ' + onsets.join(', ') + ' of ' + steps + '">' +
            boxes +
          '</div>' +
          '<div class="tubs-nums" aria-hidden="true">' + nums + '</div>' +
        '</div>' +
        '<figcaption><code>#' + name + '</code> \u2014 ' + facts + '</figcaption>' +
      '</figure>';
  }

  Array.prototype.slice
    .call(document.querySelectorAll('.tubs[data-rhythm]'))
    .forEach(render);
})();
