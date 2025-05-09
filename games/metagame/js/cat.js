// Cat class to handle the cat's behavior and state

class Cat {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Cat properties
        this.x = canvas.width / 2;
        this.y = canvas.height * 0.4; // Position cat in upper portion of screen
        this.scale = Math.min(canvas.width / 1500, canvas.height / 1500) * 1.6; // Doubled from 0.8 to 1.6
        this.rotation = 0;
        this.alpha = 1;
        
        // Animation states
        this.isIdle = true;
        this.isEating = false;
        this.isCoughing = false;
        this.isClickAnimating = false;
        this.blockingTaps = false;
        this.coughPauseTime = 0;
        
        // Sprite properties
        this.spritesheet = null;
        this.frameWidth = 287; // Correct width of each frame
        this.frameHeight = 287; // Correct height of each frame
        this.currentFrame = 0; // First frame
        this.frameCount = 0;
        this.frameDelay = 16; // Default animation speed
        this.coughFrameDelay = 32; // Slower animation for coughing
        this.eatFrame0Delay = 48; // 3x longer for frame 0 of eating
        this.totalFrames = 3; // 3 frames per animation
        this.animationRow = 2; // Third row (index 2)
        
        // Avatar properties
        this.avatar = null;
        this.currentHat = null;
    }
    
    async loadSprites() {
        try {
            this.spritesheet = await GameUtils.loadImage('assets/fatcat.png');
            console.log('Loaded cat spritesheet:', this.spritesheet);
            return true;
        } catch (error) {
            console.error('Failed to load cat spritesheet:', error);
            return false;
        }
    }
    
    update() {
        if (this.isCoughing) {
            // Handle initial pause
            if (this.coughPauseTime > 0) {
                this.coughPauseTime--;
                return;
            }
            
            this.frameCount++;
            if (this.frameCount >= this.coughFrameDelay) {
                this.frameCount = 0;
                this.currentFrame++;
                if (this.currentFrame >= this.totalFrames) {
                    this.currentFrame = 0; // Loop coughing animation
                }
            }
            return;
        }

        this.frameCount++;
        
        // Use different delays for eating animation frame 0
        const currentDelay = (this.isEating && this.currentFrame === 0) ? 
            this.eatFrame0Delay : this.frameDelay;
            
        if (this.frameCount >= currentDelay) {
            this.frameCount = 0;
            
            if (this.isClickAnimating) {
                this.currentFrame++;
                if (this.currentFrame >= this.totalFrames) {
                    this.isClickAnimating = false;
                    this.currentFrame = 0;
                    this.animationRow = 2; // Return to idle state (row 2)
                }
            } else if (this.isEating) {
                this.currentFrame++;
                if (this.currentFrame >= this.totalFrames) {
                    this.isEating = false;
                    this.currentFrame = 0;
                    this.animationRow = 2; // Return to idle state (row 2)
                }
            } else {
                // Idle state
                this.currentFrame = 0;
                this.animationRow = 2; // Row 2 for idle
            }
        }
    }
    
    draw() {
        if (!this.spritesheet) {
            console.warn('No spritesheet loaded yet');
            return;
        }
        
        this.ctx.save();
        
        // Apply transformations
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.globalAlpha = this.alpha;
        
        // Draw source frame debug
        const sourceX = this.currentFrame * this.frameWidth;
        const sourceY = this.animationRow * this.frameHeight;
        
        // Draw the current frame from the spritesheet
        try {
            this.ctx.drawImage(
                this.spritesheet,
                sourceX,
                sourceY,
                this.frameWidth,
                this.frameHeight,
                -this.frameWidth, // Center point moved left to account for 2x width
                -this.frameHeight / 2,
                this.frameWidth * 2, // Make the cat 2x wider
                this.frameHeight
            );
        } catch (error) {
            console.error('Error drawing cat:', error);
        }
        
        this.ctx.restore();

        // Draw avatar if exists - now positioned independently
        if (this.avatar?.sprite?.image) {
            this.ctx.save();
            
            // Position avatar in fixed location on screen - using frameWidth for consistent square scaling
            const baseSize = this.avatar.sprite.frameWidth;
            const avatarScale = (this.canvas.width / 1500) * 1.8; // Reduced from 2.4 to 1.8 for better proportions
            const padding = 20; // Padding from screen edge
            const avatarX = padding + (baseSize * avatarScale / 2) + 20; // Added 20px to the right
            const avatarY = this.canvas.height - padding - (baseSize * avatarScale / 2) - 150; // Moved up 150px
            
            this.ctx.translate(avatarX, avatarY);
            this.ctx.scale(-avatarScale, avatarScale); // Flip horizontally by using negative scale
            
            // Draw avatar image
            const sprite = this.avatar.sprite;
            this.ctx.drawImage(
                sprite.image,
                -baseSize / 2,
                -baseSize / 2,
                baseSize,
                baseSize
            );
            
            // Draw name tag - need to flip back for text
            this.ctx.scale(-1, 1); // Flip back horizontally for text
            this.ctx.font = '16px Arial'; // Reduced from 24px to 16px
            this.ctx.fillStyle = '#666';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.avatar.displayName, 0, baseSize / 2 + 20); // Using baseSize instead of frameHeight
            
            this.ctx.restore();
        }
    }
    
    startEating() {
        this.isIdle = false;
        this.isEating = true;
        this.isCoughing = false;
        this.currentFrame = 0; // Reset animation frame when starting new animation
        
        // Play eating sound
        GameUtils.playSound('assets/sounds/eating.mp3');
    }
    
    stopEating() {
        this.isIdle = true;
        this.isEating = false;
        this.isCoughing = false;
        this.currentFrame = 0;
    }
    
    startCoughing() {
        this.isCoughing = true;
        this.currentFrame = 0;
        this.animationRow = 1; // Row 1 for hairball animation
        this.frameCount = 0;
        this.coughPauseTime = 60; // 60 frames = ~1 second at 60fps
        
        // Block taps for 2 seconds
        this.blockingTaps = true;
        setTimeout(() => {
            this.blockingTaps = false;
        }, 2000);
    }
    
    stopCoughing() {
        this.isIdle = true;
        this.isEating = false;
        this.isCoughing = false;
        this.currentFrame = 0;
    }
    
    isBlockingTaps() {
        return this.blockingTaps;
    }
    
    wearHat(hat) {
        this.currentHat = hat;
        // Update the hat icon in the menu
        const game = document.getElementById('game-container').__game;
        if (game) {
            game.updateHatIcon();
        }
    }
    
    removeHat() {
        this.currentHat = null;
    }
    
    drawHat() {
        if (!this.currentHat || !this.currentHat.image) return;
        
        this.ctx.save();
        
        // Apply the same transformations as the cat
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.globalAlpha = this.alpha;
        
        // Position the hat above the cat's head, adjusted for position
        const hatY = -this.frameHeight / 2 - this.currentHat.height / 4 + 85; // 90 - 5
        const hatX = 20;
        
        // Draw the hat
        this.currentHat.draw(this.ctx, hatX, hatY, 0.8);
        
        this.ctx.restore();
    }

    handleResize() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height * 0.4;
        // Adjust scale to be smaller for better fit, doubled from 0.8 to 1.6
        this.scale = Math.min(this.canvas.width / 1500, this.canvas.height / 1500) * 1.6;
    }

    startClickAnimation() {
        // Check game state for treats
        const game = document.getElementById('treats-count');
        const hasTreats = parseInt(game.textContent) > 0;

        this.isClickAnimating = true;
        this.currentFrame = 0;
        // Use row 0 if has treats, row 2 if no treats
        this.animationRow = hasTreats ? 0 : 2;
    }

    async setAvatar(avatarId) {
        const avatarConfig = GameConfig.avatars.types.find(a => a.id === avatarId);
        if (!avatarConfig) return;

        this.avatar = {
            id: avatarConfig.id,
            displayName: avatarConfig.displayName,
            sprite: {
                image: await this.loadImage(avatarConfig.sprite.file),
                ...avatarConfig.sprite
            }
        };
    }

    async loadImage(filename) {
        try {
            return await GameUtils.loadImage(`assets/avatars/${filename}`);
        } catch (error) {
            console.error(`Failed to load image: ${filename}`, error);
            return null;
        }
    }
}

// Export Cat class
window.Cat = Cat; 