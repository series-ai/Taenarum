const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Cat spritesheet
let pandaSpriteSheet = new Image();
let pandaSpriteSheetLoaded = false;

// ADDED: List of available spritesheet names
const availableSpriteSheetNames = [
    "cat.png",
    "dragon.png",
    "duck.png",
    "bread.png",
    "panda.png"
];
// ADDED: To store loaded spritesheet Image objects
const loadedSpriteSheets = {};

// Off-screen canvas for tinting
let offScreenCanvas = null;
let offCtx = null;

// Game configuration
const aspectRatio = 360 / 640;
const gameWidth = 360; // Base width
const gameHeight = 640; // Base height
let scale = 1;

// Game configuration additions
const QUALIFICATION_PERCENTAGE = 0.5; // 50% qualify
const FINISHED_CHARACTER_SPEED = 2; // Speed for characters after they cross the finish line

// Player properties
const player = {
    x: gameWidth / 2,
    y: gameHeight - 50,
    size: 20, // This is the size the sprite will be drawn on canvas
    speed: 2,
    finished: false,
    finishTime: 0,
    isPlayer: true, // To distinguish player from AI

    // Properties for falling animation
    isFalling: false,
    fallingAnimationDuration: 45, // Approx 0.75 seconds at 60fps
    fallingAnimationTick: 0,

    // Sprite properties
    spriteSheet: null, // Will be assigned after image loads
    spriteWidth: 256,  // Width of a single sprite frame in the spritesheet
    spriteHeight: 256, // Height of a single sprite frame in the spritesheet
    
    // New animation properties for panda.png (3x3, 256x256)
    // User: "0-2 for running up and 3-5 for running left"
    animRunUpFrames: [6, 7, 8],    // For moving "up" (e.g., towards finish line, Y decreases)
    animRunLeftFrames: [3, 4, 5],  // For moving "left" (X decreases)
    // Assuming "down" reuses "up" frames, and "right" reuses "left" frames (flipped).
    // Idle frame: using frame 0 (first of "up" animation) as default.
    animIdleFrame: 0, 

    currentAnimFrameValue: 0,        // The actual sprite index (0-8) to draw
    currentAnimSequenceIndex: 0,     // Index within the current animation sequence
    animationTick: 0,
    animationSpeed: 5,               // Update sprite frame every X game loops
    isMoving: false,
    
    currentAnimationType: 'idle',    // 'idle', 'up', 'down', 'left', 'right', 'up_finished'
    spriteShouldBeFlipped: false     // True if the current sprite needs to be flipped horizontally
};

// Joystick properties
const joystick = {
    x: gameWidth - 60,
    y: gameHeight - 60,
    radius: 40,
    stickRadius: 20,
    active: false,
    touchId: null,
    inputX: 0,
    inputY: 0,
    maxDistance: 20, // Max distance stick can move from center
};

// Level properties
const finishLine = {
    y: 50,
    height: 10,
    color: 'yellow',
};

const walls = [
    // Level boundaries (implicit for now, can add explicit wall objects if needed for visual)
    // Example internal walls:
    { x: 0, y: 0, width: gameWidth, height: 5, type: 'boundary' }, // Top boundary wall
    { x: 0, y: gameHeight - 5, width: gameWidth, height: 5, type: 'boundary' }, // Bottom boundary wall
    { x: 0, y: 0, width: 5, height: gameHeight, type: 'boundary' }, // Left boundary wall
    { x: gameWidth - 5, y: 0, width: 5, height: gameHeight, type: 'boundary' }, // Right boundary wall

    { x: 100, y: gameHeight / 2 - 50, width: 20, height: 100, color: 'gray', type: 'wall' },
    { x: gameWidth - 120, y: gameHeight / 2 - 100, width: 20, height: 100, color: 'gray', type: 'wall' },
    { x: 50, y: 200, width: 150, height: 20, color: 'gray', type: 'wall' }
];

const pits = [
    { x: gameWidth / 2 - 25, y: 300, width: 50, height: 50, color: 'black', type: 'pit' },
    { x: 200, y: 150, width: 60, height: 30, color: 'black', type: 'pit' },
];

// Game state
let gameState = 'PLAYING'; // Initial state, will expand later

// AI Opponents
const NUM_AI_OPPONENTS = 10; // Changed to 1 for easier debugging
const aiOpponents = [];
const aiColors = ['red', 'green', 'purple', 'orange', 'cyan', 'pink', 'brown', '#FFD700', '#C0C0C0', '#2F4F4F'];

let raceStartTime = 0;
const finishers = []; // Stores { id: string, time: number, isPlayer: boolean }

// UI Button definitions (virtual coordinates)
const winProceedButton = {
    x: gameWidth / 2 - 60,
    y: gameHeight / 2 + 30,
    width: 120,
    height: 40,
    text: 'Proceed'
};

const loseRestartButton = {
    x: gameWidth / 2 - 60,
    y: gameHeight / 2 + 30,
    width: 120,
    height: 40,
    text: 'Restart'
};

