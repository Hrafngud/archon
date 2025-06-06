// Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TOTAL_ARCHONS = 100;
const ARCHONS_PER_WAVE = 10;
const SHOOTING_MODES = ['Single', 'Triple', 'Rapid', 'Radial'];

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOver');
const victoryScreen = document.getElementById('victory');
const waveAnnouncement = document.getElementById('waveAnnouncement');
const playerFloat = document.getElementById('playerFloat');

// Load player image
const playerImage = new Image();
playerImage.src = 'https://

w7.pngwing.com/pngs/871/356/png-transparent-kyle-craven-father-family-brazil-video-jailson-mendes-face-family-glasses.png';

// Background effects
const stars = Array.from({ length: 100 }, () => ({
    x: Math.random() * CANVAS_WIDTH,
    y: Math.random() * CANVAS_HEIGHT,
    radius: Math.random() * 2 + 1,
    speed: Math.random() * 2 + 1
}));
const nebulae = Array.from({ length: 5 }, () => ({
    x: Math.random() * CANVAS_WIDTH,
    y: Math.random() * CANVAS_HEIGHT,
    radius: Math.random() * 50 + 50,
    opacity: Math.random() * 0.3 + 0.1
}));

// Particles for victory effect
const particles = [];

// Floating animation for start screen
let floatTimer = 0;
function animatePlayerFloat() {
    if (!startScreen.style.display) {
        floatTimer += 0.05;
        playerFloat.style.transform = `translateY(${Math.sin(floatTimer) * 10}px)`;
        requestAnimationFrame(animatePlayerFloat);
    }
}
playerImage.onload = () => animatePlayerFloat();

// Sophia's Wings item
class SophiaWings {
    constructor() {
        this.x = CANVAS_WIDTH / 2;
        this.y = CANVAS_HEIGHT / 2;
        this.radius = 20;
        this.active = false;
        this.floatTimer = 0;
    }
    update() {
        this.floatTimer += 0.05;
        this.y += Math.sin(this.floatTimer) * 2;
    }
    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'cyan';
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 20;
        ctx.globalAlpha = 0.8 + Math.sin(this.floatTimer) * 0.2;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}

// Gnosis Pendant item
class GnosisPendant {
    constructor() {
        this.x = Math.random() * (CANVAS_WIDTH - 40) + 20;
        this.y = Math.random() * (CANVAS_HEIGHT - 40) + 20;
        this.radius = 15;
        this.floatTimer = 0;
    }
    update() {
        this.floatTimer += 0.05;
        this.y += Math.sin(this.floatTimer) * 2;
    }
    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'gold';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20;
        ctx.globalAlpha = 0.8 + Math.sin(this.floatTimer) * 0.2;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}

// Player class
class Player {
    constructor() {
        this.x = CANVAS_WIDTH / 2;
        this.y = CANVAS_HEIGHT / 2;
        this.width = 40;
        this.height = 40;
        this.baseSpeed = 5;
        this.health = 100;
        this.angle = 0;
        this.level = 1;
        this.shootingMode = 0;
        this.damageFlash = 0;
        this.transcendence = { active: false, scale: 1, opacity: 1, timer: 0 };
        this.lastShotTime = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.hasRadialMode = false;
    }
    update(keys, game) {
        const speed = this.baseSpeed + (this.level - 1) * 0.5;
        if (keys['w'] && this.y > this.height / 2) this.y -= speed;
        if (keys['s'] && this.y < CANVAS_HEIGHT - this.height / 2) this.y += speed;
        if (keys['a'] && this.x > this.width / 2) this.x -= speed;
        if (keys['d'] && this.x < CANVAS_WIDTH - this.width / 2) this.x += speed;
        if (this.damageFlash > 0) this.damageFlash--;
        if (this.transcendence.active) {
            this.transcendence.timer++;
            this.transcendence.scale += 0.01;
            this.transcendence.opacity = Math.max(0, this.transcendence.opacity - 0.005);
        }
        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                game.waveMessage = {
                    text: 'Invulnerability Fades!',
                    opacity: 1,
                    timer: 120
                };
                waveAnnouncement.textContent = game.waveMessage.text;
                waveAnnouncement.style.display = 'block';
            }
        }
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.transcendence.active) {
            ctx.scale(this.transcendence.scale, this.transcendence.scale);
            ctx.globalAlpha = this.transcendence.opacity;
        } else if (this.invincible) {
            ctx.globalAlpha = 0.7 + Math.sin(Date.now() / 100) * 0.3;
        }
        ctx.rotate(this.angle + Math.PI / 2);
        ctx.drawImage(playerImage, -this.width / 2, -this.height / 2, this.width, this.height);
        if (this.damageFlash > 0) {
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        ctx.restore();
    }
    shoot() {
        const now = Date.now();
        if (this.shootingMode === 2 && now - this.lastShotTime < 100) return [];
        if (this.shootingMode === 3 && now - this.lastShotTime < 200) return [];
        this.lastShotTime = now;
        const bullets = [];
        if (this.shootingMode === 0) {
            bullets.push(new Bullet(this.x, this.y, this.angle));
        } else if (this.shootingMode === 1) {
            bullets.push(new Bullet(this.x, this.y, this.angle - Math.PI / 12));
            bullets.push(new Bullet(this.x, this.y, this.angle));
            bullets.push(new Bullet(this.x, this.y, this.angle + Math.PI / 12));
        } else if (this.shootingMode === 2) {
            bullets.push(new Bullet(this.x, this.y, this.angle, 15));
        } else if (this.shootingMode === 3) {
            for (let i = 0; i < 12; i++) {
                bullets.push(new Bullet(this.x, this.y, (i * Math.PI) / 6, 8));
            }
        }
        return bullets;
    }
}

