---
layout: docuMain
title: "Music with Pharo"
---

Welcome to the Music with Pharo documentation. Three packages for live coding, DSP programming, and MIDI — all running inside Pharo.

## Packages

- **[Coypu](coypu.html)** — Live-coding client; connects to SuperCollider/SuperDirt, Kyma, PureData, Phausto, and MIDI
- **[Phausto](phausto.html)** — Embedded Faust DSP engine for Pharo; CoreAudio driver; CMajor/Bela exporters
- **[Pharo-Sound](pharosound.html)** — MIDI send/receive via PortMidi (uFFI)

All three packages target Pharo 11–13.

## Installation

Two ways to get started:

<div class="install-grid">
  <div class="install-card">
    <div class="card-label">Option 1</div>
    <h3>Music Image</h3>
    <p>A ready-to-use Pharo image with all packages pre-installed. Available in the <strong>Pharo Launcher</strong> under <em>Templates</em>. Recommended for beginners.</p>
  </div>

  <section class="install-section">
  <h2>Install via Pharo Launcher</h2>
  <p>Download <a href="https://pharo.org/download">Pharo Launcher</a>, then:</p>
  <ol>
    <li>Click <strong>New</strong> → select category <strong>Pharo-Music distributions</strong></li>
    <li>Choose <strong>Pharo Music (demo)</strong> from the template list</li>
    <li>Click <strong>Create image</strong></li>
    <li>Double-click the new image to launch it</li>
  </ol>
  <img src="/musicwithpharo/assets/img/musicImgLaunchTemp.png" alt="Pharo Launcher – selecting Pharo Music demo template" class="launcher-screenshot">
</section>


  <div class="install-card">
    <div class="card-label">Option 2</div>
    <h3>Metacello</h3>
    <p>Install individual packages into any Pharo 11–13 image via Metacello. Useful if you already have a working environment and want to add only what you need.</p>
  </div>
</div>

For Metacello snippets and dependency details, see each package's reference page.
