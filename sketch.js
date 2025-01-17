let numPoints = 500; // Number of points per waveform
let waves = [];
let waveTypes = ["sine", "square", "triangle", "sawtooth"]; // Types of waves

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  strokeWeight(3);

  // Create waves with different frequencies and amplitudes
  let spacing = height / (waveTypes.length + 1); // Vertical spacing between waves
  for (let i = 0; i < waveTypes.length; i++) {
    waves.push(new Waveform(waveTypes[i], random(0.06, 0.1), spacing * (i + 1), 100));
  }
}

function draw() {
  background(255); // Black background
  stroke(200, 250, 10); // White lines

  // Draw each wave
  for (let wave of waves) {
    wave.update();
    wave.display();
  }
}

// Waveform class
class Waveform {
  constructor(type, freq, yPos, amp) {
    this.type = type; // Type: sine, square, triangle, sawtooth
    this.freq = freq; // Frequency of the waveform
    this.yPos = yPos; // Fixed vertical position of the wave
    this.amp = amp; // Amplitude of the wave
    this.phase = 0; // Phase offset
  }

  update() {
    this.phase += this.freq; // Increment phase for animation
  }

  display() {
    beginShape();
    for (let i = 0; i < numPoints; i++) {
      let x = map(i, 0, numPoints - 1, 0, width);
      let t = map(i, 0, numPoints - 1, 0, TWO_PI);
      let y = this.getWaveValue(t + this.phase);
      vertex(x, this.yPos - y); // Add vertical position offset
    }
    endShape();
  }

  getWaveValue(t) {
    // Calculate the wave value based on its type
    switch (this.type) {
      case "sine":
        return this.amp * sin(t);
      case "square":
        return this.amp * (sin(t) > 0 ? 1 : -1);
      case "triangle":
        return this.amp * asin(sin(t)) * (2 / PI);
      case "sawtooth":
        return this.amp * (2 * (t / TWO_PI - floor(t / TWO_PI + 0.5)));
      default:
        return 0;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Adjust canvas size on resize
}
