/*
  ╔══════════════════════════════════════════════════╗
  ║  js/background.js — 3D Animated Background      ║
  ║  VERSION: Fixed & Verified ✅                   ║
  ║                                                  ║
  ║  FIXES FROM PREVIOUS VERSION:                   ║
  ║  1. W and H set immediately, not as 0           ║
  ║  2. cubes array built AFTER W and H are ready   ║
  ║  3. Particles wrap around edges (no flicker)    ║
  ║  4. Added mouse repulsion effect (bonus!)       ║
  ╚══════════════════════════════════════════════════╝

  WHAT YOU WILL SEE ON SCREEN:
  • 80 glowing purple/pink floating dots
  • Thin lines connecting nearby dots
  • 5 slowly rotating wireframe 3D cubes
  • Dots gently push away from your mouse cursor
  • All of this sits BEHIND the page content

  HOW IT CONNECTS TO OTHER FILES:
  • Reads <canvas id="bg-canvas"> from index.html
  • Canvas CSS (position/z-index) is in css/animations.css:
      #bg-canvas {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        z-index: 0;            <- behind pages (pages use z-index:1)
        pointer-events: none;  <- mouse clicks pass through
      }
*/

(function () {

  // ─────────────────────────────────────────────
  //  GET CANVAS
  // ─────────────────────────────────────────────
  const canvas = document.getElementById('bg-canvas');

  // Safety: if canvas tag is missing from index.html, stop here
  if (!canvas) {
    console.warn('background.js: #bg-canvas element not found');
    return;
  }

  // ctx = the drawing tool (like a pen on the canvas)
  const ctx = canvas.getContext('2d');

  // ─────────────────────────────────────────────
  //  SCREEN DIMENSIONS
  //  ✅ FIX: Set W and H to actual window size
  //  immediately (old version started them at 0)
  // ─────────────────────────────────────────────
  let W = window.innerWidth;
  let H = window.innerHeight;

  canvas.width  = W;
  canvas.height = H;

  // Update when user resizes the browser window
  window.addEventListener('resize', function () {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  // ─────────────────────────────────────────────
  //  MOUSE TRACKER (for repulsion effect)
  // ─────────────────────────────────────────────
  const mouse = { x: -999, y: -999 };
  // Start far off screen so there's no effect until mouse moves

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', function () {
    mouse.x = -999;
    mouse.y = -999;
  });

  // ─────────────────────────────────────────────
  //  PARTICLE CLASS
  //  Each particle is one glowing dot on screen
  // ─────────────────────────────────────────────
  class Particle {

    constructor() {
      this.init();
    }

    init() {
      // Random starting position anywhere on screen
      // ✅ FIX: W and H are correct values now
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;

      // Size: random between 0.5px and 2.5px
      this.r     = Math.random() * 2 + 0.5;

      // Speed and direction: random slow drift
      // (Math.random() - 0.5) → range: -0.5 to +0.5
      this.vx    = (Math.random() - 0.5) * 0.45;
      this.vy    = (Math.random() - 0.5) * 0.45;

      // Transparency: random between 0.15 and 0.65
      this.alpha = Math.random() * 0.5 + 0.15;

      // Color: 60% purple, 40% pink
      this.color = Math.random() > 0.4
        ? '108, 99, 255'    // --accent (purple) from variables.css
        : '255, 101, 132';  // --accent2 (pink) from variables.css
    }

    update() {
      // ── Mouse repulsion ──
      // If mouse is within 100px, gently push particle away
      const dx   = this.x - mouse.x;
      const dy   = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100 && dist > 0) {
        const force = (100 - dist) / 100; // 1 = very close, 0 = at edge
        this.x += dx * force * 0.03;
        this.y += dy * force * 0.03;
      }

      // ── Normal drift movement ──
      this.x += this.vx;
      this.y += this.vy;

      // ── Wrap around screen edges (seamless, no pop) ──
      // ✅ FIX: Wrap instead of reset → no sudden position jumps
      if (this.x < -10)    this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10)    this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      // arc(x, y, radius, startAngle, endAngle)
      // Math.PI * 2 = 360° = full circle
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.fill();
    }
  }

  // ─────────────────────────────────────────────
  //  CREATE 80 PARTICLES
  // ─────────────────────────────────────────────
  const particles = Array.from({ length: 80 }, () => new Particle());

  // ─────────────────────────────────────────────
  //  DRAW CONNECTION LINES
  //  Loops every pair of particles.
  //  If they are close enough → draw faint line.
  // ─────────────────────────────────────────────
  function drawConnections() {
    const MAX_DIST = 130;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a    = particles[i];
        const b    = particles[j];
        const dx   = a.x - b.x;
        const dy   = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          // More transparent the farther apart they are
          const opacity = 0.18 * (1 - dist / MAX_DIST);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(108, 99, 255, ${opacity})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // ─────────────────────────────────────────────
  //  CREATE 5 FLOATING 3D CUBES
  //  ✅ FIX: Built after W and H are set,
  //  so cubes start inside the visible screen
  // ─────────────────────────────────────────────
  const cubes = Array.from({ length: 5 }, () => ({
    x:        Math.random() * W,
    y:        Math.random() * H,
    size:     Math.random() * 30 + 12,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.012,
    vx:       (Math.random() - 0.5) * 0.22,
    vy:       (Math.random() - 0.5) * 0.22,
    alpha:    Math.random() * 0.07 + 0.02
  }));

  function drawCube(cube) {
    const s      = cube.size;
    const offset = s * 0.4; // back-face offset = 3D depth illusion

    // save() saves translate/rotate state before we change it
    ctx.save();

    // Move drawing origin to this cube's center
    ctx.translate(cube.x, cube.y);
    // Rotate around that center
    ctx.rotate(cube.rotation);

    ctx.strokeStyle = `rgba(108, 99, 255, ${cube.alpha})`;
    ctx.lineWidth   = 0.8;

    // Front face: square centered at (0, 0)
    ctx.strokeRect(-s / 2, -s / 2, s, s);

    // Back face: same square but shifted diagonally
    ctx.strokeRect(-s / 2 + offset, -s / 2 - offset, s, s);

    // Four edges connecting front corners to back corners
    const corners = [
      [-s / 2, -s / 2],
      [ s / 2, -s / 2],
      [ s / 2,  s / 2],
      [-s / 2,  s / 2],
    ];

    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + offset, cy - offset);
      ctx.stroke();
    });

    // restore() undoes the translate + rotate
    ctx.restore();

    // Update for next frame
    cube.rotation += cube.rotSpeed;
    cube.x        += cube.vx;
    cube.y        += cube.vy;

    // Bounce off edges
    if (cube.x < -80 || cube.x > W + 80) cube.vx *= -1;
    if (cube.y < -80 || cube.y > H + 80) cube.vy *= -1;
  }

  // ─────────────────────────────────────────────
  //  ANIMATION LOOP
  //  Called ~60 times per second automatically
  //  Each call = one frame
  // ─────────────────────────────────────────────
  function animate() {
    // Erase last frame
    ctx.clearRect(0, 0, W, H);

    // Draw lines first (behind particles)
    drawConnections();

    // Draw and move each particle
    particles.forEach(function (p) {
      p.update();
      p.draw();
    });

    // Draw each rotating cube
    cubes.forEach(function (cube) {
      drawCube(cube);
    });

    // Schedule this function to run again before next screen repaint
    requestAnimationFrame(animate);
  }

  // ─────────────────────────────────────────────
  //  START
  // ─────────────────────────────────────────────
  animate();

  console.log('✨ background.js loaded —', particles.length, 'particles,', cubes.length, 'cubes');

})();
