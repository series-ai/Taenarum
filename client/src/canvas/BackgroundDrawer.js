import { loadImage } from '../gameConfig'; // Assuming gameConfig is in src

// Simplified Background class for drawing
class BackgroundDrawer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.image = null;
    this.loadBackgroundImage('/assets/livingroom-day.png'); // Path for public/assets/
  }

  async loadBackgroundImage(src) {
    try {
      this.image = await loadImage(src);
      console.log('Background image loaded for React component', this.image);
    } catch (error) {
      console.error('Failed to load background image for React component:', error);
    }
  }

  draw() {
    if (!this.image || !this.canvas || !this.ctx) {
      // console.log('Waiting for background image or canvas context...');
      return;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const scale = Math.max(
      this.canvas.width / this.image.width,
      this.canvas.height / this.image.height
    );
    const scaledWidth = this.image.width * scale;
    const scaledHeight = this.image.height * scale;
    const x = (this.canvas.width - scaledWidth) / 2;
    const y = (this.canvas.height - scaledHeight) / 2;
    this.ctx.drawImage(this.image, x, y, scaledWidth, scaledHeight);
  }

  // handleResize could be called if canvas CSS dimensions change relative to pixel dimensions
  // For now, direct canvas.width/height update in resize listener is more direct.
}

export default BackgroundDrawer; 