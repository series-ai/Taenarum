/*
TODO: Overall Game Migration from Vanilla JS Metagame to React

This component is a migration of a vanilla JavaScript game. Many features from the original
`games/metagame/` directory still need to be fully implemented or integrated.

--- GENERAL GAME LOGIC & STATE ---
- TODO: [State Management] Consider React Context or a lightweight state manager (e.g., Zustand) for shared game state if props drilling becomes too complex.
- TODO: [Config] Externalize game configurations (hat definitions, avatar definitions, rarity weights, initial player stats, animation settings, sound paths)
  instead of hardcoding (see original `config.js`). This could be a separate JS/JSON file imported at the top. Check `web-client/public/games/metagame/js/config.js`.
- TODO: [Game Logic Parity - `game.js` review] Cross-reference original `game.js` (especially `feedCat`, `generateHairball`, `openHairball`, main interaction flow, and `gameLoop` structure) with `TitleScreen.js` counterparts (`performFeedCatActions`, `triggerGenerateHairball`, `performOpenHairball`, `handleGameInteraction`, and canvas `useEffect` loop) for any subtle missed game logic, state transitions, or initialization steps (e.g., `game.js` lines ~23-94, ~125-240).

--- HAT SYSTEM (Original: hat.js, hatCollection.js, parts of game.js) ---
- TODO: [UI - Hat Inventory Modal]
    - Manage visibility state (e.g., `isHatInventoryOpen`): Done.
    - Connect "Hat Closet" button (`#hat-closet-button`) and inventory's "Close" button (`#close-inventory`) to toggle this visibility state: Done.
    - Populate `#hats-grid` with hat items based on data from `hatCollection`, showing images, names, and locked/unlocked status: Partially done. Uses `allHatsFromConfig` from `gameConfig.js`. Need to verify against original `hatCollection.js` from `web-client/public/games/metagame/js/hatCollection.js`. 
      VERIFICATION: Original `hatCollection.js` initialized `Hat` objects from config, managed unlocked set, and provided methods to get all/filtered hats. React version uses plain objects from `gameConfig.js` (`allHatsFromConfig`), `unlockedHats` state in `TitleScreen.js`, and `hatsToDisplayInInventory` (derived from `allHatsFromConfig` and `hatInventoryFilter`) for UI. `getRandomHat` is in `gameUtils.js`. This approach covers the functionalities. The React component correctly displays all hats and their locked/unlocked & equipped status. This can be marked as Done.
    - Implement functionality for rarity filter buttons (`.rarity-filter`) to update the displayed hats in `#hats-grid`: Done.
    - Handle selecting an unlocked hat from the inventory to equip it on the cat (should call `catDrawer.wearHat(hatData)`): Done.
- TODO: [Cat Hat Drawing - `cat.js` & `hat.js` review] 
    - The original `cat.js` `currentHat.draw()` method suggested hats might have had their own complex drawing logic. 
    - Specifically, the original `Hat.js` `draw()` method (lines ~26-41) used a non-uniform scale: `ctx.scale(scale * 2, scale)`, making hats appear twice as wide relative to their height. 
    - Review if `CatDrawer.drawHat()` drawing a single `equippedHatImage` with uniform scaling is sufficient. If the non-uniform scaling or other per-hat drawing logic is desired, `CatDrawer.drawHat()` will need to be updated. 
    - The current `CatDrawer.drawHat()` uses `avatarConfig.headOffset` for positioning. Consider if individual hats also need their own offset/scale properties in their config in `allHatsFromConfig` to achieve desired visual effects or fine-tune positioning beyond the avatar's head offset.
- TODO: [Hat Reveal Behavior - `game.js` review] The original `game.js` `openHairball` (lines ~189-230) allowed clicking the dynamically created hat reveal display to equip the hat immediately. The current `TitleScreen.js` `performOpenHairball` shows a reveal then auto-hides it; the hat is unlocked and can be equipped from inventory. This is a UX change. Decide if the original immediate-equip-on-reveal behavior is preferred.

--- AVATAR SYSTEM (Original: implied by HTML, potentially player.js or config.js) ---
- TODO: [Data] Define Avatar class/object structure and load avatar configurations (e.g., ID, name, spritesheet path or image path). See original `web-client/public/games/metagame/js/player.js` or `config.js`.
- TODO: [Data] Implement Avatar collection/selection logic (similar to hats, track unlocked avatars if applicable).
- TODO: [UI - Avatar Selector Modal]
    - Manage visibility state (e.g., `isAvatarSelectorOpen`): Done.
    - Connect "Change Avatar" button (`#avatar-button`) and selector's "Close" button (`#close-avatar-selector`) to toggle visibility: Done.
    - Populate `#avatars-grid` with available/unlocked avatars, showing their images/names: Done. Currently all avatars are available.
    - Handle selecting an avatar: Done. Calls `handleSelectAvatar`.
    - Update cat's appearance based on the selected avatar. This might involve:
        - Passing the selected avatar's spritesheet path to `CatDrawer`.
        - `CatDrawer` reloading its spritesheet or having different drawing logic per avatar.: Done, via `CatDrawer.setAvatar()`.
- TODO: [Avatar Filtering - `game.js` reference] The original `game.js` had UI and stubs for avatar filtering (e.g., `filterAvatars(e.target.dataset.type)`, lines ~50-53, ~313-370 in `game.js`), similar to hat rarity filters. Currently, `TitleScreen.js` displays all avatars. Consider if avatar filtering (e.g., by type, if avatars are categorized) is a desired feature and implement if so.
- TODO: [Avatar Sprites & Animations - Migrated Avatars] Review and customize `frameWidth`, `frameHeight` (128x128 for migrated vs 287x287 for `defaultCat`), and `animationRows` (especially placeholder `eating`, `coughing` rows) for all avatars migrated into `gameConfig.js` from the original `config.js`. Ensure `spritesheetPath` and `headOffset` are correct for each. Original avatars also had `frames: 1` for idle, which implies no idle animation; current `CatDrawer` animates idle if `totalFrames > 1`.

--- CAT & CANVAS (Original: Cat.js, Background.js, Animations.js, Game.js loop) ---
- TODO: [Background Logic - `background.js`] Verify that `BackgroundDrawer.js` correctly implements the logic from the original `web-client/public/games/metagame/js/background.js` (loading, drawing, scaling, and resizing of `fishbg.png` - now `bg.png`).: Done. `BackgroundDrawer.js` appears to cover this.
- TODO: [Cat Sprites - `cat.js` review] Verify `animationRow` indices (now from `avatarConfig.animationRows`) and `totalFrames` in `CatDrawer` for all actions (idle, eating, coughing, click-with-treats, click-no-treats) against the actual spritesheet layouts for `fatcat.png` and any new avatars. Adjust `avatarConfig` in `gameConfig.js` and `CatDrawer` logic as necessary. The `totalFrames` is currently hardcoded in `CatDrawer`; determine if this should be part of `avatarConfig.animationRows[action].frameCount`. Refer to original `web-client/public/games/metagame/js/Cat.js` (lines ~25-33, and animation methods).
- TODO: [Cat Drawing Visuals - `cat.js` review] The original `cat.js` `draw()` method (lines ~103-118) drew the cat sprite at `this.frameWidth * 2` width with an offset `-this.frameWidth`. The current `CatDrawer.draw()` is simplified (uses `this.frameWidth` and centers with `-this.frameWidth / 2`). Review and match original visuals if this wider cat appearance is required.
- TODO: [Cat Hat - `CatDrawer.wearHat`] Implement `CatDrawer.wearHat(hatData)` to store the current hat: Done in `CatDrawer.js`.
- TODO: [Cat Hat - `CatDrawer.drawHat`] Implement `CatDrawer.drawHat()`: needs to load the hat's image (if not already loaded) and draw it at the correct position relative to the cat's head, considering cat's scale and animation frame. (See original `cat.js -> drawHat`, lines ~229-246). Partially done in `CatDrawer.js`, uses `avatarConfig.headOffset`. Refinement for perfect positioning per hat/avatar might be ongoing.
- TODO: [Cat State - `cat.js` review] Refine cat animation details in `CatDrawer` (frame rates via `frameDelay`, `coughFrameDelay`, `eatFrame0Delay`; smooth transitions between states, e.g., from eating back to idle). Compare with original `cat.js` `update()` (lines ~52-90) and animation methods (`startEating`, `startCoughing`, etc.) to ensure behavior parity if desired.
- TODO: [Cat Interaction - `cat.js` review] The original `cat.js` used a `blockingTaps` flag (lines ~19, ~195-200), set during coughing, to prevent interactions. The current React version has some implicit blocking in `CatDrawer.startClickAnimation` and `handleGameInteraction`. Re-evaluate if a more explicit, React state-driven `blockingTaps` mechanism is needed for robustness during critical animations (e.g., coughing, reveal sequences). This could be a state variable in `TitleScreen.js` passed to relevant interaction handlers or to `CatDrawer`.
- TODO: [Cat Feature - Separate Avatar Display - `cat.js` review] The original `cat.js` `draw()` method (lines ~121-152) included logic to display a small, separate avatar image (potentially of the player's chosen character/icon) with a name tag at a fixed position on the screen (bottom-left). This is *not* the main interactive cat. Decide if this UI feature is desired in the React version. If so, implement it, possibly as a new React component overlaid on the canvas or drawn directly by `TitleScreen` if it's part of the game view.
- TODO: [Advanced Animations] Investigate and migrate the `AnimationSystem` from `web-client/public/games/metagame/js/animations.js`. This includes:
    - `AnimationManager`: Re-implement or migrate for managing active canvas animations within `TitleScreen.js` game loop.
    - `HairballAnimation` (used in original `game.js`):
        - Cat shake effect: Determine how to apply to `CatDrawer` (e.g., modify `CatDrawer` or pass offsets from animation).
        - Particle generation: Depends on migrating the particle system from `utils.js`.
    - `HatRevealAnimation`:
        - Compare with current CSS-based hat reveal. Decide if a canvas-based animation with particles (from `utils.js`) and specific easing (e.g., `Easing.bounce` from `utils.js`) is preferred for the hat reveal sequence.
        - Depends on particle system and `Easing` functions.
    - `SquashStretchAnimation`: A general utility animation. Migrate if needed for dynamic UI feedback on canvas elements (e.g., cat, buttons if drawn on canvas).
    - Dependencies: Note that these animations rely on the particle system and `Easing` functions from the original `utils.js` which also need migration (see `[Visual Effects - Particle System]` and `[Game Utils - Easing]` TODOs).
- TODO: [Visual Effects - Particle System - `utils.js` review] The original `utils.js` (lines ~40-70) included functions for a simple particle system (`createParticle`, `updateParticles`, `drawParticles`). If particle effects (e.g., for clicks, reveals, other visual feedback) are desired, this system should be migrated or re-implemented for drawing on the canvas.

--- UI & INTERACTIONS (Original: index.html, game.js) ---
- TODO: [Play Button] Implement functionality for the "Play" button (`#play-button`) if it's intended to do more than the current general click interaction (e.g., start game, tutorial). Currently logs to console. See original `web-client/public/games/metagame/js/game.js` for original behavior (if any beyond triggering general interaction).
- TODO: [Targeted Interaction] Refine `handleGameInteraction`: instead of the entire `ui-overlay`, consider making only the cat area on the canvas clickable for feeding.
  This would involve checking click coordinates against the cat's bounding box on the canvas. See original `web-client/public/games/metagame/js/game.js` (`handleClick`, `handleTouch` lines ~103-122, which passed coordinates to `handleInteraction`).
- TODO: [Touch Handling - `game.js` review] The original `game.js` `handleTouch` method (lines ~113-122) called `event.preventDefault()`. Review if this is necessary or beneficial for `handleGameInteraction` in `TitleScreen.js` when triggered by touch events on mobile devices to prevent default browser behaviors like scrolling or zooming during game interaction. Original `utils.js` also had `getTouchPosition` (lines ~99-105) for extracting touch coordinates, which might be relevant if more complex touch processing is needed.
- TODO: [UI Icon Updates - `game.js` review] Original `game.js` had `updateHatIcon()` and `updateAvatarIcon()` methods (lines ~296, ~393) to change UI elements (e.g. button icons) based on equipped items. Verify that React's declarative rendering in `TitleScreen.js` (e.g., in `#top-bar` buttons) correctly reflects current `equippedHatId` and `currentAvatarId` visually, covering the intent of these original functions.

--- SOUNDS (Original: utils.js, game.js, cat.js) ---
- TODO: [Sound System] Implement a robust sound management system. Preload sounds or load on demand.
  Play sounds for events: cat eating (original `cat.js` line ~167), coughing, hairball reveal, UI button clicks, etc. (Original `GameUtils.playSound` from `web-client/public/games/metagame/js/utils.js`, line ~26).
  Consider using a library like Howler.js or Web Audio API directly, managed via React hooks/context.

--- UTILITIES & CODE STRUCTURE ---
- TODO: [Refactor] Move `loadImage`, `BackgroundDrawer`, `CatDrawer` into their own files: Done for `BackgroundDrawer` and `CatDrawer` (now in `src/canvas/`). `loadImage` is in `src/gameConfig.js` (originally from `utils.js`).
- TODO: [Game Utils - `utils.js` review] Create a `GameUtils.js` (or `.ts`) module in `src/utils/` for common functions. Original `utils.js` contained:
    - `RARITY_WEIGHTS`: Migrated to `gameConfig.js`. Note: original tiers/weights differ from current `gameConfig.js`.
    - `RARITY_COLORS`: Original `utils.js` (lines ~8-12) defined these. Current app uses CSS for rarity styling. If JS access to these specific colors is needed (e.g., for canvas drawing), they should be added to `gameConfig.js` or the new utils module.
    - `getRandomRarity()`: Migrated to `src/utils/gameUtils.js`.
    - `loadImage()`: Migrated to `src/gameConfig.js`.
    - `playSound()`: Tracked by `[Sound System]` TODO.
    - `saveGameState()` / `loadGameState()`: Handled by `useEffect` in `TitleScreen.js`.
    - Particle System (`createParticle`, etc.): See `[Visual Effects - Particle System]` TODO.
    - `Easing` functions (lines ~73-96 in original `utils.js`): Consider migrating these to the new utils module if needed for advanced animations.
    - `isMobile` detection (line ~98): Consider migrating this utility if responsive JS logic is needed.
    - `getTouchPosition()`: Noted in `[Touch Handling]` TODO.
- TODO: [Error Handling] Add more robust error handling (e.g., for image loading, state transitions).
- TODO: [Cleanup] Review and remove all temporary `console.log` statements once features are stable.

*/
import React from 'react';
import './styles.css'; // Import the newly added CSS file
import { fullnessThreshold, mockHat, allHats as allHatsFromConfig, rarityWeights, loadImage, allAvatars, getAvatarConfig, defaultAvatarId, avatarCategories, getAvatarType } from './gameConfig'; // Added allAvatars, getAvatarConfig, defaultAvatarId, avatarCategories, getAvatarType
import BackgroundDrawer from './canvas/BackgroundDrawer';
import CatDrawer from './canvas/CatDrawer';
import { getRandomRarity, getRandomHat } from './utils/gameUtils';
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
// class BackgroundDrawer { // MOVED to ./canvas/BackgroundDrawer.js
// constructor(canvas, ctx) {
// this.canvas = canvas;
// this.ctx = ctx;
// ... existing code ...
//   // For now, direct canvas.width/height update in resize listener is more direct.
// }

