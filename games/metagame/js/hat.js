class Hat {
    constructor(id, name, rarity, imagePath) {
        this.id = id;
        this.name = name;
        this.rarity = rarity;
        this.imagePath = imagePath;
        this.image = null;
        this.isUnlocked = false;
        this.width = 128;  // Default size, will be updated when image loads
        this.height = 128;
        this.loadImage();
    }

    async loadImage() {
        try {
            this.image = await GameUtils.loadImage(this.imagePath);
            this.width = this.image.width;
            this.height = this.image.height;
            console.log(`Loaded hat image: ${this.name}`, this.width, 'x', this.height);
        } catch (error) {
            console.error(`Failed to load hat image: ${this.name}`, error);
        }
    }

    draw(ctx, x, y, scale = 1) {
        if (!this.image) return;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale * 2, scale); // Scale width 2x, keep height the same
        
        // Draw centered
        ctx.drawImage(
            this.image,
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
        
        ctx.restore();
    }
}

// Export Hat class
window.Hat = Hat; 