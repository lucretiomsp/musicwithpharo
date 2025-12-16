---
layout: docuMain
title: "Coypu: programming music on-the-fly"
---
Coypu is a Pharo package designed for programming music on-the-fly. It serves as a client that can connect to various audio engines, including [SuperDirt](<https://github.com/musikinformatik/SuperDirt>)/[SuperCollider](<https://supercollider.github.io/>), [Kyma](<https://kyma.symbolicsound.com/>), 
[PureData](<https://puredata.info/>), and [Phausto](<https://github.com/lucretiomsp/phausto>), as well as external [MIDI](<https://midi.org/>) sound generators. Coypu is crafted to be user-friendly and easily extensible.

Welcome to the Coypu wiki!

## Installation

To have Coypu working in your Pharo image, follow the next steps:

1. Download a new Pharo image. _(At the moment of this writing, Coypu was tested in Pharo 11, 12 and 13.)_

2. Load the project in your image using Metacello, copy and execute in a Playground this installation script:

```Smalltalk
Metacello new
    baseline: 'Coypu';
    repository: 'github://lucretiomsp/coypu:master';
    load
```
