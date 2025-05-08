class Player {
    constructor() {
        this.avatar = null;
        this.hat = null;
        this.loadPlayerData();
    }

    async loadPlayerData() {
        // Load saved player data or use defaults
        const saved = localStorage.getItem('playerData');
        const data = saved ? JSON.parse(saved) : GameConfig.defaultPlayer;

        // Load avatar
        const avatarConfig = GameConfig.avatars.find(a => a.id === data.avatarId);
        if (avatarConfig) {
            this.avatar = {
                id: avatarConfig.id,
                name: avatarConfig.name,
                image: await this.loadImage(avatarConfig.file)
            };
        }

        // Load hat if one is equipped
        if (data.hatId) {
            const hatConfig = GameConfig.hats.find(h => h.id === data.hatId);
            if (hatConfig) {
                this.hat = {
                    id: hatConfig.id,
                    name: hatConfig.name,
                    rarity: hatConfig.rarity,
                    image: await this.loadImage(hatConfig.file)
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
        const avatarConfig = GameConfig.avatars.find(a => a.id === avatarId);
        if (!avatarConfig) return;

        this.avatar = {
            id: avatarConfig.id,
            name: avatarConfig.name,
            image: await this.loadImage(avatarConfig.file)
        };

        this.savePlayerData();
    }

    async setHat(hatId) {
        if (!hatId) {
            this.hat = null;
        } else {
            const hatConfig = GameConfig.hats.find(h => h.id === hatId);
            if (!hatConfig) return;

            this.hat = {
                id: hatConfig.id,
                name: hatConfig.name,
                rarity: hatConfig.rarity,
                image: await this.loadImage(hatConfig.file)
            };
        }

        this.savePlayerData();
    }

    savePlayerData() {
        const data = {
            avatarId: this.avatar?.id || GameConfig.defaultPlayer.avatarId,
            hatId: this.hat?.id || null
        };
        localStorage.setItem('playerData', JSON.stringify(data));
    }

    draw(ctx, x, y, scale = 1) {
        if (!this.avatar?.image) return;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Draw avatar
        const width = this.avatar.image.width;
        const height = this.avatar.image.height;
        ctx.drawImage(
            this.avatar.image,
            -width / 2,
            -height / 2,
            width,
            height
        );

        // Draw hat if equipped
        if (this.hat?.image) {
            const hatY = -height / 2 - this.hat.image.height / 4 + 85;
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
}

// Export Player class
window.Player = Player; 