import { loadImage } from '../gameConfig'; // Assuming gameConfig is in src
// TODO: [Avatar Integration] Import getAvatarConfig from gameConfig if CatDrawer is to manage its own avatar data loading.
// For now, expecting avatarConfig to be passed in.

class CatDrawer {
  constructor(canvas, ctx, chosenAvatarConfig) { // Changed initialAvatarConfig to chosenAvatarConfig
    this.canvas = canvas;
    this.ctx = ctx;
    this.chosenAvatarConfig = chosenAvatarConfig; // Store main interactive cat config
    this.spritesheet = null; // Spritesheet for the main interactive cat
    this.playerAvatarDisplay = null; // To store { image, name, frameWidth, frameHeight } for the small display

    this.x = canvas.width / 2;
    this.y = canvas.height * 0.4;
    this.scale = Math.min(canvas.width / 1500, canvas.height / 1500) * 1.6;
    this.rotation = 0;
    this.alpha = 1;

    this.isIdle = true;
    this.isEating = false;
    this.isCoughing = false;
    this.isClickAnimating = false;
    // this.blockingTaps = false; // Will be managed by React state if needed
    this.coughPauseTime = 0;

    this.equippedHatData = null;
    this.equippedHatImage = null;

    // Frame properties for the main interactive cat
    this.frameWidth = 287;
    this.frameHeight = 287;
    this.currentFrame = 0;
    this.animFrameCount = 0; // Renamed from frameCount to avoid confusion
    this.frameDelay = 16;
    this.coughFrameDelay = 32;
    this.eatFrame0Delay = 48;
    // TODO: totalFrames should ideally come from chosenAvatarConfig per animation type
    this.totalFrames = 3;
    this.animationRow = 2;

    this.loadMainCatSprites();
  }

  async loadMainCatSprites() { // Renamed from loadSprites
    try {
      this.spritesheet = await loadImage('assets/fatcat.png');
      console.log(`Main cat spritesheet loaded: assets/fatcat.png`, this.spritesheet);
    } catch (error) {
      console.error(`Failed to load main cat spritesheet: ${this.spritesheetPath}`, error);
    }
  }

  // Method to set the small player avatar display
  async setPlayerAvatarDisplay(playerAvatarConfig) {
    if (!playerAvatarConfig) {
      this.playerAvatarDisplay = null;
      console.log("CatDrawer: Player avatar display cleared.");
      return;
    }
    console.log("CatDrawer: setting player avatar display to", playerAvatarConfig.name);
    try {
      const image = await loadImage(playerAvatarConfig.spritesheetPath);
      this.playerAvatarDisplay = {
        image: image,
        name: playerAvatarConfig.name,
        frameWidth: playerAvatarConfig.frameWidth, // Used for consistent scaling of avatar display
        frameHeight: playerAvatarConfig.frameHeight, // Used for consistent scaling of avatar display
        // Store other necessary details if needed, e.g., specific offsets for this display
      };
      console.log("CatDrawer: Player avatar display image loaded for", playerAvatarConfig.name);
    } catch (error) {
      console.error(`Failed to load player avatar display image: ${playerAvatarConfig.spritesheetPath}`, error);
      this.playerAvatarDisplay = null; // Clear if loading failed
    }
  }

  update() {
    if (!this.spritesheet) return;

    if (this.isCoughing) {
      if (this.coughPauseTime > 0) {
        this.coughPauseTime--;
        return;
      }
      this.animFrameCount++;
      if (this.animFrameCount >= this.coughFrameDelay) {
        this.animFrameCount = 0;
        this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      }
      return;
    }

    this.animFrameCount++;
    const currentDelay = (this.isEating && this.currentFrame === 0) ? this.eatFrame0Delay : this.frameDelay;

    if (this.animFrameCount >= currentDelay) {
      this.animFrameCount = 0;
      if (this.isClickAnimating || this.isEating) {
        this.currentFrame++;
        if (this.currentFrame >= this.totalFrames) {
          this.isClickAnimating = false;
          this.isEating = false;
          this.currentFrame = 0;
          this.animationRow = this.chosenAvatarConfig.animationRows.idle;
          this.isIdle = true;
        }
      } else {
        this.currentFrame = 0;
        this.animationRow = this.chosenAvatarConfig.animationRows.idle;
        this.isIdle = true;
      }
    }
  }

  draw() {
    if (!this.canvas || !this.ctx) return;

    // Draw main interactive cat
    if (this.spritesheet) {
      this.ctx.save();
      this.ctx.translate(this.x, this.y);
      this.ctx.rotate(this.rotation);
      this.ctx.scale(this.scale, this.scale);
      this.ctx.globalAlpha = this.alpha;

      const sourceX = this.currentFrame * this.frameWidth;
      const sourceY = this.animationRow * this.frameHeight;

      try {
        this.ctx.drawImage(
          this.spritesheet,
          sourceX, sourceY,
          this.frameWidth, this.frameHeight,
          -this.frameWidth / 2, -this.frameHeight / 2,
          this.frameWidth, this.frameHeight
        );
      } catch (error) {
        console.error('Error drawing main cat:', error);
      }
      this.ctx.restore();
      this.drawHat(); // Draw hat after main cat
    }

    // Draw the small player avatar display
    this.drawPlayerAvatarDisplay();
  }

