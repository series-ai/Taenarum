import React from 'react';
import './styles.css'; // Import the newly added CSS file
import { fullnessThreshold, allHats as allHatsFromConfig, allAvatars, getAvatarConfig, defaultAvatarId, avatarCategories, getAvatarType } from './gameConfig'; // Added allAvatars, getAvatarConfig, defaultAvatarId, avatarCategories, getAvatarType
import BackgroundDrawer from './canvas/BackgroundDrawer';
import CatDrawer from './canvas/CatDrawer';
import { getRandomHat } from './utils/gameUtils';
import { AnimationSystem } from './utils/animations'; // Added AnimationSystem

function TitleScreen() {
  const canvasRef = React.useRef(null);
  const catDrawerRef = React.useRef(null);
  const [treats, setTreats] = React.useState(null);
  const [fullness, setFullness] = React.useState(0);
  const [unlockedHats, setUnlockedHats] = React.useState(new Set());
  const [playerDisplayAvatarId, setPlayerDisplayAvatarId] = React.useState(defaultAvatarId);
  const [equippedHatId, setEquippedHatId] = React.useState(null);
  const [isHairballActive, setIsHairballActive] = React.useState(false);
  const [currentHairball, setCurrentHairball] = React.useState(null);
  const [hatForReveal, setHatForReveal] = React.useState(null);
  const [isRevealOverlayVisible, setIsRevealOverlayVisible] = React.useState(false);
  const [isHatInventoryOpen, setIsHatInventoryOpen] = React.useState(false);
  const [hatInventoryFilter, setHatInventoryFilter] = React.useState('all');
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = React.useState(false);
  const [avatarFilter, setAvatarFilter] = React.useState('all');

  const animationManagerRef = React.useRef(null);
  const currentHatRevealAnimation = React.useRef(null);
  const [hatRevealStyle, setHatRevealStyle] = React.useState({ opacity: 0, transform: 'scale(0)', display: 'none' });

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
      setTreats(10);
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

  const playerDisplayAvatarSprite = React.useMemo(() => {
    const avatarConfig = getAvatarConfig(playerDisplayAvatarId);
    if (avatarConfig && avatarConfig.spritesheetPath) {
      return avatarConfig.spritesheetPath;
    }
    // Fallback if the selected avatar ID is invalid or its config is missing
    console.warn(`Sprite for avatar ID ${playerDisplayAvatarId} not found. Falling back to default avatar sprite.`);
    const defaultConfig = getAvatarConfig(defaultAvatarId);
    return defaultConfig ? defaultConfig.spritesheetPath : 'assets/avatars/tabby.png'; // Ultimate fallback
  }, [playerDisplayAvatarId]);

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
    catDrawerRef.current = new CatDrawer(canvas, context);

    animationManagerRef.current = new AnimationSystem.AnimationManager(); // Initialize AnimationManager

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

      if (animationManagerRef.current) {
        animationManagerRef.current.update(performance.now());
        // To draw particles on the main canvas (optional, might need context passed to animation draw methods)
        // animationManagerRef.current.draw(context);
      }

      if (currentHatRevealAnimation.current && currentHatRevealAnimation.current.isPlaying) {
        const anim = currentHatRevealAnimation.current;
        // anim.hat is the object HatRevealAnimation modifies (animatedHatObject)
        setHatRevealStyle({
          opacity: anim.hat.alpha !== undefined ? anim.hat.alpha : 1,
          transform: `scale(${anim.hat.scale !== undefined ? anim.hat.scale : 0})`,
          display: 'flex' // Or 'block' based on desired final layout of overlay content
        });
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
    // setIsRevealOverlayVisible(true); // Replaced by animation logic

    const canvas = canvasRef.current;
    const animatedHatObject = {
      scale: 0,
      alpha: 0,
      x: canvas ? canvas.width / 2 : 0, // For particle origin (if used on main canvas)
      y: canvas ? canvas.height / 2 : 0, // For particle origin (if used on main canvas)
      // Pass actual hat details for reference if animation logic evolves
      imagePath: currentHairball.hat.imagePath,
      name: currentHairball.hat.name,
    };

    const revealAnimation = new AnimationSystem.HatRevealAnimation(
      animatedHatObject,
      currentHairball.hat.rarity
    );

    revealAnimation.onComplete = () => {
      console.log("Hat reveal animation complete for:", currentHairball.hat.name);
      // currentHatRevealAnimation.current can be set to null here or managed by the timer effect
      // The useEffect for hiding will take care of setting display to 'none' after a delay.
    };

    if (animationManagerRef.current) {
      animationManagerRef.current.add(revealAnimation);
      currentHatRevealAnimation.current = revealAnimation;
      setHatRevealStyle({ opacity: 0, transform: 'scale(0)', display: 'flex' }); // Make container visible for animation
    } else {
      console.error("Animation manager not initialized. Showing statically.");
      setHatRevealStyle({ opacity: 1, transform: 'scale(1)', display: 'flex' }); // Fallback
    }

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
    let hideTimer;
    // Check hatRevealStyle.display and hatForReveal to decide if overlay is "active"
    if (hatRevealStyle.display !== 'none' && hatForReveal) {
      hideTimer = setTimeout(() => {
        // Animate out or just hide
        setHatRevealStyle({ opacity: 0, transform: 'scale(0)', display: 'none' });
        // currentHatRevealAnimation.current = null; // Clear animation ref
        setHatForReveal(null); // Clear revealed hat data
      }, 3000); // Duration overlay stays visible after animation
    }
    return () => {
      clearTimeout(hideTimer);
    };
  }, [hatRevealStyle.display, hatForReveal]); // Dependencies

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

        {hatForReveal && (
          <div
            className="hat-reveal-overlay"
            style={hatRevealStyle}
          >
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