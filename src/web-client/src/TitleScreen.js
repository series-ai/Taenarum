/*
TODO: Overall Game Migration from Vanilla JS Metagame to React

This component is a migration of a vanilla JavaScript game. Many features from the original
`games/metagame/` directory still need to be fully implemented or integrated.

--- GENERAL GAME LOGIC & STATE ---
- TODO: [State Management] Consider React Context or a lightweight state manager (e.g., Zustand) for shared game state if props drilling becomes too complex.
- TODO: [Config] Externalize game configurations (hat definitions, avatar definitions, rarity weights, initial player stats, animation settings, sound paths) 
  instead of hardcoding (see original `config.js`). This could be a separate JS/JSON file imported at the top.

--- HAT SYSTEM (Original: hat.js, hatCollection.js, parts of game.js) ---
- TODO: [UI - Hat Inventory Modal]
    - Manage visibility state (e.g., `isHatInventoryOpen`).
    - Connect "Hat Closet" button (`#hat-closet-button`) and inventory's "Close" button (`#close-inventory`) to toggle this visibility state.
    - Populate `#hats-grid` with hat items based on data from `hatCollection`, showing images, names, and locked/unlocked status.
    - Implement functionality for rarity filter buttons (`.rarity-filter`) to update the displayed hats in `#hats-grid`.
    - Handle selecting an unlocked hat from the inventory to equip it on the cat (should call `catDrawer.wearHat(hatData)`).

--- AVATAR SYSTEM (Original: implied by HTML, potentially player.js or config.js) ---
- TODO: [Data] Define Avatar class/object structure and load avatar configurations (e.g., ID, name, spritesheet path or image path).
- TODO: [Data] Implement Avatar collection/selection logic (similar to hats, track unlocked avatars if applicable).
- TODO: [UI - Avatar Selector Modal]
    - Manage visibility state (e.g., `isAvatarSelectorOpen`).
    - Connect "Change Avatar" button (`#avatar-button`) and selector's "Close" button (`#close-avatar-selector`) to toggle visibility.
    - Populate `#avatars-grid` with available/unlocked avatars, showing their images/names.
    - Handle selecting an avatar.
    - Update cat's appearance based on the selected avatar. This might involve:
        - Passing the selected avatar's spritesheet path to `CatDrawer`.
        - `CatDrawer` reloading its spritesheet or having different drawing logic per avatar.

--- CAT & CANVAS (Original: Cat.js, Background.js, Animations.js, Game.js loop) ---
- TODO: [Cat Sprites] Verify `animationRow` indices in `CatDrawer` for all actions (idle, eating, coughing, click-with-treats, click-no-treats)
  against the actual `fatcat.png` spritesheet layout. Adjust as necessary.
- TODO: [Cat Drawing] The original `cat.js` `draw()` method drew the cat sprite at `this.frameWidth * 2` width with an offset `-this.frameWidth`.
  The current `CatDrawer.draw()` is simplified. Review and match original visuals if required.
- TODO: [Cat Hat] Implement `CatDrawer.wearHat(hatData)` to store the current hat.
- TODO: [Cat Hat] Implement `CatDrawer.drawHat()`: needs to load the hat's image (if not already loaded) and draw it at the correct position
  relative to the cat's head, considering cat's scale and animation frame. (See original `cat.js -> drawHat`).
- TODO: [Cat State] Refine cat animation details in `CatDrawer` (frame rates, smooth transitions between states, e.g., from eating back to idle).
- TODO: [Cat Interaction] Consider implementing `CatDrawer.blockingTaps` (controlled by React state) to prevent interactions during critical animations,
  if the current brief flag-based approach in `startClickAnimation` is insufficient.
- TODO: [Advanced Animations] Investigate and migrate the `AnimationSystem` from `animations.js` (e.g., `AnimationSystem.AnimationManager`, `HairballAnimation`)
  This might be for effects like the hairball moving or special reveals. Consider using a React-friendly animation library or custom components.

--- UI & INTERACTIONS (Original: index.html, game.js) ---
- TODO: [Play Button] Implement functionality for the "Play" button (`#play-button`) if it's intended to do more than the current general click interaction (e.g., start game, tutorial).
- TODO: [Targeted Interaction] Refine `handleGameInteraction`: instead of the entire `ui-overlay`, consider making only the cat area on the canvas clickable for feeding.
  This would involve checking click coordinates against the cat's bounding box on the canvas.

--- SOUNDS (Original: utils.js, game.js, cat.js) ---
- TODO: [Sound System] Implement a robust sound management system. Preload sounds or load on demand.
  Play sounds for events: cat eating, coughing, hairball reveal, UI button clicks, etc. (Original `GameUtils.playSound`).
  Consider using a library like Howler.js or Web Audio API directly, managed via React hooks/context.

--- UTILITIES & CODE STRUCTURE ---
- TODO: [Refactor] Move `loadImage`, `BackgroundDrawer`, `CatDrawer` into their own files (e.g., under `src/web-client/src/game/` or `src/web-client/src/canvas/`)
  and import them into `TitleScreen.js`.
- TODO: [Game Utils] Create a `GameUtils.ts` (or `.js`) module for common functions like `getRandomRarity(weights)`, `RARITY_COLORS`, etc., from original `utils.js`.
- TODO: [Error Handling] Add more robust error handling (e.g., for image loading, state transitions).
- TODO: [Cleanup] Review and remove all temporary `console.log` statements once features are stable.

*/
import React from 'react';
import './styles.css'; // Import the newly added CSS file
import { fullnessThreshold, mockHat, allHats, rarityWeights, loadImage } from './gameConfig'; // Import configurations and loadImage
// It's likely you'll need to import the CSS from the metagame.
// For example, you might copy `games/metagame/styles.css` to this directory
// or a shared styles directory and then import it:
// import './styles.css'; // or e.g. import '../styles/metagame.css';
// Ensure your bundler is configured to handle CSS imports.

