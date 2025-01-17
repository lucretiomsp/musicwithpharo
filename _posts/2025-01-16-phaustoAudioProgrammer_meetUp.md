---
layout: post
title: "Phausto at the Audio Prgrammer meetup"
date: 2025-01-16
---


On **November 21–22, 2024**, I had the pleasure to be invited to talk about fast plug-in developmnent with Phausto and [Cmajor](https://cmajor.dev) (at [**The Audio Programmer Monthly Virtual Meetup**](https://www.youtube.com/watch?v=NJtXPE1ITyo&t=3493s).\
The Audio Programmer [website](https://www.theaudioprogrammer.com) is a hub for audio developers to connect, learn, and share knowledge. It hosts regular meetups where programmers from around the world exchange ideas, ask questions, and collaborate on audio programming topics. The community is also supported by an active YouTube channel with more thank 40k subscribers, offering tutorials, insights, and discussions on audio programming tools, techniques, and best practices.\
In this 30-minute talk, I briefly discuss the motivation behind using Phausto to prototype and develop audio plug-ins that can be used in any DAW, thanks to the [Cmajor plug-in](https://cmajor.dev/docs/GettingStarted) , which easily loads Cmajor patches. The Faust compiler enables the export of Faust code into Cmajor code, and Phausto performs the magic of creating a proper .cmajorpatch file and a polyWrapper that allows for MIDI polyphony.\

We also introduced a bit of the history of Smalltalk and Pharo, highlighting its postcard syntax and unique features. The talk concluded with a quick live demo.\

We hope to create more video tutorials in the future, as we strongly believe this *plug-in development stack* can empower artists and producers to bring their audio ideas to life without the hassle of C++ programming and app code signing/notarizing.


See and download the slides [here]([See the poster here](https://lucretiomsp.github.io/musicwithpharo/assets/Phausto_AudioProgrammerMeetUp012025.pdf)