function resizeCanvas() {
    const V_WIDTH = 360;
    const V_HEIGHT = 640;

    const realViewportWidth = window.innerWidth;
    const realViewportHeight = window.innerHeight;

    const aspect = V_WIDTH / V_HEIGHT;
    let newWidth, newHeight;

    if (realViewportHeight / realViewportWidth > V_HEIGHT / V_WIDTH) {
        // Window is taller than game aspect ratio
        newWidth = realViewportWidth;
        newHeight = newWidth / aspect;
    } else {
        // Window is wider or same aspect ratio
        newHeight = realViewportHeight;
        newWidth = newHeight * aspect;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    scale = newWidth / V_WIDTH;

    // Re-calculate joystick position based on new canvas size and scale
    // For simplicity, joystick remains tied to the visual bottom right of the *scaled* game area
    joystick.x = gameWidth - 60; // Keep in virtual coordinates
    joystick.y = gameHeight - 60; // Keep in virtual coordinates

    // Style the canvas to center it if it's smaller than the window
    canvas.style.width = newWidth + 'px';
    canvas.style.height = newHeight + 'px';
    
    // Ensure canvas drawing context is scaled
    ctx.setTransform(scale, 0, 0, scale, 0, 0); // Apply scaling for all drawing operations
}


// Drawing functions
function drawPlayer() {
    if (!pandaSpriteSheetLoaded || !player.spriteSheet) return; // Don't draw if image not loaded or not assigned

    // If player has fallen and animation is done, don't draw them.
    if (player.finished && player.finishTime === Infinity && !player.isFalling) {
        return; 
    }

    // Draw player even if finished, as they might be moving off screen
    if (player.y + player.size / 2 > -20) { // Draw if still somewhat visible from top
        
        let currentDrawSize = player.size;
        if (player.isFalling) {
            const fallProgress = player.fallingAnimationTick / player.fallingAnimationDuration;
            currentDrawSize = player.size * Math.max(0, (1 - fallProgress)); // Shrink to 0
            if (currentDrawSize < 0.1) currentDrawSize = 0; // Effectively invisible, prevent tiny artifacts
        }
        
        if (currentDrawSize <= 0) return; // Don't attempt to draw if size is zero

        // player.currentAnimFrameValue is set by updatePlayerMovement
        const spriteIndexToDraw = player.currentAnimFrameValue;

        const spriteSheetCols = 3; // Panda spritesheet is 3 columns wide
        const sx = (spriteIndexToDraw % spriteSheetCols) * player.spriteWidth;
        const sy = Math.floor(spriteIndexToDraw / spriteSheetCols) * player.spriteHeight;

        ctx.save(); // Save current context state

        if (player.spriteShouldBeFlipped) {
            ctx.translate(player.x, player.y); // Translate to player's center for flipping
            ctx.scale(-1, 1);                  // Flip horizontally
            ctx.drawImage(
                player.spriteSheet,
                sx, sy,                                    // Source x, y on spritesheet
                player.spriteWidth, player.spriteHeight,  // Source width, height of one frame
                -currentDrawSize / 2, -currentDrawSize / 2,       // Destination x, y (relative to translated & scaled origin)
                currentDrawSize, currentDrawSize                    // Destination width, height on canvas
            );
        } else { // Draw normally
            ctx.drawImage(
                player.spriteSheet,
                sx, sy,                                    // Source x, y on spritesheet
                player.spriteWidth, player.spriteHeight,  // Source width, height of one frame
                player.x - currentDrawSize / 2, player.y - currentDrawSize / 2, // Destination top-left on canvas
                currentDrawSize, currentDrawSize                    // Destination width, height on canvas
            );
        }
        ctx.restore(); // Restore context to prevent affecting other drawings
    }
}

function drawLevel() {
    // Draw finish line
    ctx.fillStyle = finishLine.color;
    ctx.fillRect(0, finishLine.y, gameWidth, finishLine.height);

    // Draw walls
    walls.forEach(wall => {
        if (wall.type === 'wall') { // Only draw visible walls, not boundary placeholders unless styled
            ctx.fillStyle = wall.color;
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        }
    });

    // Draw pits
    pits.forEach(pit => {
        ctx.fillStyle = pit.color;
        ctx.fillRect(pit.x, pit.y, pit.width, pit.height);
    });
}

function drawJoystick() {
    // Outer circle
    ctx.beginPath();
    ctx.arc(joystick.x, joystick.y, joystick.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)'; // Semi-transparent grey
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner stick
    ctx.beginPath();
    let stickX = joystick.x + joystick.inputX * joystick.maxDistance;
    let stickY = joystick.y + joystick.inputY * joystick.maxDistance;
    ctx.arc(stickX, stickY, joystick.stickRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(80, 80, 80, 0.8)'; // Darker grey
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    ctx.stroke();
}

function drawAI() {
    // Guard clause: If essential resources for sprite drawing aren't ready, exit.
    // This prevents errors if drawAI is called before spritesheet or offscreen canvas is initialized.
    // console.log('[Debug drawAI] Called'); // General call check
    if (!pandaSpriteSheetLoaded || !offScreenCanvas || !offCtx) {
        // console.log('[Debug drawAI] Exiting early - resources not ready');
        return;
    }

    aiOpponents.forEach(ai => {
        // Ensure AI has a spritesheet; should be true if pandaSpriteSheetLoaded is true
        // and initAI/onload logic correctly assigned it.
        if (!ai.spriteSheet) {
            // console.log(`[Debug drawAI] AI ${ai.id} has no spritesheet.`);
            return;
        }

        // If AI has fallen and animation is done, don't draw them.
        if (ai.finished && ai.finishTime === Infinity && !ai.isFalling) {
            console.log(`[Debug drawAI] AI ${ai.id} is finished falling and not drawn.`);
            return; 
        }

        if (ai.y + ai.size / 2 > -20) { // Draw if still somewhat visible from top
            
            let currentDrawSize = ai.size;
            if (ai.isFalling) {
                const fallProgress = ai.fallingAnimationTick / ai.fallingAnimationDuration;
                currentDrawSize = ai.size * Math.max(0, (1 - fallProgress)); // Shrink to 0
                if (currentDrawSize < 0.1) currentDrawSize = 0; // Effectively invisible
                console.log(`[Debug drawAI] Falling AI ${ai.id}: tick=${ai.fallingAnimationTick}, progress=${fallProgress.toFixed(2)}, drawSize=${currentDrawSize.toFixed(2)}`);
            }

            if (currentDrawSize <= 0 && ai.isFalling) { // Specific log for when it becomes 0 due to falling
                console.log(`[Debug drawAI] AI ${ai.id} currentDrawSize is <= 0 due to falling, not drawing.`);
                return;
            } else if (currentDrawSize <= 0) {
                 return; // Don't attempt to draw if size is zero for other reasons (though unlikely here)
            }

            const spriteIndexToDraw = ai.currentAnimFrameValue;
            const spriteSheetCols = 3; // Panda spritesheet is 3 columns wide
            const sx = (spriteIndexToDraw % spriteSheetCols) * ai.spriteWidth;
            const sy = Math.floor(spriteIndexToDraw / spriteSheetCols) * ai.spriteHeight;

            // 1. Render tinted sprite to off-screen canvas
            // Clear the off-screen canvas (important for transparency and drawing the next AI)
            offCtx.clearRect(0, 0, offScreenCanvas.width, offScreenCanvas.height);
            
            // Draw original sprite frame to off-screen canvas
            offCtx.drawImage(
                ai.spriteSheet, // The panda spritesheet
                sx, sy, ai.spriteWidth, ai.spriteHeight, // Source rect from spritesheet
                0, 0, ai.spriteWidth, ai.spriteHeight    // Destination rect on off-screen canvas (at full size)
            );

            // Apply tint on off-screen canvas if AI has a color
            if (ai.color) {
                const originalGlobalAlphaOff = offCtx.globalAlpha; 
                const originalCompositeOpOff = offCtx.globalCompositeOperation;

                offCtx.globalAlpha = 0.4; // Opacity of the tint layer
                offCtx.fillStyle = ai.color;
                offCtx.globalCompositeOperation = 'source-atop'; // Apply color only to opaque pixels of the sprite
                offCtx.fillRect(0, 0, ai.spriteWidth, ai.spriteHeight); // Fill the entire off-screen canvas area

                // Reset off-screen context properties to defaults for the next draw operation or AI
                offCtx.globalAlpha = originalGlobalAlphaOff; 
                offCtx.globalCompositeOperation = originalCompositeOpOff;
            }

            // 2. Draw the (now tinted) off-screen canvas to the main game canvas
            ctx.save(); // Save main context state for potential flip/transformations
            
            if (ai.spriteShouldBeFlipped) {
                ctx.translate(ai.x, ai.y); // Translate to AI's center for flipping
                ctx.scale(-1, 1);          // Flip horizontally
                ctx.drawImage(
                    offScreenCanvas, // Source is the tinted off-screen canvas
                    -currentDrawSize / 2, -currentDrawSize / 2, // Destination x, y (relative to translated & scaled origin)
                    currentDrawSize, currentDrawSize           // Destination width, height on main canvas (scaled down)
                );
            } else { // Draw normally (not flipped)
                ctx.drawImage(
                    offScreenCanvas, // Source is the tinted off-screen canvas
                    ai.x - currentDrawSize / 2, ai.y - currentDrawSize / 2, // Destination top-left on main canvas
                    currentDrawSize, currentDrawSize           // Destination width, height on main canvas (scaled down)
                );
            }
            ctx.restore(); // Restore main context state
        }
    });
}

// Update functions
function updatePlayerMovement() {
    // Handle falling animation first
    if (player.isFalling) {
        player.fallingAnimationTick++;
        // Player sprite will be scaled down in drawPlayer

        if (player.fallingAnimationTick >= player.fallingAnimationDuration) {
            player.finished = true;
            player.finishTime = Infinity;
            player.isFalling = false; // Reset state

            if (!finishers.find(f => f.isPlayer)) {
                finishers.push({ id: 'player', time: player.finishTime, isPlayer: true });
            }
            checkAllFinished(); // Player's fate is sealed, check game state
        }
        // Skip other movement and animation updates while falling
        player.isMoving = false; 
        // Optionally, set a specific animation type/frame for falling if available
        // player.currentAnimationType = 'falling'; 
        // player.currentAnimFrameValue = player.animFallingFrame; 
        return; 
    }

    if (player.finished) {
        player.y -= FINISHED_CHARACTER_SPEED; // Move finished player off-screen
        player.isMoving = true; // Considered moving for animation purposes

        // Ensure 'up' animation for moving off-screen
        if (player.currentAnimationType !== 'up_finished') {
            player.currentAnimationType = 'up_finished';
            player.currentAnimSequenceIndex = 0;
            player.animationTick = 0;
            player.currentAnimFrameValue = player.animRunUpFrames[0]; // Start with the first frame of "up" animation
        }
        
        player.animationTick++;
        if (player.animationTick >= player.animationSpeed) {
            player.animationTick = 0;
            player.currentAnimSequenceIndex = (player.currentAnimSequenceIndex + 1) % player.animRunUpFrames.length;
            player.currentAnimFrameValue = player.animRunUpFrames[player.currentAnimSequenceIndex];
        }
        player.spriteShouldBeFlipped = false; // 'Up' animation is not flipped
        return;
    }

    if (gameState !== 'PLAYING') {
        player.isMoving = false;
        if (player.currentAnimationType !== 'idle') {
            player.currentAnimSequenceIndex = 0;
            player.animationTick = 0;
        }
        player.currentAnimationType = 'idle';
        player.currentAnimFrameValue = player.animIdleFrame;
        player.spriteShouldBeFlipped = false; // Default idle not flipped
        return;
    }

    let newAnimationType = player.currentAnimationType;
    let newSpriteShouldBeFlipped = player.spriteShouldBeFlipped;
    let currentSequence = null;
    let newFrameValue = player.currentAnimFrameValue;


    if (joystick.active && (joystick.inputX !== 0 || joystick.inputY !== 0)) {
        player.isMoving = true;

        const angle = Math.atan2(joystick.inputY, joystick.inputX) * 180 / Math.PI;

        if (angle >= -135 && angle < -45) { // Moving UP (Y is negative)
            newAnimationType = 'up';
            currentSequence = player.animRunUpFrames;
            newSpriteShouldBeFlipped = false;
        } else if (angle >= 45 && angle < 135) { // Moving DOWN (Y is positive)
            newAnimationType = 'down';
            currentSequence = player.animRunUpFrames; // Reusing 'up' frames for 'down'
            newSpriteShouldBeFlipped = false;         // Assuming 'up' frames are front-facing or symmetrical
        } else if (angle >= 135 || angle < -135) { // Moving LEFT
            newAnimationType = 'left';
            currentSequence = player.animRunLeftFrames;
            newSpriteShouldBeFlipped = true; // Left frames are inherently left-facing
        } else { // Moving RIGHT (angle between -45 and 45, X is positive)
            newAnimationType = 'right';
            currentSequence = player.animRunLeftFrames; // Use left frames...
            newSpriteShouldBeFlipped = false;      // ...and flip them
        }
        
        if (newAnimationType !== player.currentAnimationType || player.currentAnimationType === 'idle') { // Reset if type changed or was idle
            player.currentAnimSequenceIndex = 0;
            player.animationTick = 0;
            if (currentSequence) {
                newFrameValue = currentSequence[0];
            }
        }
        player.currentAnimationType = newAnimationType;
        player.spriteShouldBeFlipped = newSpriteShouldBeFlipped;

        player.animationTick++;
        if (player.animationTick >= player.animationSpeed) {
            player.animationTick = 0;
            if (currentSequence) {
                player.currentAnimSequenceIndex = (player.currentAnimSequenceIndex + 1) % currentSequence.length;
                newFrameValue = currentSequence[player.currentAnimSequenceIndex];
            }
        }
        player.currentAnimFrameValue = newFrameValue;

        const moveAngle = Math.atan2(joystick.inputY, joystick.inputX);
        const magnitude = Math.sqrt(joystick.inputX * joystick.inputX + joystick.inputY * joystick.inputY);
        const normalizedMagnitude = Math.min(1, magnitude);

        let nextX = player.x + Math.cos(moveAngle) * player.speed * normalizedMagnitude;
        let nextY = player.y + Math.sin(moveAngle) * player.speed * normalizedMagnitude;

        const prevX = player.x;
        const prevY = player.y;

        player.x = nextX;
        player.y = nextY;

        checkCollisions(player, prevX, prevY);
        if (player.finished) return; // If collision resulted in finishing

        for (const ai of aiOpponents) {
            if (!ai.finished) {
                resolveCharacterBump(player, ai);
            }
        }
        if (player.finished) return;

        if (!player.finished && player.y - player.size / 2 <= finishLine.y + finishLine.height) {
            player.finished = true;
            player.finishTime = performance.now() - raceStartTime;
            if (!finishers.find(f => f.isPlayer)) {
                finishers.push({ id: 'player', time: player.finishTime, isPlayer: true });
            }
            checkAllFinished();
        }
    } else { // Not actively moving via joystick
        player.isMoving = false;
        if (player.currentAnimationType !== 'idle') {
             player.currentAnimSequenceIndex = 0; 
             player.animationTick = 0;
        }
        player.currentAnimationType = 'idle';
        player.currentAnimFrameValue = player.animIdleFrame; 
        player.spriteShouldBeFlipped = false; // Default idle not flipped
    }
}

function updateAIMovement() {
    const SIDE_STEP_SPEED_FACTOR = 0.6;

    aiOpponents.forEach((ai, index) => {
        // Handle AI falling animation first
        if (ai.isFalling) {
            ai.fallingAnimationTick++;
            console.log(`[Debug updateAIMovement] Falling AI ${ai.id}: isFalling=${ai.isFalling}, tick=${ai.fallingAnimationTick}`);
            // AI sprite will be scaled down in drawAI

            if (ai.fallingAnimationTick >= ai.fallingAnimationDuration) {
                ai.finished = true;
                ai.finishTime = Infinity;
                ai.isFalling = false; // Reset state
                console.log(`[Debug updateAIMovement] AI ${ai.id} finished falling.`);

                if (!finishers.find(f => f.id === ai.id)) {
                    finishers.push({ id: ai.id, time: ai.finishTime, isPlayer: false });
                }
                checkAllFinished(); // AI's fate is sealed, check game state
            }
            // Skip other movement and animation updates while falling
            ai.isMoving = false;
            // Optionally, set a specific animation type/frame for falling if available
            // ai.currentAnimationType = 'falling'; 
            // ai.currentAnimFrameValue = ai.animFallingFrame; 
            return; 
        }

        if (ai.finished) {
            ai.y -= FINISHED_CHARACTER_SPEED; // Move finished AI off-screen
            ai.isMoving = true; // Considered moving for animation

            // Ensure 'up' animation for moving off-screen
            if (ai.currentAnimationType !== 'up_finished') {
                ai.currentAnimationType = 'up_finished';
                ai.currentAnimSequenceIndex = 0;
                ai.animationTick = 0;
                ai.currentAnimFrameValue = ai.animRunUpFrames[0];
                ai.spriteShouldBeFlipped = false;
            }
            
            ai.animationTick++;
            if (ai.animationTick >= ai.animationSpeed) {
                ai.animationTick = 0;
                ai.currentAnimSequenceIndex = (ai.currentAnimSequenceIndex + 1) % ai.animRunUpFrames.length;
                ai.currentAnimFrameValue = ai.animRunUpFrames[ai.currentAnimSequenceIndex];
            }
            return;
        }

        if (gameState !== 'PLAYING') {
            ai.stuckDirection = 0;
            ai.isMoving = false;
            if (ai.currentAnimationType !== 'idle') {
                ai.currentAnimSequenceIndex = 0;
                ai.animationTick = 0;
            }
            ai.currentAnimationType = 'idle';
            ai.currentAnimFrameValue = ai.animIdleFrame;
            ai.spriteShouldBeFlipped = false;
            return;
        }
        
        const prevX = ai.x;
        const prevY = ai.y;
        let intendedNextY = ai.y - ai.speed;
        let intendedNextX = ai.x;

        let newAnimationType = ai.currentAnimationType;
        let newSpriteShouldBeFlipped = ai.spriteShouldBeFlipped;
        let currentSequence = null;
        let newFrameValue = ai.currentAnimFrameValue;
        ai.isMoving = false; // Assume not moving unless proven otherwise

        // --- Check Upward Movement --- 
        let lookAheadRectY = { x: ai.x - ai.size / 2, y: intendedNextY - ai.size / 2, width: ai.size, height: ai.size };
        let hitWallMovingUp = false;
        for (const wall of walls) {
            if (isRectCollision(lookAheadRectY, wall)) { hitWallMovingUp = true; break; }
        }

        let hitPitMovingUp = false;
        if (!hitWallMovingUp) {
            // AI Pathfinding: Check if CENTER of intended *next Y* position is in a pit
            const nextCenterY_forPitCheck = intendedNextY;
            const currentCenterX_forPitCheck = ai.x;
            for (const pit of pits) {
                if (currentCenterX_forPitCheck > pit.x && currentCenterX_forPitCheck < pit.x + pit.width &&
                    nextCenterY_forPitCheck > pit.y && nextCenterY_forPitCheck < pit.y + pit.height) {
                    hitPitMovingUp = true; 
                    // console.log(`[Debug AI PathPit] AI ${ai.id} sees pit ahead (moving up) at ${currentCenterX_forPitCheck.toFixed(1)},${nextCenterY_forPitCheck.toFixed(1)}`);
                    break; 
                }
            }
        }

        if (!hitWallMovingUp && !hitPitMovingUp) {
            // Can move UPWARDS successfully
            ai.y = intendedNextY;
            ai.stuckDirection = 0;
            ai.isMoving = true;
            newAnimationType = 'up';
            currentSequence = ai.animRunUpFrames;
            newSpriteShouldBeFlipped = false;
        } else {
            // CANNOT move UPWARDS
            ai.y = prevY; 

            if (ai.stuckDirection === 0) {
                ai.stuckDirection = (Math.random() < 0.5) ? -1 : 1;
            }

            intendedNextX = ai.x + (ai.speed * SIDE_STEP_SPEED_FACTOR * ai.stuckDirection);
            let lookAheadRectX = { x: intendedNextX - ai.size / 2, y: ai.y - ai.size / 2, width: ai.size, height: ai.size };
            
            let canMoveSidewaysThisStep = true;
            for (const wall of walls) {
                if (isRectCollision(lookAheadRectX, wall)) { canMoveSidewaysThisStep = false; break; }
            }
            if (canMoveSidewaysThisStep) {
                // AI Pathfinding: Check if CENTER of intended *next X* position is in a pit
                const nextCenterX_forSidewaysPitCheck = intendedNextX;
                const currentCenterY_forSidewaysPitCheck = ai.y;
                for (const pit of pits) {
                    if (nextCenterX_forSidewaysPitCheck > pit.x && nextCenterX_forSidewaysPitCheck < pit.x + pit.width &&
                        currentCenterY_forSidewaysPitCheck > pit.y && currentCenterY_forSidewaysPitCheck < pit.y + pit.height) {
                        canMoveSidewaysThisStep = false; 
                        // console.log(`[Debug AI PathPit] AI ${ai.id} sees pit ahead (moving sideways) at ${nextCenterX_forSidewaysPitCheck.toFixed(1)},${currentCenterY_forSidewaysPitCheck.toFixed(1)}`);
                        break; 
                    }
                }
            }

            if (canMoveSidewaysThisStep) {
                ai.x = intendedNextX;
                ai.isMoving = true;
                currentSequence = ai.animRunLeftFrames;
                if (ai.stuckDirection === -1) { // Moving left
                    newAnimationType = 'left';
                    newSpriteShouldBeFlipped = true; 
                } else { // Moving right
                    newAnimationType = 'right';
                    newSpriteShouldBeFlipped = false;
                }
            } else {
                ai.x = prevX;
                ai.stuckDirection *= -1; // Flip direction
                ai.isMoving = false; // Stuck, so not "moving" for animation
                newAnimationType = 'idle'; // Or a specific "stuck" animation if we had one
                currentSequence = null;
                newSpriteShouldBeFlipped = false;
            }
        }

        // Animation update logic based on movement
        if (!ai.isMoving) {
            if (newAnimationType !== 'idle') {
                ai.currentAnimSequenceIndex = 0;
                ai.animationTick = 0;
            }
            newAnimationType = 'idle';
            newFrameValue = ai.animIdleFrame;
            newSpriteShouldBeFlipped = false;
        } else {
            if (newAnimationType !== ai.currentAnimationType || ai.currentAnimationType === 'idle') {
                ai.currentAnimSequenceIndex = 0;
                ai.animationTick = 0;
                if (currentSequence) {
                    newFrameValue = currentSequence[0];
                }
            }
            ai.animationTick++;
            if (ai.animationTick >= ai.animationSpeed) {
                ai.animationTick = 0;
                if (currentSequence) {
                    ai.currentAnimSequenceIndex = (ai.currentAnimSequenceIndex + 1) % currentSequence.length;
                    newFrameValue = currentSequence[ai.currentAnimSequenceIndex];
                }
            }
        }
        ai.currentAnimationType = newAnimationType;
        ai.spriteShouldBeFlipped = newSpriteShouldBeFlipped;
        ai.currentAnimFrameValue = newFrameValue;


        // Boundary checks for AI after all movement logic
        ai.x = Math.max(ai.size / 2, Math.min(ai.x, gameWidth - ai.size / 2));
        ai.y = Math.max(ai.size / 2, Math.min(ai.y, gameHeight - ai.size / 2)); // y should mostly be handled by collision

        // AI-AI collisions
        for (let i = index + 1; i < aiOpponents.length; i++) {
            const otherAi = aiOpponents[i];
            if (!otherAi.finished) { 
                resolveCharacterBump(ai, otherAi);
            }
        }
        checkCollisions(ai, prevX, prevY);
        if (ai.finished) return; // If somehow finished due to bump

        // Check finish line for AI
        if (!ai.finished && ai.y - ai.size / 2 <= finishLine.y + finishLine.height) {
            ai.finished = true;
            ai.finishTime = performance.now() - raceStartTime;
            if (!finishers.find(f => f.id === ai.id)) {
                finishers.push({ id: ai.id, time: ai.finishTime, isPlayer: false });
            }
            checkAllFinished();
             // After finishing, AI will now be handled by the block at the start of this function.
        }
    });
}

function checkAllFinished() {
    if (gameState !== 'PLAYING') return; // Only act if the game is supposed to be playing

    // Condition 1: Player's race is over (either by finishing line or completing fall animation).
    // This directly implements: "if there are no remaining alive players (the human player) 
    // who haven't crossed the line, the round also ends."
    if (player.finished) { // player.finished is true once fall animation completes or finish line crossed
        gameState = 'RACE_OVER';
        determineRaceOutcome(); // This will sort finishers and decide win/lose
        return;
    }

    // If player is NOT finished, check other conditions for game end:
    const totalRacers = 1 + NUM_AI_OPPONENTS;
    const requiredToQualifyCount = Math.ceil(totalRacers * QUALIFICATION_PERCENTAGE);
    const successfulFinishers = finishers.filter(f => f.time !== Infinity);

    // Condition 2: Enough racers (could be AIs) have successfully qualified based on percentage.
    if (successfulFinishers.length >= requiredToQualifyCount) {
        gameState = 'RACE_OVER';
        determineRaceOutcome();
        return;
    }
    
    // Condition 3: All racers are accounted for in the finishers list.
    // This acts as a catch-all, e.g., if all AIs DNF and player is still somehow racing but then also DNFs
    // in a way not immediately setting player.finished.
    // Given Condition 1, this is less likely to be the primary trigger unless player.finished is delayed.
    if (finishers.length === totalRacers) {
        gameState = 'RACE_OVER';
        determineRaceOutcome();
        return;
    }
}

function determineRaceOutcome() {
    // This function is called when gameState becomes RACE_OVER

    finishers.sort((a, b) => a.time - b.time);
    const totalRacers = 1 + NUM_AI_OPPONENTS;
    const qualificationRankLimit = Math.ceil(totalRacers * QUALIFICATION_PERCENTAGE);

    let playerRank = -1;
    let playerResult = finishers.find(f => f.isPlayer);

    if (playerResult) {
        if (playerResult.time === Infinity) { // Player fell in a pit
            gameState = 'GAME_LOSE';
            return;
        }
        // Find rank only among actual finishers
        const actualFinishersSorted = finishers.filter(f => f.time !== Infinity).sort((a,b) => a.time - b.time);
        const playerActualRank = actualFinishersSorted.findIndex(f => f.isPlayer) + 1;

        if (playerActualRank > 0 && playerActualRank <= qualificationRankLimit) {
            gameState = 'GAME_WIN';
        } else {
            gameState = 'GAME_LOSE'; // Finished but not qualified
        }
    } else {
        // Player did not finish by the time race ended (DNF)
        gameState = 'GAME_LOSE';
    }
}

function checkCollisions(character, prevX, prevY) {
    console.log(`[Debug checkCollisions ENTRY] char ID: ${character.id || 'player'}, isFalling: ${character.isFalling}, finished: ${character.finished}`);
    if (character.finished && !character.isFalling) {
        console.log(`[Debug checkCollisions] char ID: ${character.id || 'player'} returning early: finished and not falling.`);
        return; 
    }

    const charRect = {
        x: character.x - character.size / 2,
        y: character.y - character.size / 2,
        width: character.size,
        height: character.size
    };

    // Wall collisions
    for (const wall of walls) {
        if (isRectCollision(charRect, wall)) {
            // More robust collision response:
            // Try moving only on X axis
            character.x = prevX;
            character.y = charRect.y + character.size / 2; // current Y is fine if only X caused collision
             const tempPlayerRectX = { ...charRect, x: prevX - character.size / 2};
            if (isRectCollision(tempPlayerRectX, wall)) { // Still collision, X movement was the issue
                 character.x = prevX; // Reset X
                 character.y = prevY; // Reset Y fully for now, simpler.
                 // A more advanced response would push the player out of the wall
                 // For now, just stop movement into the wall.
                 // A simple push-out:
                 const overlapX = (charRect.x + charRect.width / 2) - (wall.x + wall.width / 2);
                 const overlapY = (charRect.y + charRect.height / 2) - (wall.y + wall.height / 2);
                 const combinedHalfWidths = charRect.width / 2 + wall.width / 2;
                 const combinedHalfHeights = charRect.height / 2 + wall.height / 2;

                 if (Math.abs(overlapX) < combinedHalfWidths && Math.abs(overlapY) < combinedHalfHeights) {
                    const penX = combinedHalfWidths - Math.abs(overlapX);
                    const penY = combinedHalfHeights - Math.abs(overlapY);
                    if (penX < penY) { // Push horizontally
                        character.x = prevX; // Block X movement
                        character.y = charRect.y + character.size / 2; // Allow Y
                        if (isRectCollision({x: character.x - character.size/2, y: character.y - character.size/2, width:character.size, height:character.size}, wall)) {
                            character.y = prevY; // If Y still collides, block Y too
                        }

                    } else { // Push vertically
                        character.y = prevY; // Block Y movement
                        character.x = charRect.x + character.size / 2; // Allow X
                         if (isRectCollision({x: character.x - character.size/2, y: character.y - character.size/2, width:character.size, height:character.size}, wall)) {
                            character.x = prevX; // If X still collides, block X too
                        }
                    }
                 }
                 // Fallback to full stop if complex push-out fails
                 if (isRectCollision({x: character.x - character.size/2, y: character.y - character.size/2, width:character.size, height:character.size}, wall)) {
                    character.x = prevX;
                    character.y = prevY;
                 }

            }
            // No return here, check all walls
        }
    }
     // Pit collisions
    for (const pit of pits) {
        const charCenterX = character.x; 
        const charCenterY = character.y; 
        
        // Actual Falling: Use character's current CENTER point for pit collision
        // charRect is already defined at the start of checkCollisions
        if (!character.isPlayer) { 
            // console.log(`[Debug PitCheck] AI ID: ${character.id}, AI Rect: (x:${charRect.x.toFixed(2)}, y:${charRect.y.toFixed(2)}, w:${charRect.width}, h:${charRect.height}), Pit: (x:${pit.x}, y:${pit.y}, w:${pit.width}, h:${pit.height})`);
        }

        if (charCenterX > pit.x && charCenterX < pit.x + pit.width &&
            charCenterY > pit.y && charCenterY < pit.y + pit.height) { //MODIFIED BACK to center point
            if (!character.isFalling && !character.finished) { // Start falling only if not already falling or truly finished
                if (character.isPlayer) {
                    console.log("[Debug checkCollisions] Player is falling into a pit!");
                } else {
                    console.log(`[Debug checkCollisions] AI ${character.id} is falling into a pit! Setting isFalling=true.`);
                }
                character.isFalling = true;
                character.fallingAnimationTick = 0;
                // Do NOT set finished, add to finishers, or call checkAllFinished here for player or AI.
                // This will be handled in their respective update functions after the animation.
            }
            // Character has interacted with a pit (now falling)
            // No further collision checks for *this character* against *other pits/walls* this frame.
            return; 
        }
    }
}

function isRectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Event listeners for joystick
function getTouchPos(canvas, touchEvent) {
    const rect = canvas.getBoundingClientRect();
    const touch = touchEvent.touches[0];
    // Convert touch position to canvas coordinates, considering the scaling
    return {
        x: (touch.clientX - rect.left) / scale,
        y: (touch.clientY - rect.top) / scale
    };
}

function getMousePos(canvas, mouseEvent) {
    const rect = canvas.getBoundingClientRect();
     // Convert mouse position to canvas coordinates, considering the scaling
    return {
        x: (mouseEvent.clientX - rect.left) / scale,
        y: (mouseEvent.clientY - rect.top) / scale
    };
}


function onPointerDown(event) {
    event.preventDefault(); // Prevent scrolling/default browser actions

    if (gameState === 'GAME_WIN') {
        const pos = event.type === 'touchstart' ? getTouchPos(canvas, event) : getMousePos(canvas, event);
        if (isPointInRect(pos, winProceedButton)) {
            resetGame();
            return;
        }
    } else if (gameState === 'GAME_LOSE') {
        const pos = event.type === 'touchstart' ? getTouchPos(canvas, event) : getMousePos(canvas, event);
        if (isPointInRect(pos, loseRestartButton)) {
            resetGame();
            return;
        }
    }

    if (gameState !== 'PLAYING') return; // Only allow joystick if playing

    let pos;
    if (event.type === 'touchstart') {
        pos = getTouchPos(canvas, event);
        if (joystick.active && event.touches.length > 1) return; // Ignore multi-touch if joystick already active
        joystick.touchId = event.touches[0].identifier;
    } else { // mousedown
        pos = getMousePos(canvas, event);
    }

    const dx = pos.x - joystick.x;
    const dy = pos.y - joystick.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < joystick.radius + joystick.stickRadius) { // A bit more lenient activation area
        joystick.active = true;
        updateJoystickStick(pos.x, pos.y);
    }
}

function onPointerMove(event) {
    event.preventDefault();
    if (!joystick.active) return;

    let pos;
    if (event.type === 'touchmove') {
        let touch = null;
        for(let i=0; i < event.touches.length; i++) {
            if(event.touches[i].identifier === joystick.touchId) {
                touch = event.touches[i];
                break;
            }
        }
        if (!touch) return; // Not the touch that activated the joystick
        pos = getTouchPos(canvas, event); // getTouchPos uses event.touches[0], ensure to pass the correct event structure or modify
         const rect = canvas.getBoundingClientRect();
         pos = { // Re-calculate for the specific touch
            x: (touch.clientX - rect.left) / scale,
            y: (touch.clientY - rect.top) / scale
        };

    } else { // mousemove
        pos = getMousePos(canvas, event);
    }
    updateJoystickStick(pos.x, pos.y);
}

function onPointerUp(event) {
    event.preventDefault();
    if (event.type === 'touchend' || event.type === 'touchcancel') {
        if (joystick.touchId !== null) {
            let touchStillActive = false;
            for(let i=0; i < event.changedTouches.length; i++) {
                if(event.changedTouches[i].identifier === joystick.touchId) {
                    touchStillActive = true; // This specific touch ended
                    break;
                }
            }
            // If the touch that ended was the one controlling the joystick
             if (touchStillActive || event.touches.length === 0 && joystick.active) {
                 // Ensure this check correctly identifies the joystick's controlling touch ending
                 let stillOurTouch = false;
                 for (let i = 0; i < event.changedTouches.length; i++) {
                     if (event.changedTouches[i].identifier === joystick.touchId) {
                         stillOurTouch = true;
                         break;
                     }
                 }
                 if(stillOurTouch) {
                    resetJoystick();
                 }
             }
        }
    } else { // mouseup
        if (joystick.active) {
            resetJoystick();
        }
    }
}

function updateJoystickStick(x, y) {
    const dx = x - joystick.x;
    const dy = y - joystick.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < joystick.maxDistance) {
        joystick.inputX = dx / joystick.maxDistance;
        joystick.inputY = dy / joystick.maxDistance;
    } else {
        joystick.inputX = dx / distance; // Normalize
        joystick.inputY = dy / distance; // Normalize
    }
}