// TODO: Handle asset paths correctly. The paths below (e.g., "/assets/fish-treat.png")
// assume that assets from 'games/metagame/assets/' will be moved to the 'public/assets' folder
// of your React application (e.g., /Users/jasfour/dev/Taenarum/src/web-client/public/assets/).
// If your React project doesn't use a `public` folder in this way, or if you prefer
// to bundle assets, you can import them directly into the component:
// import fishTreatIcon from './assets/fish-treat.png'; // (adjust path as needed)
// and then use {fishTreatIcon} in the src attribute: <img src={fishTreatIcon} ... />

// TODO: The JavaScript files (utils.js, game.js, etc.) from the original 'games/metagame/js/'
// directory contain the game logic. This logic needs to be migrated into React components,
// custom hooks, and services. This migration only transforms the HTML structure into JSX
// and does not include the JavaScript logic.

// TODO: Canvas elements (<canvas id="gameCanvas"></canvas>) require special handling in React.
// You'll typically use a ref (React.useRef) to get direct access to the canvas DOM element
// and then use the useEffect hook to perform drawing operations and set up event listeners.

// Utility function to load an image (can be moved to a utils.js later)
// const loadImage = (src) => { // MOVED to gameConfig.js
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.onload = () => resolve(img);
//     img.onerror = (err) => reject(err); // Pass error object
//     img.src = src;
//   });
// };

// Simplified Background class for drawing (can be moved to its own file later)
class BackgroundDrawer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.image = null;
    this.loadBackgroundImage('/assets/fishbg.png'); // Path for public/assets/
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

