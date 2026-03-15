export function initCosmicBackground() {

  const canvas = document.getElementById("cosmos");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let w, h;
  let particles = [];

  const PARTICLE_COUNT = window.innerWidth < 768 ? 70 : 120;
  const POINTER_RADIUS = 150;

  const pointer = {
    x: null,
    y: null
  };

  /* Desktop mouse */
  window.addEventListener("mousemove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  /* Mobile touch */
  window.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    pointer.x = touch.clientX;
    pointer.y = touch.clientY;
  }, { passive: true });

  window.addEventListener("touchend", () => {
    pointer.x = null;
    pointer.y = null;
  });

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  class Particle {

    constructor() {

      this.x = Math.random() * w;
      this.y = Math.random() * h;

      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;

      this.size = Math.random() * 2 + 0.5;

      this.hue = 180 + Math.random() * 120;

    }

    move() {

      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;

      /* Pointer interaction */

      if (pointer.x !== null && pointer.y !== null) {

        let dx = pointer.x - this.x;
        let dy = pointer.y - this.y;

        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < POINTER_RADIUS) {

          let force = (POINTER_RADIUS - dist) / POINTER_RADIUS;

          this.x -= dx * force * 0.02;
          this.y -= dy * force * 0.02;

        }

      }

    }

    draw() {

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

      ctx.fillStyle = `hsla(${this.hue},100%,70%,0.9)`;

      ctx.fill();

    }

  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function connect() {

    for (let i = 0; i < PARTICLE_COUNT; i++) {

      for (let j = i; j < PARTICLE_COUNT; j++) {

        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {

          ctx.beginPath();

          ctx.strokeStyle = "rgba(120,200,255," + (1 - dist / 120) + ")";

          ctx.lineWidth = 0.5;

          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);

          ctx.stroke();

        }

      }

    }

  }

  function animate() {

    ctx.fillStyle = "rgba(2,4,15,0.6)";
    ctx.fillRect(0, 0, w, h);

    particles.forEach(p => {
      p.move();
      p.draw();
    });

    connect();

    requestAnimationFrame(animate);

  }

  animate();
}