  drawPlayerAvatarDisplay() {
    if (!this.playerAvatarDisplay || !this.playerAvatarDisplay.image || !this.canvas || !this.ctx) {
      return;
    }

    this.ctx.save();

    // Consistent sizing and positioning logic adapted from original cat.js
    const baseSize = this.playerAvatarDisplay.frameWidth; // Use avatar's own frameWidth for base
    const avatarScale = (this.canvas.width / 1500) * 1.2; // Adjusted scale for display icon
    const padding = 20;
    const avatarX = padding + (baseSize * avatarScale / 2) + 10; // Minor x adjustment
    const avatarY = this.canvas.height - padding - (baseSize * avatarScale / 2) - 20; // Positioned lower

    this.ctx.translate(avatarX, avatarY);
    this.ctx.scale(avatarScale, avatarScale); // Normal scale, no flip needed if sprites are oriented correctly

    // Draw avatar image (first frame, top-left of its sprite)
    try {
      this.ctx.drawImage(
        this.playerAvatarDisplay.image,
        0, // Assuming first frame of spritesheet is the preview
        0,
        this.playerAvatarDisplay.frameWidth, // Use actual frame width of the avatar sprite
        this.playerAvatarDisplay.frameHeight, // Use actual frame height of the avatar sprite
        -this.playerAvatarDisplay.frameWidth / 2, // Center the drawn sprite
        -this.playerAvatarDisplay.frameHeight / 2,
        this.playerAvatarDisplay.frameWidth,
        this.playerAvatarDisplay.frameHeight
      );
    } catch (error) {
      console.error('Error drawing player avatar display image:', error);
    }

    // Draw name tag
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#333'; // Darker text
    this.ctx.textAlign = 'center';
    // Position name below the avatar image
    this.ctx.fillText(this.playerAvatarDisplay.name, 0, (this.playerAvatarDisplay.frameHeight / 2) + 20);

    this.ctx.restore();
  }

  handleResize() {
    if (!this.canvas) return;
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height * 0.4;
    this.scale = Math.min(this.canvas.width / 1500, this.canvas.height / 1500) * 1.6;

    // Reset animation state for the main cat
    this.currentFrame = 0;
    this.animFrameCount = 0;
    this.animationRow = this.chosenAvatarConfig.animationRows.idle;
    this.isIdle = true;
    this.isEating = false;
    this.isCoughing = false;
    this.isClickAnimating = false;
    console.log("CatDrawer: resized, scale:", this.scale, "y:", this.y);
  }

  startEating() {
    console.log("CatDrawer: startEating");
    this.isIdle = false;
    this.isEating = true;
    this.isCoughing = false;
    this.isClickAnimating = false;
    this.currentFrame = 0;
    this.animFrameCount = 0;
    this.animationRow = this.chosenAvatarConfig.animationRows.eating;
  }

  startCoughing() {
    console.log("CatDrawer: startCoughing");
    this.isIdle = false;
    this.isEating = false;
    this.isCoughing = true;
    this.isClickAnimating = false;
    this.currentFrame = 0;
    this.animFrameCount = 0;
    this.animationRow = this.chosenAvatarConfig.animationRows.coughing;
    this.coughPauseTime = 60;
  }

  startClickAnimation(hasTreats) {
    console.log("CatDrawer: startClickAnimation, hasTreats:", hasTreats);
    if (this.isEating || this.isCoughing) return;
    this.isIdle = false;
    this.isClickAnimating = true;
    this.currentFrame = 0;
    this.animFrameCount = 0;
    // Use main cat's config for animation rows
    const clickAnimRow = this.chosenAvatarConfig.animationRows.clickWithTreats !== undefined
      ? this.chosenAvatarConfig.animationRows.clickWithTreats
      : this.chosenAvatarConfig.animationRows.eating;

    this.animationRow = hasTreats
      ? clickAnimRow
      : this.chosenAvatarConfig.animationRows.idle;
  }

  async wearHat(hatData) {
    if (!hatData) {
      this.equippedHatData = null;
      this.equippedHatImage = null;
      console.log("CatDrawer: hat unequipped");
      return;
    }
    this.equippedHatData = hatData;
    this.equippedHatImage = null;
    console.log("CatDrawer: attempting to wear hat", hatData.name);
    try {
      this.equippedHatImage = await loadImage(hatData.imagePath);
      console.log("CatDrawer: hat image loaded", hatData.name, this.equippedHatImage);
    } catch (error) {
      console.error("CatDrawer: failed to load hat image", hatData.name, error);
      this.equippedHatData = null;
    }
  }

  drawHat() {
    if (!this.equippedHatImage || !this.ctx) return;

    // Use main cat's config for head offset
    const headOffset = this.chosenAvatarConfig.headOffset || { x: 0, y: -this.frameHeight / 2.5 };
    const hatXOffset = headOffset.x;
    const hatYOffset = headOffset.y;
    const hatScale = this.equippedHatData.scale || 0.5;

    this.ctx.save();
    // Position relative to the main cat's draw position and scale
    this.ctx.translate(this.x + (hatXOffset * this.scale), this.y + (hatYOffset * this.scale));
    this.ctx.scale(this.scale * hatScale, this.scale * hatScale); // Apply main cat's scale and hat's own scale
    this.ctx.globalAlpha = this.alpha;

    try {
      const hatWidth = this.equippedHatImage.width;
      const hatHeight = this.equippedHatImage.height;
      this.ctx.drawImage(
        this.equippedHatImage,
        -hatWidth / 2, -hatHeight / 2,
        hatWidth, hatHeight
      );
    } catch (error) {
      console.error('Error drawing hat:', error);
    }
    this.ctx.restore();
  }
}

export default CatDrawer; 