// Bullet class
class Bullet {
    constructor(x, y, angle, speed = 10, isEnemy = false) {
        this.x = x;
        this.y = y;
        this.radius = isEnemy ? 7 : 5;
        this.speed = speed;
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;
        this.isEnemy = isEnemy;
    }
    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isEnemy ? 'red' : 'yellow';
        ctx.fill();
        ctx.closePath();
    }
}

// Enemy (Archon) class
class Enemy {
    constructor(x, y, tier) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.tier = tier;
        this.speed = [2, 3, 4][tier];
        this.health = 50;
        this.damageFlash = 0;
        this.attackTimer = 0;
    }
    update(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
            if (this.tier === 2) {
                this.x += (dx / distance) * this.speed + Math.sin(Date.now() / 200) * 2;
                this.y += (dy / distance) * this.speed + Math.cos(Date.now() / 200) * 2;
            } else {
                this.x += (dx / distance) * this.speed;
                this.y += (dy / distance) * this.speed;
            }
        }
        if (this.tier >= 1) {
            this.attackTimer++;
            if (this.attackTimer > (this.tier === 1 ? 120 : 60)) {
                const angle = Math.atan2(player.y - this.y, player.x - this.x);
                this.attackTimer = 0;
                return [new Bullet(this.x, this.y, angle, 8, true)];
            }
        }
        if (this.damageFlash > 0) this.damageFlash--;
        return [];
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.tier === 0) { // Circle
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.damageFlash > 0 ? 'white' : 'red';
            ctx.fill();
            ctx.closePath();
        } else if (this.tier === 1) { // Triangle
            ctx.beginPath();
            ctx.moveTo(0, -this.radius);
            ctx.lineTo(this.radius * Math.cos(Math.PI / 6), this.radius * Math.sin(Math.PI / 6));
            ctx.lineTo(-this.radius * Math.cos(Math.PI / 6), this.radius * Math.sin(Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = this.damageFlash > 0 ? 'white' : 'red';
            ctx.fill();
        } else { // Square
            ctx.fillStyle = this.damageFlash > 0 ? 'white' : 'red';
            ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
        }
        ctx.restore();
    }
}

// Boss (Demiurge) class
class Boss {
    constructor() {
        this.x = CANVAS_WIDTH / 2;
        this.y = 100;
        this.radius = 50;
        this.health = 2000;
        this.speed = 1;
        this.attackTimer = 0;
        this.attackMode = 0;
        this.damageFlash = 0;
        this.invincibleTimer = 60;
        this.damageCooldown = 0;
    }
    update(player) {
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.damageCooldown > 0) this.damageCooldown--;
        this.attackTimer++;
        if (this.attackTimer > 120) {
            this.attackMode = (this.attackMode + 1) % 3;
            this.attackTimer = 0;
        }
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 200) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
        if (this.damageFlash > 0) this.damageFlash--;
        return this.attack(player);
    }
    attack(player) {
        const bullets = [];
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        if (this.attackMode === 0) {
            for (let i = -2; i <= 2; i++) {
                bullets.push(new Bullet(this.x, this.y, angle + i * Math.PI / 12, 8, true));
            }
        } else if (this.attackMode === 1) {
            for (let i = 0; i < 12; i++) {
                bullets.push(new Bullet(this.x, this.y, (i * Math.PI) / 6, 6, true));
            }
        } else {
            bullets.push(new Bullet(this.x, this.y, angle, 10, true));
        }
        return bullets;
    }
    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.damageFlash > 0 ? 'white' : 'purple';
        ctx.shadowColor = '#800080';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}

