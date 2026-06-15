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

**Content** lives in three places:
- `_posts/` — blog posts (YYYY-MM-DD-title.md, Jekyll front matter required)
- `documentation/` — per-package reference pages (coypu.md, phausto.md, pharosound.md)
- `index.md` — landing page (uses `home2` layout)

**Layouts** (`_layouts/`) control page structure:
- `home2.html` — landing page with navigation and blog roll
- `mypost.html` — blog post template
- `docuMain.html` — documentation page template

**Styling**: `home2.css` (custom gradients, typography on top of minima theme)

**Interactive element**: `sketch.js` (p5.js waveform animation on the homepage — purely decorative)

**Site config**: `_config.yml` (title, theme, author metadata, markdown processor)

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
