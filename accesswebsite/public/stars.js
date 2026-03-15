const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");

/* ----------------------------------------------------
   4K CRISP CANVAS SETUP
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
window.addEventListener("resize", () => {
    resizeCanvas();
    init();
});

/* ----------------------------------------------------
   STAR SYSTEM
---------------------------------------------------- */

let stars = [];
const STAR_COUNT = 400;

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

            // Gravity well effect
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

function init() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
    }
}

/* ----------------------------------------------------
   MOUSE SMOOTHING
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
   WARP CLICK EFFECT
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

    // Smooth mouse easing
    if (mouse.targetX !== null) {
        if (mouse.x === null) {
            mouse.x = mouse.targetX;
            mouse.y = mouse.targetY;
        } else {
            mouse.x += (mouse.targetX - mouse.x) * 0.05;
            mouse.y += (mouse.targetY - mouse.y) * 0.05;
        }
    }

    // Cursor glow aura
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

init();
animate();