// Particle class for victory effect
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 5 + 2;
        this.dx = (Math.random() - 0.5) * 5;
        this.dy = (Math.random() - 0.5) * 5;
        this.opacity = 1;
    }
    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.opacity -= 0.02;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'gold';
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}

// Game state
class Game {
    constructor() {
        this.player = new Player();
        this.bullets = [];
        this.enemies = [];
        this.boss = null;
        this.sophiaWings = null;
        this.gnosisPendant = null;
        this.archonCount = 0;
        this.wave = 0;
        this.score = 0;
        this.gameOver = false;
        this.victory = false;
        this.keys = {};
        this.waveMessage = { text: '', opacity: 0, timer: 0 };
        this.screenShake = { intensity: 0, timer: 0 };
        this.gameStarted = false;
    }
    spawnWave() {
        if (this.archonCount < TOTAL_ARCHONS && !this.boss && this.enemies.length === 0) {
            this.wave++;
            const tier = Math.min(2, Math.floor(this.wave / 4));
            this.waveMessage = {
                text: `Wave ${this.wave} - ${['Easy', 'Medium', 'Hard'][tier]}`,
                opacity: 1,
                timer: 120
            };
            waveAnnouncement.textContent = this.waveMessage.text;
            waveAnnouncement.style.display = 'block';
            for (let i = 0; i < ARCHONS_PER_WAVE; i++) {
                const side = Math.floor(Math.random() * 4);
                let x, y;
                if (side === 0) { x = Math.random() * CANVAS_WIDTH; y = -20; }
                else if (side === 1) { x = Math.random() * CANVAS_WIDTH; y = CANVAS_HEIGHT + 20; }
                else if (side === 2) { x = -20; y = Math.random() * CANVAS_HEIGHT; }
                else { x = CANVAS_WIDTH + 20; y = Math.random() * CANVAS_HEIGHT; }
                this.enemies.push(new Enemy(x, y, tier));
                this.archonCount++;
            }
            if (this.wave === 6 && !this.sophiaWings) {
                this.sophiaWings = new SophiaWings();
            }
        }
    }
    levelUp() {
        if (this.score / 10 >= this.player.level * 10) {
            this.player.level++;
            if (this.player.level >= 5) this.player.shootingMode = Math.min(1, this.player.shootingMode);
            if (this.player.level >= 10) this.player.shootingMode = Math.min(2, this.player.shootingMode);
            if (this.player.level >= 6 && this.player.hasRadialMode) {
                this.player.shootingMode = Math.min(3, this.player.shootingMode);
            }
        }
    }
    reset() {
        this.player = new Player();
        this.bullets = [];
        this.enemies = [];
        this.boss = null;
        this.sophiaWings = null;
        this.gnosisPendant = null;
        this.archonCount = 0;
        this.wave = 0;
        this.score = 0;
        this.gameOver = false;
        this.victory = false;
        this.waveMessage = { text: '', opacity: 0, timer: 0 };
        this.screenShake = { intensity: 0, timer: 0 };
        this.gameStarted = false;
        gameOverScreen.style.display = 'none';
        victoryScreen.style.display = 'none';
        waveAnnouncement.style.display = 'none';
        startScreen.style.display = 'flex';
        particles.length = 0;
        animatePlayerFloat();
    }
}

// Collision detection
function checkCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
}