function resetJoystick() {
    joystick.active = false;
    joystick.inputX = 0;
    joystick.inputY = 0;
    joystick.touchId = null;
}

// Game loop
function gameLoop() {
    // Clear canvas with game background color (or specific color if needed)
    // Important: ctx.clearRect expects coordinates in the unscaled canvas space if transform is reset
    // Since we set transform once, these coordinates are in virtual space
    ctx.fillStyle = '#87CEEB'; // Light sky blue ground
    ctx.fillRect(0, 0, gameWidth, gameHeight);


    if (gameState === 'PLAYING' || gameState === 'RACE_OVER') {
        updatePlayerMovement();
        updateAIMovement();
    } else if (gameState === 'GAME_LOSE') {
        // Later: drawLoseScreen();
        // console.log("Game Over - You Lose (pit)");
    }

    drawLevel();
    drawPlayer();
    drawAI();
    
    if (gameState === 'PLAYING' || gameState === 'RACE_OVER') {
         drawJoystick(); // Only draw joystick when playing or race just ended
    }

    if (gameState === 'GAME_WIN') {
        drawWinScreen();
    } else if (gameState === 'GAME_LOSE') {
        drawLoseScreen();
    }
    
    requestAnimationFrame(gameLoop);
}

function drawWinScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('You Win!', gameWidth / 2, gameHeight / 2 - 60);
    ctx.font = '18px Arial';
    ctx.fillText('Top 50% Qualified', gameWidth / 2, gameHeight / 2 - 30);

    // Draw Proceed button
    ctx.fillStyle = '#4CAF50'; // Green
    ctx.fillRect(winProceedButton.x, winProceedButton.y, winProceedButton.width, winProceedButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(winProceedButton.text, gameWidth / 2, winProceedButton.y + winProceedButton.height / 2 + 8);
}

function drawLoseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('You Lose!', gameWidth / 2, gameHeight / 2 - 30);

    // Draw Restart button
    ctx.fillStyle = '#f44336'; // Red
    ctx.fillRect(loseRestartButton.x, loseRestartButton.y, loseRestartButton.width, loseRestartButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(loseRestartButton.text, gameWidth / 2, loseRestartButton.y + loseRestartButton.height / 2 + 8);
}

function resetGame() {
    player.x = gameWidth / 2;
    player.y = gameHeight - 50;
    player.finished = false;
    player.finishTime = 0;
    player.isFalling = false;
    player.fallingAnimationTick = 0;

    finishers.length = 0; // Clear finishers array
    initAI(); // This will now correctly clear and re-populate AIs.

    raceStartTime = performance.now();
    gameState = 'PLAYING';
    resetJoystick(); // Also reset joystick state
}

function initAI() {
    aiOpponents.length = 0; // Clear previous AI if any (for restarts)
    for (let i = 0; i < NUM_AI_OPPONENTS; i++) {
        const startX = (gameWidth / (NUM_AI_OPPONENTS + 1)) * (i + 1) + (Math.random() * 20 - 10);
        
        // ADDED: Randomly select a spritesheet for this AI
        const randomSpriteName = availableSpriteSheetNames[Math.floor(Math.random() * availableSpriteSheetNames.length)];
        const spritePath = `spritesheets/${randomSpriteName}`;

        // Create a new AI object
        const newAI = {
            x: Math.max(10, Math.min(gameWidth - 10, startX)),
            y: gameHeight - 30 - (Math.random() * 20),
            size: 20,
            color: aiColors[i % aiColors.length], // Assign color for tinting
            speed: 1 + Math.random() * 0.8,
            finished: false,
            finishTime: 0,
            isPlayer: false,
            id: 'ai' + i,
            stuckDirection: 0,
            isFalling: false,
            fallingAnimationDuration: 45,
            fallingAnimationTick: 0,
            spriteSheet: null, // Will be set once its specific image loads
            spriteSheetPath: spritePath, // Store the path for loading
            spriteName: randomSpriteName, // Store the name for potential reuse of loaded images
            spriteWidth: 256,
            spriteHeight: 256,
            animRunUpFrames: [6, 7, 8],
            animRunLeftFrames: [3, 4, 5],
            animIdleFrame: 0,
            currentAnimFrameValue: 0,
            currentAnimSequenceIndex: 0,
            animationTick: 0,
            animationSpeed: 5 + Math.floor(Math.random() * 3),
            isMoving: false,
            currentAnimationType: 'idle',
            spriteShouldBeFlipped: false
        };
        aiOpponents.push(newAI);
    }
    // MODIFIED: Now load spritesheets for AIs after they are created
    loadAISpriteSheets();
}

