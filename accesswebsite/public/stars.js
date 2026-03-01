const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");

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

/* ----------------------------------------------------
   RESPONSIVE STAR COUNT
---------------------------------------------------- */
function getStarCount() {
    const area = window.innerWidth * window.innerHeight;

    if (area > 2000000) return 450;   // large desktop
    if (area > 900000) return 350;    // laptop / tablet
    return 250;                       // mobile
}

let STAR_COUNT = getStarCount();
let stars = [];

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
        this.size = this.z * 1.1;
        this.baseSpeed = this.z * 0.1;
        this.speed = this.baseSpeed;
    }

    draw(x, y) {
        ctx.fillStyle = `rgba(255,255,255,${0.5 + Math.random() * 0.5})`;
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

        if (mouse.x !== null && mouse.y !== null) {

            const offsetX = (mouse.x - window.innerWidth / 2) / window.innerWidth;
            const offsetY = (mouse.y - window.innerHeight / 2) / window.innerHeight;

            renderX += offsetX * this.z * 30;
            renderY += offsetY * this.z * 20;

            // Gravity pull
            const dx = mouse.x - renderX;
            const dy = mouse.y - renderY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const influenceRadius = 150;

            if (distance < influenceRadius) {
                const force = (influenceRadius - distance) / influenceRadius;
                renderX += dx * force * 0.05 * this.z;
                renderY += dy * force * 0.05 * this.z;
            }
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

// Desktop
window.addEventListener("mousemove", e => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
});

// Mobile touch
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
        this.opacity = 0.6;
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

let shootingStars = [
    new ShootingStar(),
    new ShootingStar(),
    new ShootingStar()
];

/* ----------------------------------------------------
   WARP CLICK
---------------------------------------------------- */
window.addEventListener("click", () => {
    stars.forEach(star => {
        star.speed = star.baseSpeed * 5;
        setTimeout(() => {
            star.speed = star.baseSpeed;
        }, 300);
    });
});

/* ----------------------------------------------------
   MAIN LOOP
---------------------------------------------------- */
function animate() {

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Idle drift if no interaction
    if (mouse.targetX === null) {
        const time = Date.now() * 0.0003;
        mouse.targetX = window.innerWidth / 2 + Math.cos(time) * 100;
        mouse.targetY = window.innerHeight / 2 + Math.sin(time) * 50;
    }

    // Smooth easing
    if (mouse.targetX !== null) {
        if (mouse.x === null) {
            mouse.x = mouse.targetX;
            mouse.y = mouse.targetY;
        } else {
            mouse.x += (mouse.targetX - mouse.x) * 0.05;
            mouse.y += (mouse.targetY - mouse.y) * 0.05;
        }
    }

    // Glow aura
    if (mouse.x !== null) {
        const glow = ctx.createRadialGradient(
            mouse.x, mouse.y, 0,
            mouse.x, mouse.y, 200
        );

        glow.addColorStop(0, "rgba(255,255,255,0.08)");
        glow.addColorStop(1, "rgba(255,255,255,0)");

        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    stars.forEach(star => star.update(mouse));

    shootingStars.forEach(s => {
        s.update();
        s.draw();
    });

    requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
    resizeCanvas();
    init();
});

init();
animate();