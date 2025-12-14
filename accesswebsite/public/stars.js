const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
const STAR_COUNT = 400;

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 2;   // depth
        this.size = this.z * 1.1;     //size of stars
        this.speed = this.z * 0.1;    // speed of stars
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update(mouse) {
        this.y -= this.speed;
        if (this.y < 0) {
            this.y = canvas.height;
            this.x = Math.random() * canvas.width;
        }

        // parallax tilt
        if (mouse.x && mouse.y) {
            this.x += (mouse.x - canvas.width / 2) * 0.00005 * this.z;
            this.y += (mouse.y - canvas.height / 2) * 0.00005 * this.z;
        }

        this.draw();
    }
}

function init() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) stars.push(new Star());
}

const mouse = { x: null, y: null };
window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => star.update(mouse));
    requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

init();
animate();

/* ----------------------------------------------------
   SHOOTING STARS
---------------------------------------------------- */

class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        // Start at random X near the top or left
        this.x = Math.random() * canvas.width * 0.7;
        this.y = Math.random() * canvas.height * 0.3;

        // Random velocity
        this.velX = 2 + Math.random() * 4;
        this.velY = 1 + Math.random() * 2;

        // Tail properties
        this.length = 150 + Math.random() * 100;
        this.opacity = 0.5;
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
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.length, this.y - this.length * 0.5);
        ctx.stroke();
    }
}

// Create shooting stars
let shootingStars = [
    new ShootingStar(),
    new ShootingStar(),
    new ShootingStar()
];

// Modify your main animate() function to draw these:
const oldAnimate = animate;
animate = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => star.update(mouse));
    shootingStars.forEach(s => {
        s.update();
        s.draw();
    });

    requestAnimationFrame(animate);
};

animate();
