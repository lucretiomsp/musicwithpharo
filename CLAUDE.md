# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Jekyll-based GitHub Pages site serving as the community hub for Pharo audio programming. It documents three external Pharo packages — **Coypu**, **Phausto**, and **Pharo-Sound** — and hosts a blog about their development.

Live site: lucretiomsp.github.io/musicwithpharo

## Local Development

```bash
jekyll serve
# Visit http://localhost:4000
```

No Gemfile or package.json — GitHub Pages handles Jekyll and the minima theme automatically. No test suite or linter.

## Architecture

**Content** lives in four places:
- `_posts/` — blog posts (YYYY-MM-DD-title.md, Jekyll front matter required)
- `documentation/` — per-package reference pages (coypu.md, phausto.md, pharosound.md)
- `index.md` — landing page (uses `home2` layout)
- `phaustoFloss/`, `coypuFloss/` — the two FLOSS manuals (see below)

**Layouts** (`_layouts/`) control page structure:
- `home2.html` — landing page with navigation and blog roll
- `mypost.html` — blog post template
- `docuMain.html` — documentation page template

**Styling**: `home2.css` (custom gradients, typography on top of minima theme)

**Interactive element**: `sketch.js` (p5.js waveform animation on the homepage — purely decorative)

**Site config**: `_config.yml` (title, theme, author metadata, markdown processor)

## The FLOSS Manuals

`phaustoFloss/` and `coypuFloss/` are standalone HTML manuals — **not** Jekyll pages. No front
matter, no layout; they link their own stylesheet and are served as-is. `documentation/phausto.md`
and `documentation/coypu.md` link into them.

Both follow the same conventions. `phaustoFloss/` has 27 pages, `coypuFloss/` has 17; each has its
own nav file (`phausto-nav.js`, `coypu-nav.js`), its own palette in its shared stylesheet, and its
own theme key (`phausto-theme`, `coypu-theme`). The conventions:

- **`phausto-nav.js` is the single source of truth.** One ordered `PHAUSTO_PAGES` array drives the
  sidebar, quick links, prev/next footer, ⌘K search index and the index card grid. Adding a page is
  a one-line edit there. **Never hand-write navigation into a page** — it is injected into
  `#phausto-sidebar`, `#phausto-page-nav` and `.edit-link`.
- **Page skeleton**: `<body data-page="<filename>.html">`, a `.lede` sentence, a `.page-toc`
  numbered contents block (max two levels), numbered `<section>`s whose `id`s are **semantic slugs,
  not numbers**, so sections can be renumbered without breaking links. Cross-references use `§`.
- Every page ends with a `.next-steps` table and a `.troubleshooting` section whose `<h4>`s are
  phrased as the *symptom* the reader is experiencing.
- `sidebar-toggle.js` injects the mobile hamburger and overlay; it must load **after**
  `phausto-nav.js`, which builds the sidebar it operates on.
- `phausto-shared.css` holds the palette as custom properties. The dark theme (`html.dark`, stored
  under `phausto-theme`) is a pure custom-property swap — add new rules, do not restructure old ones.

**Two pages are generated, not hand-written.** Regenerate after any package change; editing them by
hand will be overwritten.

```bash
node _tools/generate-ugen-library.cjs   <path-to-Phausto-source-dir>
node _tools/generate-rhythm-library.cjs <path-to-Coypu-src-dir>
```

- `phaustoFloss/ugen-library.html` — every class with its superclass and the first sentence of its
  class comment. Tests, Cmajor exporters and the FFI layer are excluded by design.
- `coypuFloss/rhythm-library.html` — every `<rhythmCreation>` rhythm, with step pattern, onsets and
  grouping **computed from source**. The prose (origins, ethnomusicological notes) is curated in
  `NOTES` inside the generator; `REGIONS` groups them, and the script warns about any rhythm not
  placed in a region.
- `coypuFloss/coypu-rhythms.js` — emitted by the same run: the pattern data as a plain object, so
  other pages can draw rhythms without restating them. **No page should ever hand-write a rhythm's
  steps**; that is what lets the manual and the package stay in step.

`coypuFloss/coypu-tubs.js` renders TUBS (Time Unit Box System) notation from that data wherever a
page contains `<div class="tubs" data-rhythm="NAME"></div>` — used throughout
`rhythms-explained.html`. Group separators fall every 4 pulses for binary patterns and **at the
onsets** for additive metres, so `trueAksak`'s 2+2+2+3+2+2 is visible rather than merely stated.
Load order matters: `coypu-rhythms.js` before `coypu-tubs.js`.

**Accuracy rule**: verify class and selector names against the package source before documenting
them. Invented UGens and hallucinated rhythms have both happened. Get canonical source from GitHub
rather than a local Iceberg checkout — every on-disk Coypu checkout was found to be months stale.

Traps that have caused real errors:

| Where | Trap |
|---|---|
| Phausto | Most classes carry a `Ph` prefix (`PhImpulsify`, `PhModeFilter`, `PhFlangerMono`) |
| Phausto | The fluid setter API lives in **22 traits**, not on the classes — `SineOsc` defines only `initialize`. `dsp traceAllParams` is ground truth |
| Coypu | Branch is `master` (Phausto is `main`) |
| Coypu | Rhythm receivers are **step counts, not trigger counts** — `8 quavers` gives 4 triggers |
| Coypu | `#(5 16) euclidean` is *not* cinquillo and *not* bossa; Coypu uses Bresenham, not Bjorklund. `#(3 8)`=tresillo and `#(6 16)`=bembe are exact |
| Coypu | `Performance>>unmute:`/`unsolo:` discard their argument and restore the whole snapshot |
| Coypu | `Integer>>bomba:` never assigns its pattern and always raises |
| Coypu | `Sequencer>>squiz:` writes to the `'room'` key |
| Coypu | `asMidiNote` and `asMidiNN` disagree by an octave (`'c4'` → 60 vs 72) |

## The Three Packages Documented

| Package | Repo | Role |
|---|---|---|
| Coypu | lucretiomsp/coypu | Live-coding client; connects to SuperCollider/SuperDirt, Kyma, PD, Phausto, MIDI |
| Phausto | lucretiomsp/phausto | Embedded Faust DSP engine for Pharo; CoreAudio driver; CMajor/Bela exporters |
| Pharo-Sound | pharo-contributions/pharo-sound | MIDI send/receive via PortMidi (uFFI) |

All three require Pharo 11–13 and are installed via Metacello.

## Adding Content

- **New blog post**: create `_posts/YYYY-MM-DD-slug.md` with `layout: mypost` front matter
- **Update docs**: edit the relevant file in `documentation/`
- **New nav link**: update `_layouts/home2.html`
- **Assets** (PDFs, slides): place in `assets/`
- **New manual page**: add one line to `PHAUSTO_PAGES` in `phaustoFloss/phausto-nav.js` (or
  `COYPU_PAGES` in `coypuFloss/coypu-nav.js`), then copy the skeleton from an existing page.
  Navigation follows automatically.
- **Package changed**: rerun the matching generator in `_tools/` (see above)