class CatDrawer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.spritesheet = null;
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

    this.frameWidth = 287;
    this.frameHeight = 287;
    this.currentFrame = 0;
    this.frameCount = 0; // Renamed from original to avoid conflict with sprite frameCount
    this.animFrameCount = 0; // Internal counter for animation frame delay
    this.frameDelay = 16;
    this.coughFrameDelay = 32;
    this.eatFrame0Delay = 48;
    this.totalFrames = 3;
    this.animationRow = 2; // Idle

    this.loadSprites();
  }

  async loadSprites() {
    try {
      this.spritesheet = await loadImage('/assets/fatcat.png'); // Path for public/assets/
      console.log('Cat spritesheet loaded:', this.spritesheet);
    } catch (error) {
      console.error('Failed to load cat spritesheet:', error);
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
          this.animationRow = 2; // Return to idle
          this.isIdle = true;
        }
      } else {
        // Idle - simple animation or static frame if desired
        // For now, let cat stay on frame 0 of idle row
        this.currentFrame = 0;
        this.animationRow = 2;
        this.isIdle = true;
      }
    }
  }

  draw() {
    if (!this.spritesheet || !this.canvas || !this.ctx) return;
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
        -this.frameWidth / 2, -this.frameHeight / 2, // Centered drawing
        this.frameWidth, this.frameHeight
        // Original code had *2 width and offset, simplified for now
      );
    } catch (error) {
      console.error('Error drawing cat:', error);
    }
    this.ctx.restore();
    this.drawHat(); // Draw hat after cat
  }

  handleResize() {
    if (!this.canvas) return;
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height * 0.4;
    this.scale = Math.min(this.canvas.width / 1500, this.canvas.height / 1500) * 1.6;
    this.currentFrame = 0;
    this.animFrameCount = 0;
    this.animationRow = 1; // Assuming row 1 is coughing
    this.coughPauseTime = 60; // ~1 second
  }

  startEating() {
    console.log("CatDrawer: startEating");
    this.isIdle = false;
    this.isEating = true;
    this.isCoughing = false;
    this.isClickAnimating = false;
    this.currentFrame = 0;
    this.animFrameCount = 0;
    this.animationRow = 0; // Assuming row 0 is eating, adjust if different
    // TODO: Play sound via React state/effects if needed
  }

  startCoughing() {
    console.log("CatDrawer: startCoughing");
    this.isIdle = false;
    this.isEating = false;
    this.isCoughing = true;
    this.isClickAnimating = false;
    this.currentFrame = 0;
    this.animFrameCount = 0;
    this.animationRow = 1; // Assuming row 1 is coughing
    this.coughPauseTime = 60; // ~1 second
  }

  startClickAnimation(hasTreats) {
    console.log("CatDrawer: startClickAnimation, hasTreats:", hasTreats);
    if (this.isEating || this.isCoughing) return; // Don't interrupt eating/coughing
    this.isIdle = false;
    this.isClickAnimating = true;
    this.currentFrame = 0;
    this.animFrameCount = 0;
    this.animationRow = hasTreats ? 0 : 2; // Row 0 for treat interaction, Row 2 for no-treat/idle tap
    // This might need adjustment based on spritesheet layout.
    // Original used row 0 for click with treats.
  }

  async wearHat(hatData) {
    if (!hatData) {
      this.equippedHatData = null;
      this.equippedHatImage = null;
      console.log("CatDrawer: hat unequipped");
      return;
    }
    this.equippedHatData = hatData;
    this.equippedHatImage = null; // Clear previous image while new one loads
    console.log("CatDrawer: attempting to wear hat", hatData.name);
    try {
      this.equippedHatImage = await loadImage(hatData.imagePath);
      console.log("CatDrawer: hat image loaded", hatData.name, this.equippedHatImage);
    } catch (error) {
      console.error("CatDrawer: failed to load hat image", hatData.name, error);
      this.equippedHatData = null; // Failed to load, so no hat
    }
  }

  drawHat() {
    if (!this.equippedHatImage || !this.ctx) return;

    // Basic hat positioning - this will need significant adjustment!
    // These are placeholder values. The original game likely had more precise logic.
    const hatXOffset = 0; // Adjust as needed
    const hatYOffset = -this.frameHeight / 2.5; // e.g., place above the cat's sprite center
    const hatScale = this.equippedHatData.scale || 0.5; // Assuming hat might have its own scale, or default

    this.ctx.save();
    // Translate to the cat's drawing position, then apply hat-specific offsets
    this.ctx.translate(this.x + hatXOffset, this.y + hatYOffset);
    // TODO: Consider cat's rotation if hats should rotate with the cat (this.rotation)
    this.ctx.scale(this.scale * hatScale, this.scale * hatScale); // Apply cat's scale and hat's relative scale
    this.ctx.globalAlpha = this.alpha; // Apply cat's alpha

    try {
      // Draw the hat image centered at its new relative origin
      // Assumes hat images are designed with their center as the anchor point, or adjust as needed.
      const hatWidth = this.equippedHatImage.width;
      const hatHeight = this.equippedHatImage.height;

      this.ctx.drawImage(
        this.equippedHatImage,
        -hatWidth / 2, -hatHeight / 2, // Draw centered
        hatWidth, hatHeight
      );
    } catch (error) {
      console.error('Error drawing hat:', error);
    }
    this.ctx.restore();
  }
}