// ADDED: Function to load spritesheets for all AIs
function loadAISpriteSheets() {
    let spritesToLoad = aiOpponents.length;
    if (spritesToLoad === 0) {
        // Optional: callback or flag setting if needed when all AI sprites are done or if no AIs
        return;
    }

    aiOpponents.forEach(ai => {
        // Check if this spritesheet is already loaded or being loaded
        if (loadedSpriteSheets[ai.spriteName]) {
            if (loadedSpriteSheets[ai.spriteName] instanceof Image && loadedSpriteSheets[ai.spriteName].complete) {
                // Already loaded and complete
                ai.spriteSheet = loadedSpriteSheets[ai.spriteName];
                ai.currentAnimFrameValue = ai.animIdleFrame;
                spritesToLoad--;
                if (spritesToLoad === 0) {
                    // All AI sprites are now assigned (either new or from cache)
                    // console.log("All AI sprites assigned.");
                }
            } else if (loadedSpriteSheets[ai.spriteName] instanceof Image) {
                // Image exists but might not be loaded yet (e.g. another AI is already loading it)
                // Rely on its onload to set for all AIs wanting this sheet
                // For simplicity, we'll let the original loader handle it.
                // This can be improved by queuing AIs waiting for the same sheet.
                // For now, if it's loading, this AI will get it once pandaSpriteSheet.onload logic is adapted.
                // OR, more robustly, check periodically or use a promise.
                // Let's assume for now that if it exists, it will eventually load.
                // A quick check:
                 if (loadedSpriteSheets[ai.spriteName].src === ai.spriteSheetPath && loadedSpriteSheets[ai.spriteName].complete) {
                     ai.spriteSheet = loadedSpriteSheets[ai.spriteName];
                     ai.currentAnimFrameValue = ai.animIdleFrame;
                     spritesToLoad--;
                 } else {
                    // It's loading, wait for its onload. The global init's onload should handle this.
                    // This path needs careful handling if multiple AIs request an uncached image simultaneously.
                    // The current pandaSpriteSheet.onload in init() handles all AIs, this needs generalization.
                    // For now, we'll create a new image object for each AI to ensure distinct loading,
                    // but ideally, we'd cache as intended by loadedSpriteSheets.
                    // Reverting to simpler: each AI loads its own for now, caching can be a refinement.

                    const aiSprite = new Image();
                    aiSprite.src = ai.spriteSheetPath;
                    aiSprite.onload = () => {
                        ai.spriteSheet = aiSprite;
                        ai.currentAnimFrameValue = ai.animIdleFrame;
                        loadedSpriteSheets[ai.spriteName] = aiSprite; // Cache it
                        spritesToLoad--;
                        // console.log(`AI ${ai.id} sprite ${ai.spriteName} loaded.`);
                        if (spritesToLoad === 0) {
                            // console.log("All AI sprites dynamically loaded.");
                        }
                    };
                    aiSprite.onerror = () => {
                        console.error(`Failed to load sprite: ${ai.spriteSheetPath} for AI ${ai.id}`);
                        spritesToLoad--;
                        if (spritesToLoad === 0) {
                            // console.log("Finished attempting to load all AI sprites.");
                        }
                    };
                 }

            }
        } else {
            // Not loaded and not even an Image object yet, so load it
            const aiSprite = new Image();
            loadedSpriteSheets[ai.spriteName] = aiSprite; // Store the Image object itself to indicate it's loading
            aiSprite.src = ai.spriteSheetPath;

            aiSprite.onload = () => {
                ai.spriteSheet = aiSprite; // Assign to the current AI
                ai.currentAnimFrameValue = ai.animIdleFrame;
                // console.log(`AI ${ai.id} sprite ${ai.spriteName} loaded and assigned.`);
                
                // Now, assign this loaded sheet to any other AIs that were waiting for the SAME spriteName
                aiOpponents.forEach(otherAI => {
                    if (otherAI.spriteName === ai.spriteName && !otherAI.spriteSheet) {
                        otherAI.spriteSheet = aiSprite;
                        otherAI.currentAnimFrameValue = otherAI.animIdleFrame;
                        // console.log(`Assigned loaded sprite ${ai.spriteName} to waiting AI ${otherAI.id}`);
                    }
                });

                spritesToLoad--;
                if (spritesToLoad === 0) {
                    // console.log("All unique AI sprites dynamically loaded and assigned.");
                }
            };
            aiSprite.onerror = () => {
                console.error(`Failed to load sprite: ${ai.spriteSheetPath} for AI ${ai.id}`);
                // Mark as failed or remove from loadedSpriteSheets to allow retry? For now, just log.
                delete loadedSpriteSheets[ai.spriteName]; 
                spritesToLoad--;
                if (spritesToLoad === 0) {
                    // console.log("Finished attempting to load all AI sprites (with errors).");
                }
            };
        }
    });
}

