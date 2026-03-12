const canvas = document.getElementById("starCanvas");
const hasAurora = document.querySelector(".aurora-ribbon");
const ctx = canvas.getContext("2d");

/* ----------------------------------------------------
   STAR CONFIG
---------------------------------------------------- */
const STAR_CONFIG = {
  count: window.STAR_CONFIG?.count ?? 250,
  color: window.STAR_CONFIG?.color ?? "255,255,255",
  sizeMultiplier: window.STAR_CONFIG?.sizeMultiplier ?? 1.1,
  speedMultiplier: window.STAR_CONFIG?.speedMultiplier ?? 0.1,
  shootingStars: window.STAR_CONFIG?.shootingStars ?? 1
};

let stars = [];
let STAR_COUNT = STAR_CONFIG.count;

/* ----------------------------------------------------
   4K CRISP CANVAS
---------------------------------------------------- */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

resizeCanvas();

function getStarCount() {
  if (window.STAR_CONFIG?.count) {
    return window.STAR_CONFIG.count;
  }

  const area = window.innerWidth * window.innerHeight;

  if (area > 2000000) return 450;
  if (area > 900000) return 350;
  return 250;
}
/* ----------------------------------------------------
   STAR CLASS
---------------------------------------------------- */
class Star {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.baseX = Math.random() * window.innerWidth;
    this.baseY = initial
      ? Math.random() * window.innerHeight
      : window.innerHeight;

    this.z = Math.random() * 2;

    this.size = this.z * STAR_CONFIG.sizeMultiplier;
    this.baseSpeed = this.z * STAR_CONFIG.speedMultiplier;
    this.speed = this.baseSpeed;
  }

  draw(x, y) {
    ctx.fillStyle = `rgba(${STAR_CONFIG.color}, ${0.5 + Math.random() * 0.5})`;

    ctx.beginPath();
    ctx.arc(x, y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  update(mouse) {
    this.baseY -= this.speed;

    if (this.baseY < 0) {
      this.reset();
    }

    let renderX = this.baseX;
    let renderY = this.baseY;

    if (mouse.x !== null) {
      const offsetX = (mouse.x - window.innerWidth / 2) / window.innerWidth;
      const offsetY = (mouse.y - window.innerHeight / 2) / window.innerHeight;

      renderX += offsetX * this.z * 30;
      renderY += offsetY * this.z * 20;
    }

    this.draw(renderX, renderY);
  }
}

/* ----------------------------------------------------
   INIT
---------------------------------------------------- */
function init() {
  STAR_COUNT = getStarCount();
  stars = [];

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star());
  }
}

/* ----------------------------------------------------
   MOUSE + TOUCH SUPPORT
---------------------------------------------------- */
const mouse = {
  x: null,
  y: null,
  targetX: null,
  targetY: null
};

window.addEventListener("mousemove", e => {
  mouse.targetX = e.clientX;
  mouse.targetY = e.clientY;
});

window.addEventListener("touchmove", e => {
  const touch = e.touches[0];
  mouse.targetX = touch.clientX;
  mouse.targetY = touch.clientY;
}, { passive: true });

window.addEventListener("touchend", () => {
  mouse.targetX = window.innerWidth / 2;
  mouse.targetY = window.innerHeight / 2;
});

/* ----------------------------------------------------
   SHOOTING STARS
---------------------------------------------------- */
class ShootingStar {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * window.innerWidth * 0.7;
    this.y = Math.random() * window.innerHeight * 0.3;
    this.velX = 2 + Math.random() * 4;
    this.velY = 1 + Math.random() * 2;
    this.length = 150 + Math.random() * 100;
    this.opacity = 0.7;
    this.active = true;
  }

  update() {
    if (!this.active) return;

    this.x += this.velX;
    this.y += this.velY;
    this.opacity -= 0.006;

    if (this.opacity <= 0) {
      this.active = false;
      setTimeout(() => this.reset(), 3000 + Math.random() * 4000);
    }
  }

  draw() {
    if (!this.active) return;

    const gradient = ctx.createLinearGradient(
      this.x, this.y,
      this.x - this.length, this.y - this.length * 0.5
    );

    gradient.addColorStop(0, `rgba(255,255,255,${this.opacity})`);
    gradient.addColorStop(1, `rgba(255,255,255,0)`);

    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.length, this.y - this.length * 0.5);
    ctx.stroke();
  }
}

let shootingStars = Array.from(
  { length: STAR_CONFIG.shootingStars },
  () => new ShootingStar()
);

/* ----------------------------------------------------
   GALAXY BACKGROUND
---------------------------------------------------- */
function drawGalaxyBG() {
  const gradient = ctx.createRadialGradient(
    canvas.width * 0.3,
    canvas.height * 0.4,
    0,
    canvas.width * 0.3,
    canvas.height * 0.4,
    canvas.width
  );

  gradient.addColorStop(0, "#1b1f4a");
  gradient.addColorStop(0.4, "#0a0b1e");
  gradient.addColorStop(0.8, "#05050a");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/* ----------------------------------------------------
   MAIN LOOP
---------------------------------------------------- */
function animate() {

  if (hasAurora) {
    drawGalaxyBG();
  }

  if (mouse.targetX !== null) {
    if (mouse.x === null) {
      mouse.x = mouse.targetX;
      mouse.y = mouse.targetY;
    } else {
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
    }
  }

  stars.forEach(star => star.update(mouse));

  shootingStars.forEach(s => {
    s.update();
    s.draw();
  });

  requestAnimationFrame(animate);
}

/* ----------------------------------------------------
   RESIZE
---------------------------------------------------- */
window.addEventListener("resize", () => {
  resizeCanvas();
  init();
});

init();
animate();