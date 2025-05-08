class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.image = null;
        this.loadBackground();
    }

    async loadBackground() {
        try {
            console.log('Starting to load background image...');
            this.image = await GameUtils.loadImage('assets/fishbg.png');
            console.log('Successfully loaded background image:', this.image.width, 'x', this.image.height);
        } catch (error) {
            console.error('Failed to load background image:', error);
            // Try alternate path
            try {
                console.log('Trying alternate path...');
                this.image = await GameUtils.loadImage('fishbg.png');
                console.log('Successfully loaded background image from alternate path');
            } catch (altError) {
                console.error('Failed to load from alternate path:', altError);
            }
        }
    }

    draw() {
        if (!this.image) {
            console.warn('No background image available to draw');
            return;
        }

        // Calculate scaling to cover the entire canvas while maintaining aspect ratio
        const scale = Math.max(
            this.canvas.width / this.image.width,
            this.canvas.height / this.image.height
        );

        const scaledWidth = this.image.width * scale;
        const scaledHeight = this.image.height * scale;

        // Center the background
        const x = (this.canvas.width - scaledWidth) / 2;
        const y = (this.canvas.height - scaledHeight) / 2;

        this.ctx.drawImage(
            this.image,
            x, y,
            scaledWidth,
            scaledHeight
        );
    }

    handleResize() {
        // No additional handling needed as draw() already handles scaling
    }
}

// Export Background class
window.Background = Background; 