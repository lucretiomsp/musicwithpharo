---
layout: docuMain
title: "Coypu: programming music on-the-fly"
---
Coypu is a Pharo package designed for programming music on-the-fly. It serves as a client that can connect to various audio engines, including [SuperDirt](https://github.com/musikinformatik/SuperDirt)/[SuperCollider](https://supercollider.github.io/), [<u>Kyma</u>](https://kyma.symbolicsound.com/), 
[PureData](https://puredata.info/), and [Phausto](https://github.com/lucretiomsp/phausto), as well as external [MIDI](https://midi.org/) sound generators. Coypu is crafted to be user-friendly and easily extensible.

Welcome to the Coypu wiki! For the full interactive documentation, visit the **[Coypu Documentation Site]({{ site.baseurl }}/coypuFloss/index.html)**.

## Installation

To have Coypu working in your Pharo image, you have two options:

### Option 1 — Music Image (easiest)

Download [Pharo Launcher](https://pharo.org/download), then:

1. Click **New** → select category **Pharo-Music distributions**
2. Choose **Pharo Music (demo)** from the template list
3. Click **Create image**
4. Double-click the new image to launch it

<img src="{{ site.baseurl }}/assets/img/musicImgLaunchTemp.png" alt="Pharo Launcher – selecting Pharo Music demo template" class="launcher-screenshot">

### Option 2 — Manual install via Metacello

Load Coypu into any Pharo 11–13 image using a Playground:

```Smalltalk
Metacello new
    baseline: 'Coypu';
    repository: 'github://lucretiomsp/coypu:master';
    load
```