// class CatDrawer { // MOVED to ./canvas/CatDrawer.js
// constructor(canvas, ctx) {
// this.canvas = canvas;
// this.ctx = ctx;
// ... existing code ...
//   this.ctx.restore();
// }
// }

function TitleScreen() {
  const canvasRef = React.useRef(null);
  const catDrawerRef = React.useRef(null);
  const [treats, setTreats] = React.useState(null);
  const [fullness, setFullness] = React.useState(0);
  const [unlockedHats, setUnlockedHats] = React.useState(new Set());
  const [playerDisplayAvatarId, setPlayerDisplayAvatarId] = React.useState(defaultAvatarId);
  const [playerDisplayAvatarSprite, setPlayerDisplayAvatarSprite] = React.useState('assets/avatars/tabby.png');
  const [equippedHatId, setEquippedHatId] = React.useState(null);
  const [isHairballActive, setIsHairballActive] = React.useState(false);
  const [currentHairball, setCurrentHairball] = React.useState(null);
  const [hatForReveal, setHatForReveal] = React.useState(null);
  const [isRevealOverlayVisible, setIsRevealOverlayVisible] = React.useState(false);
  const [isHatInventoryOpen, setIsHatInventoryOpen] = React.useState(false);
  const [hatInventoryFilter, setHatInventoryFilter] = React.useState('all');
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = React.useState(false);
  const [avatarFilter, setAvatarFilter] = React.useState('all');

  React.useEffect(() => {
    const savedGameState = localStorage.getItem('metagameGameState');
    if (savedGameState) {
      try {
        const loadedState = JSON.parse(savedGameState);
        if (loadedState.treats !== undefined) setTreats(loadedState.treats);
        if (loadedState.fullness !== undefined) setFullness(loadedState.fullness);
        if (loadedState.unlockedHats !== undefined) setUnlockedHats(new Set(loadedState.unlockedHats));
        if (loadedState.playerDisplayAvatarId !== undefined) setPlayerDisplayAvatarId(loadedState.playerDisplayAvatarId);
        else setPlayerDisplayAvatarId(defaultAvatarId);
        if (loadedState.equippedHatId !== undefined) setEquippedHatId(loadedState.equippedHatId);
        console.log('Game state loaded from localStorage:', loadedState);
      } catch (error) {
        console.error('Failed to parse game state from localStorage:', error);
        setTreats(10);
        setFullness(0);
        setUnlockedHats(new Set());
        setPlayerDisplayAvatarId(defaultAvatarId);
        setEquippedHatId(null);
      }
    } else {
      setPlayerDisplayAvatarId(defaultAvatarId);
    }
  }, []);

  React.useEffect(() => {
    if (treats === null) {
      // don't save null treats
      return;
    }

    const gameStateToSave = {
      treats,
      fullness,
      unlockedHats: Array.from(unlockedHats),
      playerDisplayAvatarId,
      equippedHatId,
    };
    try {
      localStorage.setItem('metagameGameState', JSON.stringify(gameStateToSave));
      console.log('Game state saved to localStorage:', gameStateToSave);
    } catch (error) {
      console.error('Failed to save game state to localStorage:', error);
    }
  }, [treats, fullness, unlockedHats, playerDisplayAvatarId, equippedHatId]);

  React.useEffect(() => {
    // load player data from localStorage
    const playerDataString = localStorage.getItem('metagameGameState');
    if (playerDataString) {
      const playerData = JSON.parse(playerDataString);
      setTreats(playerData.treats);
    }
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setupCanvasDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (catDrawerRef.current) catDrawerRef.current.handleResize();
    };

    const context = canvas.getContext('2d');
    if (!context) return;

    const chosenAvatarConfig = getAvatarConfig(defaultAvatarId);

    if (!chosenAvatarConfig) {
      console.error("Could not load main interactive cat configuration!");
      return;
    }

    const backgroundDrawer = new BackgroundDrawer(canvas, context);
    catDrawerRef.current = new CatDrawer(canvas, context, chosenAvatarConfig);

    if (equippedHatId) {
      const hatToEquip = allHatsFromConfig.find(h => h.id === equippedHatId);
      if (hatToEquip && catDrawerRef.current) {
        catDrawerRef.current.wearHat(hatToEquip);
      }
    }

    if (playerDisplayAvatarId && catDrawerRef.current) {
      const playerAvatarConfig = getAvatarConfig(playerDisplayAvatarId);
      if (playerAvatarConfig) {
        catDrawerRef.current.setPlayerAvatarDisplay(playerAvatarConfig);
      }
    }

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
    };

    window.addEventListener('resize', handleResize);
    setupCanvasDimensions();
    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getHatsByRarity = (rarityFilter = 'all') => {
    if (!unlockedHats || unlockedHats.size === 0) {
      return [];
    }

    let filteredHats = [];
    for (const hat of allHatsFromConfig) {
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

    const randomHat = getRandomHat();

    if (!randomHat) {
      console.error("Could not get a random hat. Check hat configurations and rarity weights.");
      return;
    }

    const newHairball = {
      hat: randomHat,
      rarity: randomHat.rarity
    };
    setCurrentHairball(newHairball);
    setIsHairballActive(true);
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
        return 0;
      } else {
        return newFullness;
      }
    });
  };

  const performOpenHairball = () => {
    if (!isHairballActive || !currentHairball) return;

    console.log('Opening hairball for:', currentHairball.hat.name);
    setHatForReveal(currentHairball.hat);
    setIsRevealOverlayVisible(true);

    setUnlockedHats(prevUnlockedHats => {
      const newUnlockedHats = new Set(prevUnlockedHats);
      newUnlockedHats.add(currentHairball.hat.id);
      return newUnlockedHats;
    });
    console.log(`${currentHairball.hat.name} unlocked!`);

    setIsHairballActive(false);
    setCurrentHairball(null);
  };

  React.useEffect(() => {
    let revealTimer;
    if (isRevealOverlayVisible && hatForReveal) {
      revealTimer = setTimeout(() => {
        setIsRevealOverlayVisible(false);
      }, 3000);
    }
    return () => {
      clearTimeout(revealTimer);
    };
  }, [isRevealOverlayVisible, hatForReveal]);

  const handleGameInteraction = (event) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (isHairballActive) {
      performOpenHairball();
    } else if (treats > 0) {
      if (catDrawerRef.current) catDrawerRef.current.startClickAnimation(treats > 0);
      performFeedCatActions();
    } else {
      if (catDrawerRef.current) catDrawerRef.current.startClickAnimation(false);
      console.log("No treats to feed!");
    }
  };

  const handleAddTreats = () => {
    setTreats(prevTreats => prevTreats + 10);
  };

  const toggleAvatarSelector = () => {
    setIsAvatarSelectorOpen(prev => !prev);
    if (!isAvatarSelectorOpen) {
      setAvatarFilter('all');
    }
  };

  const toggleHatInventory = () => {
    setIsHatInventoryOpen(prev => !prev);
  };

  const handleRarityFilterClick = (rarity) => {
    setHatInventoryFilter(rarity);
  };

  const handleEquipHat = (hatId) => {
    const hatToEquip = allHatsFromConfig.find(h => h.id === hatId);
    if (hatToEquip) {
      if (!unlockedHats.has(hatId)) {
        console.log("Cannot equip locked hat:", hatToEquip.name);
        return;
      }
      setEquippedHatId(hatId);
      if (catDrawerRef.current) {
        catDrawerRef.current.wearHat(hatToEquip);
      }
      console.log('Equipping hat:', hatToEquip.name);
      setIsHatInventoryOpen(false);
    } else {
      console.error('Could not find hat with id:', hatId);
    }
  };

  const handlePlayButtonClick = () => {
    console.log("Play button clicked!");
  };

  const hatsToDisplayInInventory = React.useMemo(() => {
    if (hatInventoryFilter === 'all') {
      return allHatsFromConfig;
    }
    return allHatsFromConfig.filter(hat => hat.rarity === hatInventoryFilter);
  }, [hatInventoryFilter]);

  const avatarsToDisplayInSelector = React.useMemo(() => {
    if (avatarFilter === 'all' || !avatarCategories[avatarFilter]) {
      return allAvatars;
    }
    if (avatarCategories[avatarFilter].filterFn) {
      return allAvatars.filter(avatar => avatarCategories[avatarFilter].filterFn(avatar));
    }
    return allAvatars.filter(avatar => avatarCategories[avatarFilter].ids.includes(avatar.id));
  }, [avatarFilter]);

  const handleSelectAvatar = async (avatarId) => {
    const selectedAvatarConfig = getAvatarConfig(avatarId);
    if (selectedAvatarConfig && catDrawerRef.current) {
      try {
        await catDrawerRef.current.setPlayerAvatarDisplay({
          spritesheetPath: selectedAvatarConfig.spritesheetPath,
          name: selectedAvatarConfig.name,
          frameWidth: selectedAvatarConfig.frameWidth,
          frameHeight: selectedAvatarConfig.frameHeight,
        });
        setPlayerDisplayAvatarId(avatarId);
        setPlayerDisplayAvatarSprite(selectedAvatarConfig.spritesheetPath);
        setIsAvatarSelectorOpen(false);
        console.log('Player avatar display changed to:', selectedAvatarConfig.name);
      } catch (error) {
        console.error('Failed to set player avatar display:', error);
      }
    } else {
      console.error('Could not find avatar config for id:', avatarId);
    }
  };

  const handleAvatarFilterClick = (categoryKey) => {
    setAvatarFilter(categoryKey);
  };

  return (
    <>
      <div id="game-container">
        <canvas ref={canvasRef} id="gameCanvas"></canvas>

        <div
          id="ui-overlay"
          onClick={handleGameInteraction}
          style={{ pointerEvents: 'auto' }}
        >
          <div id="top-bar">
            <div id="treats-counter">
              <img src="/assets/fish-treat.png" alt="Fish Treat" className="treat-icon" />
              <span id="treats-count">{treats}</span>
            </div>

            <button id="avatar-button" className="ui-button" onClick={toggleAvatarSelector}>
              <img src={playerDisplayAvatarSprite} alt="Change Avatar" className="avatar-icon" />
              <span>Change Avatar</span>
            </button>

            <button
              id="hat-closet-button"
              className="ui-button"
              onClick={toggleHatInventory}
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

          <div id="debug-controls">
            <button
              id="add-treats"
              className="debug-button"
              onClick={handleAddTreats}
            >
              +10 Treats
            </button>
          </div>
        </div>

        <div id="avatar-selector" className={isAvatarSelectorOpen ? '' : 'hidden'}>
          <div className="inventory-header">
            <h2>Choose Your Cat</h2>
            <button id="close-avatar-selector" onClick={toggleAvatarSelector}>×</button>
          </div>
          <div className="rarity-filters">
            {isAvatarSelectorOpen && Object.entries(avatarCategories).map(([categoryKey, categoryValue]) => (
              <button
                key={categoryKey}
                className={`rarity-filter ${avatarFilter === categoryKey ? 'active' : ''}`}
                onClick={() => handleAvatarFilterClick(categoryKey)}
              >
                {categoryValue.name}
              </button>
            ))}
          </div>
          <div id="avatars-grid">
            {isAvatarSelectorOpen && avatarsToDisplayInSelector.map(avatar => {
              const avatarType = getAvatarType(avatar.id);
              return (
                <div
                  key={avatar.id}
                  className={`avatar-item ${playerDisplayAvatarId === avatar.id ? 'selected' : ''} ${avatarType}`}
                  onClick={() => handleSelectAvatar(avatar.id)}
                  title={`Select ${avatar.name}`}
                >
                  <img
                    src={avatar.spritesheetPath}
                    alt={avatar.name}
                    style={{ maxWidth: '80px', maxHeight: '80px', border: playerDisplayAvatarId === avatar.id ? '2px solid gold' : '2px solid transparent' }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                  />
                  <span style={{ display: 'none', color: 'white' }}>{avatar.name} (Preview N/A)</span>
                  <div className="avatar-item-name">{avatar.name}</div>
                </div>
              );
            })}
            {isAvatarSelectorOpen && avatarsToDisplayInSelector.length === 0 && (
              <p style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
                No avatars found for filter: {avatarCategories[avatarFilter]?.name || avatarFilter}
              </p>
            )}
          </div>
        </div>

        <div id="hat-inventory" className={isHatInventoryOpen ? '' : 'hidden'}>
          <div className="inventory-header">
            <h2>Hat Collection</h2>
            <button id="close-inventory" onClick={toggleHatInventory}>×</button>
          </div>
          <div className="rarity-filters">
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
                        {!isUnlocked && <div className="lock-icon">🔒</div>}
                      </div>
                    );
                  })
                ) : (
                  <p>
                    {hatInventoryFilter === 'all' && unlockedHats.size === 0
                      ? "No hats unlocked yet. Keep feeding your cat!"
                      : `No ${hatInventoryFilter !== 'all' ? hatInventoryFilter : ''} hats currently available matching this filter.${unlockedHats.size > 0 && hatsToDisplayInInventory.length === 0 ? ' (Though you have unlocked hats of other rarities!) ' : ''}`}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {isRevealOverlayVisible && hatForReveal && (
          <div className="hat-reveal-overlay visible">
            <div
              className="hat-reveal-display"
            >
              <img src={hatForReveal.imagePath} alt={hatForReveal.name} />
              <div className={`hat-name ${hatForReveal.rarity.toLowerCase()}`}>
                {hatForReveal.name}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default TitleScreen; 