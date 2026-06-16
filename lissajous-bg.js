(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'lissajous-bg';
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0', left: '0',
    width: '100vw', height: '100vh',
    zIndex: '0',
    pointerEvents: 'none',
    opacity: '0.18'
  });
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const POINTS = 2400;
  const RATIOS = [[1,1],[2,1],[3,2],[4,3],[5,4],[3,1],[5,3],[5,2]];
  let ratioIdx = 0;
  let freqX = 3, freqY = 2;
  let targetFX = 3, targetFY = 2;
  let delta = 0.3, targetDelta = 0.3;
  let hueBase = 210; // blue-ish to match site palette
  let t = 0, nextSwitch = 500;

  function pickNext() {
    ratioIdx = (ratioIdx + 1) % RATIOS.length;
    targetFX = RATIOS[ratioIdx][0];
    targetFY = RATIOS[ratioIdx][1];
    targetDelta = (Math.random() * 0.8 + 0.1) * Math.PI;
    nextSwitch = 400 + Math.floor(Math.random() * 500);
  }

  function draw() {
    requestAnimationFrame(draw);
    t++;

    freqX += (targetFX - freqX) * 0.003;
    freqY += (targetFY - freqY) * 0.003;
    delta  += (targetDelta - delta) * 0.005;
    hueBase += 0.08;

    if (t % nextSwitch === 0) pickNext();

    // very slow fade — ghostly trail
    ctx.fillStyle = 'rgba(13,21,32,0.12)';
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const rx = Math.min(W, H) * 0.44;
    const ry = Math.min(W, H) * 0.44;

    ctx.beginPath();
    for (let i = 0; i <= POINTS; i++) {
      const a = (i / POINTS) * Math.PI * 2;
      const x = cx + rx * Math.sin(freqX * a + delta);
      const y = cy + ry * Math.sin(freqY * a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    const hue = hueBase % 360;
    ctx.strokeStyle = `hsla(${hue}, 65%, 70%, 0.55)`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  draw();
})();
