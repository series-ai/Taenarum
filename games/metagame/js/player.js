class Player {
    constructor() {
        this.avatar = null;
        this.hat = null;
        this.frameTime = 0;
        this.currentFrame = 0;
        this.currentAnimation = 'idle';
        this.loadPlayerData();
    }

    async loadPlayerData() {
        // Load saved player data or use defaults
        const saved = localStorage.getItem('playerData');
        const data = saved ? JSON.parse(saved) : GameConfig.defaultPlayer;

        // Load avatar
        const avatarConfig = GameConfig.avatars.types.find(a => a.id === data.avatarId);
        if (avatarConfig) {
            this.avatar = {
                id: avatarConfig.id,
                displayName: avatarConfig.displayName,
                sprite: {
                    image: await this.loadImage(avatarConfig.sprite.file),
                    ...avatarConfig.sprite
                }
            };
            this.setAnimation('idle');
        }

        // Load hat if one is equipped
        if (data.hatId) {
            const hatConfig = GameConfig.hats.find(h => h.id === data.hatId);
            if (hatConfig) {
                this.hat = {
                    id: hatConfig.id,
                    name: hatConfig.name,
                    rarity: hatConfig.rarity,
                    image: await this.loadImage(`hats/${hatConfig.file}`)
                };
            }
        }
    }

    async loadImage(filename) {
        try {
            return await GameUtils.loadImage(`assets/avatars/${filename}`);
        } catch (error) {
            console.error(`Failed to load image: ${filename}`, error);
            return null;
        }
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
        this.setAnimation('idle');
        this.savePlayerData();
    }

    setAnimation(name) {
        if (!this.avatar?.sprite?.animations[name]) return;
        
        this.currentAnimation = name;
        this.currentFrame = 0;
        this.frameTime = 0;
    }

    update(deltaTime) {
        if (!this.avatar?.sprite) return;

        const animation = this.avatar.sprite.animations[this.currentAnimation];
        if (!animation) return;

        // Update frame based on animation speed
        this.frameTime += deltaTime;
        const frameDelay = GameConfig.avatars.animationSpeed[this.currentAnimation] || 150;
        
        if (this.frameTime >= frameDelay) {
            this.frameTime = 0;
            this.currentFrame = (this.currentFrame + 1) % animation.frames;
        }
    }

    draw(ctx, x, y, scale = 1) {
        if (!this.avatar?.sprite?.image) return;

        const sprite = this.avatar.sprite;
        const animation = sprite.animations[this.currentAnimation];
        if (!animation) return;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Draw current frame of animation
        ctx.drawImage(
            sprite.image,
            this.currentFrame * sprite.frameWidth,
            animation.row * sprite.frameHeight,
            sprite.frameWidth,
            sprite.frameHeight,
            -sprite.frameWidth / 2,
            -sprite.frameHeight / 2,
            sprite.frameWidth,
            sprite.frameHeight
        );

        // Draw hat if equipped
        if (this.hat?.image) {
            const hatY = -sprite.frameHeight / 2 - this.hat.image.height / 4 + 85;
            const hatX = 20;
            ctx.drawImage(
                this.hat.image,
                hatX - this.hat.image.width,
                hatY,
                this.hat.image.width * 2,
                this.hat.image.height
            );
        }

        ctx.restore();
    }

    savePlayerData() {
        const data = {
            avatarId: this.avatar?.id || GameConfig.defaultPlayer.avatarId,
            hatId: this.hat?.id || null
        };
        localStorage.setItem('playerData', JSON.stringify(data));
    }
}

// Export Player class
window.Player = Player; 