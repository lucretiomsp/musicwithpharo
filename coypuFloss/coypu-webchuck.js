/* Audio preview for the Rhythm Library, via WebChucK.
 *
 * Patterns are NEVER written here. Every step pattern is read at play time from
 * COYPU_RHYTHMS in coypu-rhythms.js, which the generator derives from the Coypu
 * package source — so a rhythm cannot drift between what the page draws, what
 * the page plays and what the package does. This file only needs a rhythm's
 * NAME, which it takes from the card's data-name attribute.
 *
 * Load order: coypu-rhythms.js must come first.
 *
 * Everything degrades quietly. If the CDN, the WASM or the AudioContext fails,
 * the buttons disable themselves and the page is otherwise untouched.
 */
(function () {
  'use strict';

  // WebChucK's module comes from jsDelivr, but Chuck.init() then fetches
  // webchuck.js and webchuck.wasm from chuck.stanford.edu — a second origin,
  // and a ~5 MB download. Both have to be reachable for audio to work.
  var WEBCHUCK_ESM = 'https://cdn.jsdelivr.net/npm/webchuck@1.2.11/+esm';
  var INIT_TIMEOUT_MS = 20000;

  // The longest rhythm in the library is 32 steps (the jungle patterns). The
  // ChucK array is declared at exactly that length and we always send exactly
  // that many values, zero-padded, so we never depend on what setIntArray does
  // with a length mismatch — which is undocumented.
  var MAX_STEPS = 32;

  var SHRED_CODE = [
    'global int PATTERN[' + MAX_STEPS + '];',
    'global int STEPS;',
    'global float BPM;',
    'global float NOTE;',
    'global int PLAYING;',
    '',
    '16 => STEPS;',
    '120.0 => BPM;',
    '523.25 => NOTE;',
    '0 => PLAYING;',
    '',
    'TubeBell bell => NRev rev => dac;',
    '0.08 => rev.mix;',
    '0.5 => bell.gain;',
    '',
    '0 => int i;',
    '',
    'while( true )',
    '{',
    '    // re-read the tempo every step, so it can be changed while playing',
    '    (60.0 / BPM * 0.25)::second => dur step;',
    '',
    '    if( PLAYING != 0 && STEPS > 0 )',
    '    {',
    '        i % STEPS => int idx;',
    '        if( PATTERN[idx] != 0 )',
    '        {',
    '            NOTE => bell.freq;',
    '            0.8 => bell.noteOn;',
    '        }',
    '        i + 1 => i;',
    '    }',
    '    else',
    '    {',
    '        0 => i;   // always restart a pattern from its first step',
    '    }',
    '',
    '    step => now;',
    '}'
  ].join('\n');

  var theChuck = null;
  var initPromise = null;
  var failed = false;

  function withTimeout(promise, ms, message) {
    return Promise.race([
      promise,
      new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error(message)); }, ms);
      })
    ]);
  }

  /* Creates the ChucK instance and starts the one shred that plays everything.
     Called on the first Play press — browsers refuse audio before a gesture. */
  function initChuck() {
    if (initPromise) return initPromise;

    initPromise = (function () {
      var Chuck;
      // A static import cannot be caught, so the CDN is loaded dynamically.
      return import(WEBCHUCK_ESM)
        .then(function (mod) {
          Chuck = mod.Chuck;
          // No AudioContext is passed, so init() creates one AND connects the
          // node to its destination itself. Calling connect() here as well
          // would route the node twice and double the gain.
          return withTimeout(Chuck.init([]), INIT_TIMEOUT_MS,
            'timed out loading webchuck.wasm');
        })
        .then(function (ck) {
          theChuck = ck;
          if (ck.context.state === 'suspended') return ck.context.resume().then(function () { return ck; });
          return ck;
        })
        .then(function (ck) {
          // Await the shred: the globals do not exist until it has compiled,
          // and a write that lands first is only retried on a best-effort basis.
          return ck.runCode(SHRED_CODE).then(function () { return ck; });
        })
        .catch(function (err) {
          failed = true;
          theChuck = null;
          console.warn('[coypu] rhythm preview unavailable:', err && err.message ? err.message : err);
          throw err;
        });
    })();

    return initPromise;
  }

  /* Looks a rhythm up by name in the generated data and starts it. */
  function playRhythm(name) {
    var rhythm = (typeof COYPU_RHYTHMS !== 'undefined') && COYPU_RHYTHMS[name];
    if (!rhythm || !rhythm.bits) return Promise.reject(new Error('no pattern for ' + name));

    var bits = rhythm.bits;
    var steps = Math.min(bits.length, MAX_STEPS);

    return initChuck().then(function (ck) {
      var values = new Array(MAX_STEPS);
      for (var i = 0; i < MAX_STEPS; i++) {
        values[i] = (i < steps && bits.charAt(i) === '1') ? 1 : 0;
      }
      ck.setIntArray('PATTERN', values);
      ck.setInt('STEPS', steps);
      ck.setInt('PLAYING', 1);
      return ck;
    });
  }

  function stopRhythm() {
    if (theChuck) theChuck.setInt('PLAYING', 0);
  }

  function setBPM(bpm) {
    if (theChuck) theChuck.setFloat('BPM', bpm);
  }

  function setNote(hz) {
    if (theChuck) theChuck.setFloat('NOTE', hz);
  }

  // ------------------------------------------------------------------ buttons

  var PLAY_GLYPH = '\u25B6';
  var STOP_GLYPH = '\u25A0';
  var activeBtn = null;

  function reset(btn) {
    btn.textContent = PLAY_GLYPH;
    btn.classList.remove('playing', 'loading');
    btn.setAttribute('aria-pressed', 'false');
  }

  function disableAll(message) {
    var btns = document.querySelectorAll('.rhythm-play-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
      btns[i].title = message;
      reset(btns[i]);
    }
  }

  function toggle(btn) {
    var card = btn.closest('.rhythm-card');
    if (!card) return;
    var name = card.getAttribute('data-name');

    if (activeBtn === btn) {
      stopRhythm();
      reset(btn);
      activeBtn = null;
      return;
    }

    if (activeBtn) reset(activeBtn);

    btn.classList.add('loading');
    activeBtn = btn;

    playRhythm(name).then(function () {
      if (activeBtn !== btn) return;      // pressed something else while loading
      btn.textContent = STOP_GLYPH;
      btn.classList.remove('loading');
      btn.classList.add('playing');
      btn.setAttribute('aria-pressed', 'true');
    }).catch(function () {
      if (activeBtn === btn) activeBtn = null;
      reset(btn);
      if (failed) disableAll('Audio preview unavailable — WebChucK could not be loaded.');
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.rhythm-play-btn');
    if (btn && !btn.disabled) toggle(btn);
  });

  window.coypuAudio = {
    initChuck: initChuck,
    playRhythm: playRhythm,
    stopRhythm: stopRhythm,
    setBPM: setBPM,
    setNote: setNote
  };
})();