function isPointInRect(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.width &&
           point.y >= rect.y && point.y <= rect.y + rect.height;
}

function resolveCharacterBump(char1, char2) {
    if (char1.finished || char2.finished) { 
        // Finished characters do not bump or get bumped to allow smooth exit
        return; 
    }

    const dx = char2.x - char1.x;
    const dy = char2.y - char1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (char1.size / 2) + (char2.size / 2);

    if (distance < minDistance && distance > 0) { // distance > 0 to avoid division by zero if perfectly overlapped
        const overlap = minDistance - distance;
        const pushX = (dx / distance) * overlap;
        const pushY = (dy / distance) * overlap;

        char1.x -= pushX / 2;
        char1.y -= pushY / 2;
        char2.x += pushX / 2;
        char2.y += pushY / 2;

        // After bump, check and resolve wall collisions for both characters
        resolveWallCollisionForCharacter(char1);
        resolveWallCollisionForCharacter(char2);

        // Ensure characters stay within game boundaries (final check after all pushes)
        char1.x = Math.max(char1.size / 2, Math.min(char1.x, gameWidth - char1.size / 2));
        char1.y = Math.max(char1.size / 2, Math.min(char1.y, gameHeight - char1.size / 2));
        char2.x = Math.max(char2.size / 2, Math.min(char2.x, gameWidth - char2.size / 2));
        char2.y = Math.max(char2.size / 2, Math.min(char2.y, gameHeight - char2.size / 2));
        
        if (char1.stuckDirection !== 0) {
           // char1.stuckDirection = 0; 
        }
        if (char2.stuckDirection !== 0) {
           // char2.stuckDirection = 0;
        }
    }
}

