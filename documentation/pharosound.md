---
layout: docuMain
title: "Pharo-Sound: send and receive MIDI and much more"
---
This library contains methods that are useful to send and receive MIDI messages. We mainly use methods that open streams
( to send or receive MIDI messages ) and methods to create and send MIDI messages.
To implement MIDI connections in Pharo, we used an external library written in C langage to help us.
We use the Pharo package uFFI to be able to call functions of [PortMidi](https://github.com/PortMidi/portmidi).
