// Utility functions for the game

const RARITY_WEIGHTS = {
    common: 0.7,    // 70% chance
    rare: 0.25,     // 25% chance
    ultraRare: 0.05 // 5% chance
};

const RARITY_COLORS = {
    common: '#808080',
    rare: '#4169E1',
    ultraRare: '#FFD700'
};

function getRandomRarity() {
    const rand = Math.random();
    if (rand < RARITY_WEIGHTS.common) return 'common';
    if (rand < RARITY_WEIGHTS.common + RARITY_WEIGHTS.rare) return 'rare';
    return 'ultraRare';
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function playSound(src) {
    const audio = new Audio(src);
    audio.play().catch(error => console.log('Audio play failed:', error));
}

function saveGameState(state) {
    localStorage.setItem('hairballCatGame', JSON.stringify(state));
}

function loadGameState() {
    const saved = localStorage.getItem('hairballCatGame');
    return saved ? JSON.parse(saved) : null;
}

function createParticle(x, y, color, size = 5) {
    return {
        x,
        y,
        color,
        size,
        velocity: {
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 5
        },
        life: 1.0
    };
}

function updateParticles(particles) {
    return particles.filter(particle => {
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.life -= 0.02;
        return particle.life > 0;
    });
}

function drawParticles(ctx, particles) {
    particles.forEach(particle => {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// Animation easing functions
const Easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    bounce: t => {
        if (t < (1/2.75)) {
            return 7.5625 * t * t;
        } else if (t < (2/2.75)) {
            return 7.5625 * (t -= (1.5/2.75)) * t + 0.75;
        } else if (t < (2.5/2.75)) {
            return 7.5625 * (t -= (2.25/2.75)) * t + 0.9375;
        } else {
            return 7.5625 * (t -= (2.625/2.75)) * t + 0.984375;
        }
    }
};

// Device detection
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Touch event handling
function getTouchPosition(event) {
    const touch = event.touches[0] || event.changedTouches[0];
    return {
        x: touch.clientX,
        y: touch.clientY
    };
}

// Export utilities
window.GameUtils = {
    RARITY_WEIGHTS,
    RARITY_COLORS,
    getRandomRarity,
    loadImage,
    playSound,
    saveGameState,
    loadGameState,
    createParticle,
    updateParticles,
    drawParticles,
    Easing,
    isMobile,
    getTouchPosition
}; 