function resolveWallCollisionForCharacter(character) {
    const charRect = {
        x: character.x - character.size / 2,
        y: character.y - character.size / 2,
        width: character.size,
        height: character.size
    };

    for (const wall of walls) {
        if (isRectCollision(charRect, wall)) {
            // Calculate overlap on X and Y axes
            let overlapX = 0;
            let overlapY = 0;

            // Distance between centers
            const charCenterX = charRect.x + charRect.width / 2;
            const charCenterY = charRect.y + charRect.height / 2;
            const wallCenterX = wall.x + wall.width / 2;
            const wallCenterY = wall.y + wall.height / 2;

            // Calculate penetration depth
            const diffX = charCenterX - wallCenterX;
            const minXDist = charRect.width / 2 + wall.width / 2;
            overlapX = minXDist - Math.abs(diffX);

            const diffY = charCenterY - wallCenterY;
            const minYDist = charRect.height / 2 + wall.height / 2;
            overlapY = minYDist - Math.abs(diffY);
            
            if (overlapX > 0 && overlapY > 0) { // Ensure there is an actual overlap
                 // Collision, push out by the smallest overlap amount
                if (overlapX < overlapY) {
                    if (diffX > 0) { // Character is to the right of wall center
                        character.x += overlapX;
                    } else { // Character is to the left of wall center
                        character.x -= overlapX;
                    }
                } else {
                    if (diffY > 0) { // Character is below wall center
                        character.y += overlapY;
                    } else { // Character is above wall center
                        character.y -= overlapY;
                    }
                }
                // Update charRect for subsequent wall checks in this loop, though one push per wall per frame is often enough
                charRect.x = character.x - character.size / 2;
                charRect.y = character.y - character.size / 2;
            }
        }
    }
}

