import { loadImage } from '../gameConfig'; // Assuming gameConfig is in src
// TODO: [Avatar Integration] Import getAvatarConfig from gameConfig if CatDrawer is to manage its own avatar data loading.
// For now, expecting avatarConfig to be passed in.

class CatDrawer {
  constructor(canvas, ctx) { // Changed initialAvatarConfig to chosenAvatarConfig
    const fatCatConfig = { // This might be fatCatConfig or similar
      frameWidth: 287, // Ensure these match your spritesheet frame dimensions
      frameHeight: 287,

      framesPerRow: 3, // Number of frames in each row of the spritesheet

      animationSequences: {
        idle: [6, 1, 2],     // As per your request
        eating: [7, 8, 0],   // As per your request
        coughing: [4, 5, 3], // As per your request
      },
    };

    this.canvas = canvas;
    this.ctx = ctx;
    this.chosenAvatarConfig = fatCatConfig;
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

    // Frame properties from spritesheet (assuming consistent for all frames)
    this.frameWidth = this.chosenAvatarConfig.frameWidth;
    this.frameHeight = this.chosenAvatarConfig.frameHeight;

    // Animation timing
    this.currentFrame = 0; // Index within the current animation's sequence
    this.animFrameCount = 0;
    this.frameDelay = 16; // Default delay
    this.coughFrameDelay = 32;
    this.eatFrame0Delay = 48;

    // New animation system properties
    this.framesPerRow = this.chosenAvatarConfig.framesPerRow;
    this.animationSequences = this.chosenAvatarConfig.animationSequences;
    this.currentAnimationType = 'idle'; // Default animation state

    if (!this.framesPerRow || !this.animationSequences || !this.animationSequences.idle) {
      console.error("CatDrawer: chosenAvatarConfig must include framesPerRow and animationSequences (with at least 'idle' sequence). Animation might not work.");
      this.currentSequence = []; // Prevent errors if not configured
      this.totalFrames = 0;
    } else {
      this.currentSequence = this.animationSequences.idle;
      this.totalFrames = this.currentSequence.length; // totalFrames for the current animation
    }
    // this.animationRow = 2; // This is now obsolete for main cat animation if using sequences

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
  async setPlayerAvatarDisplay({
    spritesheetPath,
    name,
    frameWidth,
    frameHeight,
  }) {
    if (!spritesheetPath) {
      this.playerAvatarDisplay = null;
      console.log("CatDrawer: Player avatar display cleared.");
      return;
    }
    console.log("CatDrawer: setting player avatar display to", name);
    try {
      const image = await loadImage(spritesheetPath);
      this.playerAvatarDisplay = {
        image: image,
        name: name,
        frameWidth: frameWidth, // Used for consistent scaling of avatar display
        frameHeight: frameHeight, // Used for consistent scaling of avatar display
        // Store other necessary details if needed, e.g., specific offsets for this display
      };
      console.log("CatDrawer: Player avatar display image loaded for", name);
    } catch (error) {
      console.error(`Failed to load player avatar display image: ${spritesheetPath}`, error);
      this.playerAvatarDisplay = null; // Clear if loading failed
    }
  }

  update() {
    if (!this.spritesheet || !this.currentSequence || this.currentSequence.length === 0) return;

    if (this.isCoughing) {
      if (this.coughPauseTime > 0) {
        this.coughPauseTime--;
        return;
      }
      this.animFrameCount++;
      if (this.animFrameCount >= this.coughFrameDelay) {
        this.animFrameCount = 0;
        // Ensure totalFrames is for coughing sequence
        if (this.animationSequences.coughing && this.totalFrames > 0 && this.currentAnimationType === 'coughing') {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        } else {
            this.currentFrame = 0; 
        }
      }
      return;
    }

    this.animFrameCount++;
    const currentDelay = (this.isEating && this.currentFrame === 0 && this.currentAnimationType === 'eating') ? this.eatFrame0Delay : this.frameDelay;

    if (this.animFrameCount >= currentDelay) {
      this.animFrameCount = 0;
      this.currentFrame++; // Advance frame in the current sequence

      // Check if current animation has ended
      if (this.currentFrame >= this.totalFrames) {
        if (this.isEating || this.isClickAnimating) {
          // Transition from eating/clicking to idle
          this.isEating = false;
          this.isClickAnimating = false;
          this.isIdle = true;
          this.currentAnimationType = 'idle';
          this.currentSequence = this.animationSequences.idle;
          this.totalFrames = this.currentSequence.length;
          this.currentFrame = 0; // Start idle animation from its first frame
        } else if (this.isIdle) {
          // Loop idle animation
          this.currentFrame = 0; // Reset to start of idle sequence (or (this.currentFrame + 1) % this.totalFrames for continuous loop)
                                 // For simplicity, resetting to 0 to match original single-frame idle behavior before it animates again.
                                 // If idle is multi-frame and should loop continuously, use: (this.currentFrame +1) % this.totalFrames
                                 // Given user provided [6,1,2] for idle, it should loop. So let's make it loop.
          this.currentFrame = 0; // Restart the idle sequence
        } else {
          // Fallback: if an animation ended but it wasn't a known active one, default to idle.
          this.isIdle = true;
          this.currentAnimationType = 'idle';
          this.currentSequence = this.animationSequences.idle;
          this.totalFrames = this.currentSequence.length;
          this.currentFrame = 0;
        }
      }
    }
  }

  draw() {
    if (!this.canvas || !this.ctx) return;

    // Draw main interactive cat
    if (this.spritesheet && this.currentSequence && this.currentSequence.length > 0 && this.framesPerRow > 0) {
      this.ctx.save();
      this.ctx.translate(this.x, this.y);
      this.ctx.rotate(this.rotation);
      this.ctx.scale(this.scale, this.scale);
      this.ctx.globalAlpha = this.alpha;

      const absoluteFrameId = this.currentSequence[this.currentFrame];
      const frameCol = absoluteFrameId % this.framesPerRow;
      const frameRow = Math.floor(absoluteFrameId / this.framesPerRow);

      const sourceX = frameCol * this.frameWidth;
      const sourceY = frameRow * this.frameHeight;

      try {
        this.ctx.drawImage(
          this.spritesheet,
          sourceX,
          sourceY,
          this.frameWidth,
          this.frameHeight,
          -this.frameWidth / 2 - 140,
          -this.frameHeight / 2 - 100,
          this.frameWidth * 2,
          this.frameHeight * 2
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
    this.isIdle = true;
    this.isEating = false;
    this.isCoughing = false;
    this.isClickAnimating = false;
    
    this.currentAnimationType = 'idle';
    if (this.animationSequences && this.animationSequences.idle) {
        this.currentSequence = this.animationSequences.idle;
        this.totalFrames = this.currentSequence.length;
    } else {
        console.error("CatDrawer: 'idle' sequence not found on resize. Animations may not work.");
        this.currentSequence = [];
        this.totalFrames = 0;
    }
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

    this.currentAnimationType = 'eating';
    if (this.animationSequences && this.animationSequences.eating) {
      this.currentSequence = this.animationSequences.eating;
      this.totalFrames = this.currentSequence.length;
    } else {
      console.error("CatDrawer: 'eating' sequence not found. Falling back to idle if possible.");
      this.currentAnimationType = 'idle'; // Fallback
      this.currentSequence = this.animationSequences.idle || [];
      this.totalFrames = this.currentSequence.length;
    }
  }

  startCoughing() {
    console.log("CatDrawer: startCoughing");
    this.isIdle = false;
    this.isEating = false;
    this.isCoughing = true;
    this.isClickAnimating = false;
    this.currentFrame = 0;
    this.animFrameCount = 0;
    
    this.currentAnimationType = 'coughing';
    if (this.animationSequences && this.animationSequences.coughing) {
      this.currentSequence = this.animationSequences.coughing;
      this.totalFrames = this.currentSequence.length;
    } else {
      console.error("CatDrawer: 'coughing' sequence not found. Falling back to idle if possible.");
      this.currentAnimationType = 'idle'; // Fallback
      this.currentSequence = this.animationSequences.idle || [];
      this.totalFrames = this.currentSequence.length;
    }
    this.coughPauseTime = 60; // Reset pause time for coughing
  }

  startClickAnimation(hasTreats) {
    console.log("CatDrawer: startClickAnimation, hasTreats:", hasTreats);
    if (this.isEating || this.isCoughing) return;
    this.isIdle = false;
    this.isClickAnimating = true;
    this.currentFrame = 0;
    this.animFrameCount = 0;

    let sequenceName;
    if (hasTreats) {
      // Try 'clickWithTreats', fallback to 'eating'
      sequenceName = (this.animationSequences && this.animationSequences.clickWithTreats) ? 'clickWithTreats' : 'eating';
    } else {
      // Try 'clickNoTreats', fallback to 'idle'
      sequenceName = (this.animationSequences && this.animationSequences.clickNoTreats) ? 'clickNoTreats' : 'idle';
    }

    if (this.animationSequences && this.animationSequences[sequenceName]) {
      this.currentAnimationType = sequenceName;
      this.currentSequence = this.animationSequences[sequenceName];
      this.totalFrames = this.currentSequence.length;
    } else {
      console.warn(`CatDrawer: Animation sequence '${sequenceName}' not found. Defaulting to idle.`);
      this.currentAnimationType = 'idle';
      this.currentSequence = this.animationSequences.idle || [];
      this.totalFrames = this.currentSequence.length;
    }
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