function TitleScreen() {
  const canvasRef = React.useRef(null);
  const catDrawerRef = React.useRef(null); // Ref to store CatDrawer instance
  const [treats, setTreats] = React.useState(10); // Initial treats
  const [fullness, setFullness] = React.useState(0);
  const [unlockedHats, setUnlockedHats] = React.useState(new Set()); // TODO: Initialize from localStorage
  const [currentAvatarId, setCurrentAvatarId] = React.useState('defaultCat'); // TODO: Initialize from localStorage
  const [equippedHatId, setEquippedHatId] = React.useState(null); // TODO: Initialize from localStorage
  const [isHairballActive, setIsHairballActive] = React.useState(false);
  const [currentHairball, setCurrentHairball] = React.useState(null);
  // State for the hat data to be revealed
  const [hatForReveal, setHatForReveal] = React.useState(null);
  // State to control visibility of the reveal overlay
  const [isRevealOverlayVisible, setIsRevealOverlayVisible] = React.useState(false);
  const [isHatInventoryOpen, setIsHatInventoryOpen] = React.useState(false);
  const [hatInventoryFilter, setHatInventoryFilter] = React.useState('all'); // For hat inventory rarity filter
  // const fullnessThreshold = 10; // From game.js -> Now imported

  // TODO: Later, implement feedCat logic which will call setTreats(prevTreats => prevTreats - 1)
  // and other game interactions that modify treats.
  // TODO: Implement actual feedCat and generateHairball logic for fullness

  // Effect for loading game state from localStorage on component mount
  React.useEffect(() => {
    const savedGameState = localStorage.getItem('metagameGameState');
    if (savedGameState) {
      try {
        const loadedState = JSON.parse(savedGameState);
        if (loadedState.treats !== undefined) setTreats(loadedState.treats);
        if (loadedState.fullness !== undefined) setFullness(loadedState.fullness);
        if (loadedState.unlockedHats !== undefined) setUnlockedHats(new Set(loadedState.unlockedHats));
        if (loadedState.currentAvatarId !== undefined) setCurrentAvatarId(loadedState.currentAvatarId);
        if (loadedState.equippedHatId !== undefined) setEquippedHatId(loadedState.equippedHatId);
        console.log('Game state loaded from localStorage:', loadedState);
      } catch (error) {
        console.error('Failed to parse game state from localStorage:', error);
        // Initialize with defaults if parsing fails or state is corrupted
        setTreats(10);
        setFullness(0);
        setUnlockedHats(new Set());
        setCurrentAvatarId('defaultCat');
        setEquippedHatId(null);
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect for saving game state to localStorage whenever relevant state changes
  React.useEffect(() => {
    const gameStateToSave = {
      treats,
      fullness,
      unlockedHats: Array.from(unlockedHats), // Convert Set to Array for JSON serialization
      currentAvatarId,
      equippedHatId,
    };
    try {
      localStorage.setItem('metagameGameState', JSON.stringify(gameStateToSave));
      console.log('Game state saved to localStorage:', gameStateToSave);
    } catch (error) {
      console.error('Failed to save game state to localStorage:', error);
    }
  }, [treats, fullness, unlockedHats, currentAvatarId, equippedHatId]);

  // Effect for canvas setup and game loop
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Match canvas rendering size to its display size
    // The CSS aims for a max-width: 450px and aspect-ratio: 9/16 within a 100vh container.
    // We need to ensure the canvas internal resolution matches its styled size.
    const setupCanvasDimensions = () => {
      // Get the actual display size of the canvas element
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      console.log(`Canvas dimensions set to: ${canvas.width}x${canvas.height}`);
      if (catDrawerRef.current) catDrawerRef.current.handleResize();
    };

    const context = canvas.getContext('2d');
    if (!context) return;

    const backgroundDrawer = new BackgroundDrawer(canvas, context);
    catDrawerRef.current = new CatDrawer(canvas, context); // Store instance

    let animationFrameId;

    const gameLoop = () => {
      backgroundDrawer.draw();
      if (catDrawerRef.current) {
        catDrawerRef.current.update();
        catDrawerRef.current.draw();
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleResize = () => {
      setupCanvasDimensions();
      // No explicit call to backgroundDrawer.handleResize needed as draw() recalculates.
      // If CatDrawer needs specific resize handling, call it here.
    };

    window.addEventListener('resize', handleResize);
    setupCanvasDimensions(); // Initial setup
    gameLoop(); // Start the loop

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array to run once on mount

  // Helper function to get a random rarity based on weights
  const getRandomRarity = () => {
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const rarity in rarityWeights) {
      cumulativeProbability += rarityWeights[rarity];
      if (rand < cumulativeProbability) {
        return rarity;
      }
    }
    return 'common'; // Fallback, should not be reached if weights sum to 1
  };

  // Helper function to get a random hat, potentially filtered by rarity
  const getRandomHat = (targetRarity = null) => {
    const selectedRarity = targetRarity || getRandomRarity();
    const hatsOfSelectedRarity = allHats.filter(hat => hat.rarity === selectedRarity);

    if (hatsOfSelectedRarity.length > 0) {
      const randomIndex = Math.floor(Math.random() * hatsOfSelectedRarity.length);
      return hatsOfSelectedRarity[randomIndex];
    } else {
      // Fallback: if no hats of the selected rarity, try to get any common hat or any hat if no common
      const commonHats = allHats.filter(hat => hat.rarity === 'common');
      if (commonHats.length > 0) {
        const randomIndex = Math.floor(Math.random() * commonHats.length);
        return commonHats[randomIndex];
      }
      // If still no hat, return any hat (or null/undefined if allHats is empty)
      if (allHats.length > 0) {
        const randomIndex = Math.floor(Math.random() * allHats.length);
        return allHats[randomIndex];
      }
    }
    return null; // Should not happen if allHats is populated
  };

  // Helper function to get unlocked hats, optionally filtered by rarity
  const getHatsByRarity = (rarityFilter = 'all') => {
    if (!unlockedHats || unlockedHats.size === 0) {
      return []; // No hats unlocked yet
    }

    let filteredHats = [];
    for (const hat of allHats) {
      if (unlockedHats.has(hat.id)) {
        if (rarityFilter === 'all' || hat.rarity === rarityFilter) {
          filteredHats.push(hat);
        }
      }
    }
    return filteredHats;
  };

  const triggerGenerateHairball = () => {
    if (catDrawerRef.current) catDrawerRef.current.startCoughing();

    const randomHat = getRandomHat(); // Get a random hat based on rarity weights

    if (!randomHat) {
      console.error("Could not get a random hat. Check hat configurations and rarity weights.");
      // Potentially use a default/fallback hat if randomHat is null
      // For now, we'll proceed, but performOpenHairball might have issues if currentHairball is not set
      // setCurrentHairball(mockHat); // Fallback to old mockHat if needed, but ideally getRandomHat always returns something
      return; // Exit if no hat could be determined
    }

    const newHairball = {
      hat: randomHat,
      rarity: randomHat.rarity
    };
    setCurrentHairball(newHairball);
    setIsHairballActive(true);
    // TODO: Play cat coughing animation
    console.log(`Hairball generated with ${randomHat.name}! Click overlay to open.`);
  };

  const performFeedCatActions = () => {
    if (treats <= 0) return;
    if (catDrawerRef.current) catDrawerRef.current.startEating();
    setTreats(prevTreats => prevTreats - 1);
    console.log("Cat is being fed (React state updated)");
    setFullness(prevFullness => {
      const newFullness = prevFullness + 1;
      if (newFullness >= fullnessThreshold) {
        triggerGenerateHairball();
        return 0; // Fullness resets as hairball is generated
      } else {
        return newFullness;
      }
    });
    // TODO: Save game state
  };

  const performOpenHairball = () => {
    if (!isHairballActive || !currentHairball) return;

    console.log('Opening hairball for:', currentHairball.hat.name);
    setHatForReveal(currentHairball.hat); // Set the hat data for reveal
    setIsRevealOverlayVisible(true);       // Make the overlay visible

    // TODO: Implement hat unlocking logic (e.g., update a list of unlocked hats in state/context)
    // This is where we would update unlockedHats state
    setUnlockedHats(prevUnlockedHats => {
      const newUnlockedHats = new Set(prevUnlockedHats);
      newUnlockedHats.add(currentHairball.hat.id); // Assuming hat object has an 'id'
      return newUnlockedHats;
    });
    console.log(`${currentHairball.hat.name} unlocked!`);

    setIsHairballActive(false);
    setCurrentHairball(null);
  };

  React.useEffect(() => {
    let revealTimer;
    if (isRevealOverlayVisible && hatForReveal) {
      // Automatically hide the reveal overlay after a few seconds
      revealTimer = setTimeout(() => {
        setIsRevealOverlayVisible(false);
        // Optionally clear hatForReveal after animation, though CSS transition handles visual disappearance
        // setTimeout(() => setHatForReveal(null), 500); // delay for CSS transition
      }, 3000); // Display for 3 seconds
    }
    return () => {
      clearTimeout(revealTimer);
    };
  }, [isRevealOverlayVisible, hatForReveal]);

  const handleGameInteraction = (event) => {
    // Only respond to direct clicks on the overlay, not on its children (buttons, etc.)
    if (event.target !== event.currentTarget) {
      return;
    }

    if (isHairballActive) {
      performOpenHairball();
    } else if (treats > 0) {
      // Trigger click animation before feeding
      if (catDrawerRef.current) catDrawerRef.current.startClickAnimation(treats > 0);
      performFeedCatActions();
    } else {
      if (catDrawerRef.current) catDrawerRef.current.startClickAnimation(false); // Click animation with no treats
      console.log("No treats to feed!");
      // TODO: Play "no treats" sound or show a message
    }
  };

  const handleAddTreats = () => {
    setTreats(prevTreats => prevTreats + 10);
    // Original debug button no longer directly manipulates fullness here
    // Fullness is now only driven by feedCat or direct debug if we add one for it.
  };

  const toggleHatInventory = () => {
    setIsHatInventoryOpen(prev => !prev);
  };

  const handleRarityFilterClick = (rarity) => {
    setHatInventoryFilter(rarity);
  };

  const handleEquipHat = (hatId) => {
    const hatToEquip = allHats.find(h => h.id === hatId);
    if (hatToEquip) {
      if (!unlockedHats.has(hatId)) {
        console.log("Cannot equip locked hat:", hatToEquip.name);
        // Optionally, provide visual feedback to the user that the hat is locked
        return;
      }
      setEquippedHatId(hatId);
      if (catDrawerRef.current) {
        catDrawerRef.current.wearHat(hatToEquip); // Method to be added to CatDrawer
      }
      console.log('Equipping hat:', hatToEquip.name);
      setIsHatInventoryOpen(false); // Close inventory after selection
    } else {
      console.error('Could not find hat with id:', hatId);
    }
  };

  // Memoize the list of hats to display in the inventory
  const hatsToDisplayInInventory = React.useMemo(() => {
    if (hatInventoryFilter === 'all') {
      return allHats;
    }
    return allHats.filter(hat => hat.rarity === hatInventoryFilter);
  }, [hatInventoryFilter]); // allHats is stable from import, so only hatInventoryFilter is a dependency

  return (
    <>
      {/* The original index.html had a <link rel="stylesheet" href="styles.css">.
          In React, CSS is usually imported into the JavaScript file (see comment at the top)
          or handled via CSS-in-JS libraries or CSS Modules.
      */}
      <div id="game-container">
        <canvas ref={canvasRef} id="gameCanvas"></canvas>

        <div
          id="ui-overlay"
          onClick={handleGameInteraction}
          // Ensure pointerEvents: 'auto' is on the ui-overlay itself if it's meant to catch clicks
          // The style was removed in a previous step, let's re-evaluate if it's needed here
          // or rely on children having pointerEvents: 'auto' and this one being a passthrough
          // For now, assuming direct clicks are desired on the overlay.
          style={{ pointerEvents: 'auto' }}
        >
          <div id="top-bar">
            <div id="treats-counter">
              {/* Ensure asset paths are correct for your React setup */}
              <img src="/assets/fish-treat.png" alt="Fish Treat" className="treat-icon" />
              <span id="treats-count">{treats}</span>
            </div>

            <button id="avatar-button" className="ui-button">
              <img src="/assets/cat-icon.png" alt="Change Avatar" className="avatar-icon" />
              <span>Change Avatar</span>
            </button>

            <button
              id="hat-closet-button"
              className="ui-button"
              onClick={toggleHatInventory} // Open hat inventory
            >
              <img src="/assets/hat-icon.png" alt="Hat Closet" className="hat-icon" />
              <span>Hat Closet</span>
            </button>
          </div>

          <div id="fullness-meter">
            <div
              id="fullness-progress"
              style={{ width: `${(fullness / fullnessThreshold) * 100}%` }}
            ></div>
          </div>

          {/* Debug Controls from original HTML */}
          <div id="debug-controls">
            <button
              id="add-treats"
              className="debug-button"
              onClick={handleAddTreats}
            >
              +10 Treats
            </button>
          </div>

          <button id="play-button" className="ui-button">
            <img src="/assets/play-icon.png" alt="Play" className="play-icon" />
            <span>Play</span>
          </button>
        </div>

        <div id="avatar-selector" className="hidden">
          <div className="inventory-header">
            <h2>Choose Your Cat</h2>
            <button id="close-avatar-selector">×</button>
          </div>
          <div id="avatars-grid"></div>
        </div>

        <div id="hat-inventory" className={isHatInventoryOpen ? '' : 'hidden'}>
          <div className="inventory-header">
            <h2>Hat Collection</h2>
            <button id="close-inventory" onClick={toggleHatInventory}>×</button> {/* Close hat inventory */}
          </div>
          <div className="rarity-filters">
            {/* Update buttons to use hatInventoryFilter state and click handler */}
            <button
              className={`rarity-filter ${hatInventoryFilter === 'all' ? 'active' : ''}`}
              data-rarity="all"
              onClick={() => handleRarityFilterClick('all')}
            >
              All
            </button>
            <button
              className={`rarity-filter ${hatInventoryFilter === 'common' ? 'active' : ''}`}
              data-rarity="common"
              onClick={() => handleRarityFilterClick('common')}
            >
              Common
            </button>
            <button
              className={`rarity-filter ${hatInventoryFilter === 'uncommon' ? 'active' : ''}`}
              data-rarity="uncommon"
              onClick={() => handleRarityFilterClick('uncommon')}
            >
              Uncommon
            </button>
            <button
              className={`rarity-filter ${hatInventoryFilter === 'rare' ? 'active' : ''}`}
              data-rarity="rare"
              onClick={() => handleRarityFilterClick('rare')}
            >
              Rare
            </button>
            <button
              className={`rarity-filter ${hatInventoryFilter === 'legendary' ? 'active' : ''}`}
              data-rarity="legendary"
              onClick={() => handleRarityFilterClick('legendary')}
            >
              Legendary
            </button>
          </div>
          <div id="hats-grid">
            {isHatInventoryOpen && (
              <>
                {hatsToDisplayInInventory.length > 0 ? (
                  hatsToDisplayInInventory.map(hat => {
                    const isUnlocked = unlockedHats.has(hat.id);
                    const isEquipped = equippedHatId === hat.id;
                    return (
                      <div
                        key={hat.id}
                        className={`hat-item ${isEquipped ? 'equipped' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`}
                        data-hat-id={hat.id}
                        onClick={() => isUnlocked && handleEquipHat(hat.id)}
                        style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
                      >
                        <img src={hat.imagePath} alt={hat.name} />
                        <div className="hat-item-name">{hat.name}</div>
                        {!isUnlocked && <div className="lock-icon">🔒</div>} {/* Optional: Add a lock icon styled via CSS */}
                      </div>
                    );
                  })
                ) : (
                  <p>
                    {hatInventoryFilter === 'all' && unlockedHats.size === 0
                      ? "No hats unlocked yet. Keep feeding your cat!"
                      : `No ${hatInventoryFilter !== 'all' ? hatInventoryFilter : ''} hats currently available matching this filter.`}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Hat Reveal Overlay - Conditionally Rendered */}
        {isRevealOverlayVisible && hatForReveal && (
          <div className="hat-reveal-overlay visible">
            <div
              className="hat-reveal-display"
            // The CSS for .hat-reveal-display handles the reveal animation (scale and opacity transition).
            >
              <img src={hatForReveal.imagePath} alt={hatForReveal.name} />
              <div className={`hat-name ${hatForReveal.rarity.toLowerCase()}`}>
                {hatForReveal.name}
              </div>
            </div>
          </div>
        )}
      </div>
      {/*
      The script tags from the original HTML (js/utils.js, js/config.js, etc.)
      are not included here directly. Their functionality needs to be
      re-implemented or adapted within the React component structure (e.g., using
      useEffect for side effects, useState for state management, and breaking down
      logic into smaller components or custom hooks).
    */}
    </>
  );
}

export default TitleScreen; 