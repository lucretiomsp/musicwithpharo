---
layout: mypost
title: "MIDI support and CoreAudio driver for Apple Silicon "
date: 2025-02-15
---
We just uploaded to the [Phausto repository](https://github.com/lucretiomsp/phausto) an upgraded version of the dynamic-engine for Apple Silicon. 
Using native CoreAudio as driver it improves stability by eliminating PortAudio known issues.
A custom modification of the orginal dynamic-engine allows to use MIDI to control DSPs that have defined UI parameters labeled *gate* , *freq* and *gain*.
This means external MIDI keyboards and sequencers can be used to play polyphonic synthesisers created with Phausto.
