import * as GameUtils from './gameUtils';

class Animation {
    constructor(duration = 1000) {
        this.duration = duration;
        this.startTime = null;
        this.isPlaying = false;
        this.onComplete = null;
    }

    start() {
        this.startTime = performance.now();
        this.isPlaying = true;
    }

    stop() {
        this.isPlaying = false;
    }

    update(currentTime) {
        if (!this.isPlaying) return false;

        const elapsed = currentTime - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);

        if (progress >= 1) {
            this.isPlaying = false;
            if (this.onComplete) this.onComplete();
            return false;
        }

        return progress;
    }
}

class SquashStretchAnimation extends Animation {
    constructor(target, options = {}) {
        super(options.duration || 300);
        this.target = target;
        this.intensity = options.intensity || 1.2;
        // Store the true base scale that never changes
        this.trueBaseScale = target.originalScale || 1;
    }

    start() {
        // Always use the true base scale, not the current scale
        if (!this.target.originalScale) {
            this.target.originalScale = this.target.scale || 1;
        }
        this.trueBaseScale = this.target.originalScale;
        super.start();
    }

    update(currentTime) {
        const progress = super.update(currentTime);
        if (progress === false) {
            // Reset to the true base scale when animation ends
            this.target.scale = this.trueBaseScale;
            return false;
        }

        // Create a smoother, more dynamic squash and stretch effect
        const squashStretch = Math.sin(progress * Math.PI * 3) * 0.3;

        // Calculate scale with squash and stretch, always using true base scale
        const scaleChange = (1 + squashStretch * this.intensity);
        this.target.scale = this.trueBaseScale * scaleChange;
    }

    stop() {
        // Always reset to true base scale when interrupted
        this.target.scale = this.trueBaseScale;
        super.stop();
    }
}

class HairballAnimation extends Animation {
    constructor(cat, rarity) {
        super(2000);
        this.cat = cat;
        this.rarity = rarity;
        this.particles = [];
    }

    start() {
        super.start();
        // Create particles based on rarity
        const particleCount = this.rarity === 'ultraRare' ? 50 :
            this.rarity === 'rare' ? 30 : 15;

        const colors = this.rarity === 'ultraRare' ? ['#FFD700', '#FFA500', '#FF69B4'] :
            this.rarity === 'rare' ? ['#4169E1', '#87CEEB'] :
                ['#808080', '#A9A9A9'];

        for (let i = 0; i < particleCount; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(
                GameUtils.createParticle(
                    this.cat.x,
                    this.cat.y,
                    color,
                    this.rarity === 'ultraRare' ? 8 : 5
                )
            );
        }
    }

    update(currentTime) {
        const progress = super.update(currentTime);
        if (progress === false) return;

        // Update cat position based on animation
        const shakeAmount = this.rarity === 'ultraRare' ? 10 :
            this.rarity === 'rare' ? 5 : 2;

        this.cat.x += Math.sin(progress * Math.PI * 8) * shakeAmount;
        this.cat.y += Math.cos(progress * Math.PI * 4) * shakeAmount;

        // Update particles
        this.particles = GameUtils.updateParticles(this.particles);
    }

    draw(ctx) {
        GameUtils.drawParticles(ctx, this.particles);
    }
}

class HatRevealAnimation extends Animation {
    constructor(hat, rarity) {
        super(1500);
        this.hat = hat;
        this.rarity = rarity;
        this.particles = [];
    }

    start() {
        super.start();

        let particleCountMultiplier = 1;
        let baseColors = ['#CCCCCC', '#DDDDDD', '#BBAA99']; // Default/common sparkles

        switch (this.rarity) {
            case 'common':
                particleCountMultiplier = 1.5;
                baseColors = ['#FFFFFF', '#E0E0E0', '#D0D0D0'];
                break;
            case 'uncommon':
                particleCountMultiplier = 2.5;
                baseColors = ['#AEEA00', '#F4FF81', '#FFFFFF', '#CCFF90']; // Bright greens, yellows, white
                break;
            case 'rare':
                particleCountMultiplier = 4;
                baseColors = ['#64B5F6', '#BBDEFB', '#FFFFFF', '#81D4FA', '#E1F5FE']; // Bright blues, white
                break;
            case 'legendary':
                particleCountMultiplier = 6;
                baseColors = ['#FFD54F', '#FFEE58', '#FFF59D', '#FFFFFF', '#FFCA28', '#FFB300', '#CFB53B']; // Golds, yellows, white
                break;
            case 'ultraRare': // Assuming ultraRare is a step above legendary
                particleCountMultiplier = 8;
                baseColors = ['#FF4081', '#F8BBD0', '#AD1457', '#FFFFFF', '#FFD700', '#FFAB00', '#FF6D00', '#E0E0E0']; // Pinks, purples, golds, silvers
                break;
            default:
                particleCountMultiplier = 1;
        }

        const particleCount = Math.floor(30 * particleCountMultiplier); // Base of 30 particles, scaled by rarity

        for (let i = 0; i < particleCount; i++) {
            const color = baseColors[Math.floor(Math.random() * baseColors.length)];
            const angle = Math.random() * Math.PI * 2; // Random direction
            const speed = 2 + Math.random() * (3 * particleCountMultiplier); // Higher rarity = potentially faster particles
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            const size = 2 + Math.random() * (2 + particleCountMultiplier / 2); // Slightly larger particles for rarer items
            const lifespan = 500 + Math.random() * 1000 * (1 + particleCountMultiplier / 5); // Longer lifespan for rarer particles

            this.particles.push(
                GameUtils.createParticle(
                    this.hat.x,
                    this.hat.y,
                    color,
                    size,
                    { vx: velocityX, vy: velocityY, lifespan: lifespan, fades: true, shrinks: true }
                )
            );
        }
    }

    update(currentTime) {
        const progress = super.update(currentTime);
        if (progress === false) return;

        // Scale and fade in the hat
        this.hat.scale = GameUtils.Easing.bounce(progress);
        this.hat.alpha = progress;

        // Update particles
        this.particles = GameUtils.updateParticles(this.particles);
    }

    draw(ctx) {
        GameUtils.drawParticles(ctx, this.particles);
    }
}

// Animation manager to handle multiple animations
class AnimationManager {
    constructor() {
        this.animations = [];
    }

    add(animation) {
        this.animations.push(animation);
        animation.start();
    }

    update(currentTime) {
        this.animations = this.animations.filter(animation => {
            return animation.update(currentTime) !== false;
        });
    }

    draw(ctx) {
        this.animations.forEach(animation => {
            if (animation.draw) animation.draw(ctx);
        });
    }
}

// Export animation system
export const AnimationSystem = {
    Animation,
    SquashStretchAnimation,
    HairballAnimation,
    HatRevealAnimation,
    AnimationManager,
};