// Initialization
function init() {
    resizeCanvas(); // Initial resize
    initAI(); // Initialize AI opponents (this will now also trigger their sprite loading)
    raceStartTime = performance.now();
    gameState = 'PLAYING'; // Start the game in playing state

    // Load panda spritesheet FOR THE PLAYER
    pandaSpriteSheet.src = 'spritesheets/panda.png';
    pandaSpriteSheet.onload = () => {
        player.spriteSheet = pandaSpriteSheet;
        pandaSpriteSheetLoaded = true; // This global flag might still be useful for player or generic checks
        player.currentAnimFrameValue = player.animIdleFrame;
        // console.log('Panda spritesheet loaded and assigned to player.');

        // REMOVED AI assignment from here, it's handled by loadAISpriteSheets and their individual onload.
        // aiOpponents.forEach(ai => {
        // if (!ai.spriteSheet) { // AIs now load their own, panda is just one option
        // ai.spriteSheet = pandaSpriteSheet;
        // ai.currentAnimFrameValue = ai.animIdleFrame;
        // }
        // });

        // Initialize off-screen canvas for tinting now that sprite dimensions are known
        // This should ideally wait until at least one sprite (player or AI) is loaded
        // to get dimensions if they can vary. For now, assuming all sprites are 256x256.
        if (!offScreenCanvas && player.spriteSheet && player.spriteWidth > 0 && player.spriteHeight > 0) {
            offScreenCanvas = document.createElement('canvas');
            offScreenCanvas.width = player.spriteWidth;  // e.g., 256
            offScreenCanvas.height = player.spriteHeight; // e.g., 256
            offCtx = offScreenCanvas.getContext('2d');
            // console.log(`Off-screen canvas for tinting initialized to ${offScreenCanvas.width}x${offScreenCanvas.height} based on player sprite.`);
        } else if (offScreenCanvas) {
            // console.log('Off-screen canvas already initialized.');
        } else {
            // console.error('Failed to initialize off-screen canvas: player sprite dimensions not available or sprite not loaded.');
        }
    };
    pandaSpriteSheet.onerror = () => {
        console.error('Failed to load panda spritesheet for player.');
        pandaSpriteSheetLoaded = false; // Ensure this is false if player's main sprite fails
    };

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('mouseout', onPointerUp); // If mouse leaves canvas

    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    canvas.addEventListener('touchmove', onPointerMove, { passive: false });
    canvas.addEventListener('touchend', onPointerUp, { passive: false });
    canvas.addEventListener('touchcancel', onPointerUp, { passive: false });
    
    // Start game loop
    gameLoop();
}

// Start the game
init(); 