// Draw dynamic background
function drawBackground(wave) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Dynamic gradient based on wave
    let gradient;
    if (wave < 4) {
        gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#1a1a40');
        gradient.addColorStop(1, '#4b0082');
    } else if (wave < 8) {
        gradient = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 50, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH);
        gradient.addColorStop(0, '#2f4f4f');
        gradient.addColorStop(1, '#000080');
    } else {
        gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#8b008b');
        gradient.addColorStop(1, '#191970');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw nebulae
    nebulae.forEach(nebula => {
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 100, 255, ${nebula.opacity})`;
        ctx.fill();
        ctx.closePath();
    });

    // Draw stars
    stars.forEach(star => {
        star.y += star.speed * (wave >= 8 ? 2 : 1);
        if (star.y > CANVAS_HEIGHT) star.y -= CANVAS_HEIGHT;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.closePath();
    });
}

// Game instance
const game = new Game();

// Input handling
window.addEventListener('keydown', (e) => { game.keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { game.keys[e.key.toLowerCase()] = false; });
canvas.addEventListener('mousemove', (e) => {
    if (game.gameOver || game.victory || !game.gameStarted) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    game.player.angle = Math.atan2(mouseY - game.player.y, mouseX - game.player.x);
});
canvas.addEventListener('click', () => {
    if (game.gameOver || game.victory || !game.gameStarted) return;
    game.bullets.push(...game.player.shoot());
});
window.addEventListener('wheel', (e) => {
    if (game.gameOver || game.victory || !game.gameStarted) return;
    const maxMode = game.player.hasRadialMode ? 3 : game.player.level >= 10 ? 2 : game.player.level >= 5 ? 1 : 0;
    if (e.deltaY > 0) {
        game.player.shootingMode = Math.min(maxMode, (game.player.shootingMode + 1) % 4);
    } else {
        game.player.shootingMode = Math.min(maxMode, (game.player.shootingMode - 1 + 4) % 4);
    }
});
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r' && (game.gameOver || game.victory)) {
        game.reset();
    }
});
document.getElementById('startButton').addEventListener('click', () => {
    game.gameStarted = true;
    startScreen.style.display = 'none';
});

// Game loop
function gameLoop(timestamp) {
    // Draw background
    drawBackground(game.wave);

    if (!game.gameStarted) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (game.gameOver || (game.victory && game.player.transcendence.timer > 300)) {
        if (game.victory) {
            game.player.update(game.keys, game);
            particles.forEach(p => { p.update(); p.draw(); });
            ctx.save();
            ctx.translate(game.screenShake.intensity * (Math.random() - 0.5), game.screenShake.intensity * (Math.random() - 0.5));
            game.player.draw();
            ctx.restore();
        }
        requestAnimationFrame(gameLoop);
        return;
    }

    // Apply screen shake
    ctx.save();
    if (game.screenShake.timer > 0) {
        game.screenShake.timer--;
        game.screenShake.intensity = Math.max(0, game.screenShake.intensity - 0.1);
        ctx.translate(game.screenShake.intensity * (Math.random() - 0.5), game.screenShake.intensity * (Math.random() - 0.5));
    }

    // Update and draw wave announcement
    if (game.waveMessage.timer > 0) {
        game.waveMessage.timer--;
        game.waveMessage.opacity = Math.max(0, game.waveMessage.opacity - 0.01);
        waveAnnouncement.style.opacity = game.waveMessage.opacity;
        if (game.waveMessage.timer === 0) waveAnnouncement.style.display = 'none';
    }

    // Update player
    game.player.update(game.keys, game);
    game.player.draw();

    // Update and draw Sophia's Wings
    if (game.sophiaWings) {
        game.sophiaWings.update();
        game.sophiaWings.draw();
        game.bullets.forEach((b, j) => {
            if (!b.isEnemy && checkCollision(b, game.sophiaWings)) {
                game.bullets.splice(j, 1);
                game.sophiaWings.active = true;
                game.player.invincible = true;
                game.player.invincibleTimer = ARCHONS_PER_WAVE * 60;
                game.player.hasRadialMode = true;
                game.player.shootingMode = 3;
                game.waveMessage = {
                    text: 'Sophia\'s Blessing Granted!',
                    opacity: 1,
                    timer: 120
                };
                waveAnnouncement.textContent = game.waveMessage.text;
                waveAnnouncement.style.display = 'block';
            }
        });
        if (game.sophiaWings.active || game.wave > 6) {
            game.sophiaWings = null;
        }
    }

    // Update and draw Gnosis Pendant
    if (game.gnosisPendant) {
        game.gnosisPendant.update();
        game.gnosisPendant.draw();
        game.bullets.forEach((b, j) => {
            if (!b.isEnemy && checkCollision(b, game.gnosisPendant)) {
                game.bullets.splice(j, 1);
                game.player.invincible = true;
                game.player.invincibleTimer = 600; // 10 seconds at 60fps
                game.waveMessage = {
                    text: 'Gnosis Pendant Activated!',
                    opacity: 1,
                    timer: 120
                };
                waveAnnouncement.textContent = game.waveMessage.text;
                waveAnnouncement.style.display = 'block';
                game.gnosisPendant = null;
            }
        });
    }

    // Update and draw bullets
    game.bullets = game.bullets.filter(b => b.x > 0 && b.x < CANVAS_WIDTH && b.y > 0 && b.y < CANVAS_HEIGHT);
    game.bullets.forEach(b => {
        b.update();
        b.draw();
    });

    // Update and draw enemies
    game.enemies.forEach((e, i) => {
        const enemyBullets = e.update(game.player);
        game.bullets.push(...enemyBullets);
        e.draw();
        if (!game.player.invincible && checkCollision({ x: game.player.x, y: game.player.y, radius: game.player.width / 2 }, e)) {
            game.player.health -= 10;
            game.player.damageFlash = 10;
            game.enemies.splice(i, 1);
            if (game.player.health <= 0) {
                game.gameOver = true;
                gameOverScreen.style.display = 'block';
            }
        }
        game.bullets.forEach((b, j) => {
            if (!b.isEnemy && checkCollision(b, e)) {
                e.health -= 25;
                e.damageFlash = 10;
                game.bullets.splice(j, 1);
                if (e.health <= 0) {
                    game.enemies.splice(i, 1);
                    game.score += 10;
                    game.levelUp();
                }
            }
            if (b.isEnemy && !game.player.invincible && checkCollision(b, { x: game.player.x, y: game.player.y, radius: game.player.width / 2 })) {
                game.player.health -= 5;
                game.player.damageFlash = 10;
                game.bullets.splice(j, 1);
                if (game.player.health <= 0) {
                    game.gameOver = true;
                    gameOverScreen.style.display = 'block';
                }
            }
        });
    });

    // Update and draw boss
    if (game.boss) {
        const bossBullets = game.boss.update(game.player);
        game.bullets.push(...bossBullets);
        game.boss.draw();
        if (!game.player.invincible && checkCollision({ x: game.player.x, y: game.player.y, radius: game.player.width / 2 }, game.boss)) {
            game.player.health -= 20;
            game.player.damageFlash = 10;
            if (game.player.health <= 0) {
                game.gameOver = true;
                gameOverScreen.style.display = 'block';
            }
        }
        game.bullets.forEach((b, j) => {
            if (!b.isEnemy && game.boss.invincibleTimer <= 0 && game.boss.damageCooldown <= 0 && checkCollision(b, game.boss)) {
                game.boss.health -= 5;
                game.boss.damageFlash = 10;
                game.boss.damageCooldown = 6;
                game.bullets.splice(j, 1);
                if (game.boss.health <= 0) {
                    game.victory = true;
                    game.player.transcendence.active = true;
                    victoryScreen.style.display = 'block';
                    game.screenShake = { intensity: 10, timer: 60 };
                    for (let i = 0; i < 50; i++) {
                        particles.push(new Particle(game.boss.x, game.boss.y));
                    }
                }
            }
            if (b.isEnemy && !game.player.invincible && checkCollision(b, { x: game.player.x, y: game.player.y, radius: game.player.width / 2 })) {
                game.player.health -= 10;
                game.player.damageFlash = 10;
                game.bullets.splice(j, 1);
                if (game.player.health <= 0) {
                    game.gameOver = true;
                    gameOverScreen.style.display = 'block';
                }
            }
        });
        // Spawn Gnosis Pendant
        if (!game.gnosisPendant && Math.random() < 0.3) {
            game.gnosisPendant = new GnosisPendant();
        }
    }

    // Spawn enemies or boss
    if (Math.random() < 0.02) game.spawnWave();
    if (game.archonCount >= TOTAL_ARCHONS && game.enemies.length === 0 && !game.boss) {
        game.boss = new Boss();
        game.waveMessage = {
            text: 'Demiurge Approaches!',
            opacity: 1,
            timer: 120
        };
        waveAnnouncement.textContent = game.waveMessage.text;
        waveAnnouncement.style.display = 'block';
    }

    // Draw HUD
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Health: ${game.player.health}`, 10, 30);
    ctx.fillText(`Archons Defeated: ${game.score / 10}/${TOTAL_ARCHONS}`, 10, 60);
    ctx.fillText(`Level: ${game.player.level}`, 10, 90);
    ctx.fillText(`Wave: ${game.wave}`, 10, 120);
    ctx.fillText(`Shooting Mode: ${SHOOTING_MODES[game.player.shootingMode]}`, 10, 150);
    if (game.boss) ctx.fillText(`Demiurge Health: ${game.boss.health}`, 10, 180);
    if (game.player.invincible) ctx.fillText(`Invulnerability: Active`, 10, 210);

    // Draw particles
    particles.forEach((p, i) => {
        p.update();
        p.draw();
        if (p.opacity <= 0) particles.splice(i, 1);
    });

    ctx.restore();
    requestAnimationFrame(gameLoop);
}

// Start game loop
requestAnimationFrame(gameLoop);