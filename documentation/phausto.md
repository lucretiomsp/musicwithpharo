---
layout: docuMain
title: "Phausto: fast and accesible DSP programming"
---
Phausto is a Pharo package and API crafted to enable fast and accessible Digital Signal Processor (DSP) design. It is powered by an embedded [Faust](https://faustdoc.grame.fr/) engine, granting users direct access to cutting-edge algorithms that researchers worldwide have implemented into the Faust standard libraries.
Thanks to its exporter methods, Phausto allows synthesisers and effect built within Pharo in a [CMajor](https://cmajor.dev/) patch or on a [Bela](https://bela.io/) board.

For the full interactive documentation, visit the [Phausto Documentation Site]({{ site.baseurl }}/phaustoFloss/index.html).

## Installation

To have Phausto working in your Pharo image, you have two options:

### Option 1 — Music Image (easiest)

Download [Pharo Launcher](https://pharo.org/download), then:

1. Click **New** → select category **Pharo-Music distributions**
2. Choose **Pharo Music (demo)** from the template list
3. Click **Create image**
4. Double-click the new image to launch it

<img src="{{ site.baseurl }}/assets/img/musicImgLaunchTemp.png" alt="Pharo Launcher – selecting Pharo Music demo template" class="launcher-screenshot">

### Option 2 — Manual install via Metacello

Load Phausto into any Pharo 11–13 image using a Playground:

```Smalltalk
Metacello new
    baseline: 'Phausto';
    repository: 'github://lucretiomsp/phausto:master';
    load
```
