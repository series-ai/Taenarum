const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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
    size: 20,
    color: 'blue',
    speed: 2,
    finished: false,
    finishTime: 0,
    isPlayer: true // To distinguish player from AI
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
const NUM_AI_OPPONENTS = 10;
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
    // Draw player even if finished, as they might be moving off screen
    if (player.y + player.size / 2 > -20) { // Draw if still somewhat visible from top
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);
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
    aiOpponents.forEach(ai => {
        if (ai.y + ai.size / 2 > -20) { // Draw if still somewhat visible from top
            ctx.fillStyle = ai.color;
            ctx.fillRect(ai.x - ai.size / 2, ai.y - ai.size / 2, ai.size, ai.size);
        }
    });
}

// Update functions
function updatePlayerMovement() {
    if (player.finished) {
        player.y -= FINISHED_CHARACTER_SPEED; // Move finished player off-screen
        return;
    }
    if (gameState !== 'PLAYING') return;

    if (joystick.active) {
        const angle = Math.atan2(joystick.inputY, joystick.inputX);
        const magnitude = Math.sqrt(joystick.inputX * joystick.inputX + joystick.inputY * joystick.inputY);
        const normalizedMagnitude = Math.min(1, magnitude);

        let nextX = player.x + Math.cos(angle) * player.speed * normalizedMagnitude;
        let nextY = player.y + Math.sin(angle) * player.speed * normalizedMagnitude;

        const prevX = player.x;
        const prevY = player.y;

        player.x = nextX;
        player.y = nextY;

        checkCollisions(player, prevX, prevY);
        if (player.finished) return; // If collision resulted in finishing (e.g. pit), stop here

        for (const ai of aiOpponents) {
            if (!ai.finished) {
                resolveCharacterBump(player, ai);
            }
        }
        if (player.finished) return; // If bump somehow results in finishing (unlikely, but safe check)

        if (!player.finished && player.y - player.size / 2 <= finishLine.y + finishLine.height) {
            player.finished = true;
            player.finishTime = performance.now() - raceStartTime;
            if (!finishers.find(f => f.isPlayer)) {
                finishers.push({ id: 'player', time: player.finishTime, isPlayer: true });
            }
            checkAllFinished();
            // After finishing, player will now be handled by the block at the start of this function to move off screen.
        }
    }
}

function updateAIMovement() {
    const SIDE_STEP_SPEED_FACTOR = 0.6;

    aiOpponents.forEach((ai, index) => {
        if (ai.finished) {
            ai.y -= FINISHED_CHARACTER_SPEED; // Move finished AI off-screen
            return;
        }

        if (gameState !== 'PLAYING') {
            ai.stuckDirection = 0;
            return;
        }
        
        // If execution reaches here, AI is not finished and game is PLAYING.
        const prevX = ai.x;
        const prevY = ai.y;
        let intendedNextY = ai.y - ai.speed;
        let intendedNextX = ai.x; // Default to current X

        // --- Check Upward Movement --- 
        let lookAheadRectY = { x: ai.x - ai.size / 2, y: intendedNextY - ai.size / 2, width: ai.size, height: ai.size };
        let hitWallMovingUp = false;
        for (const wall of walls) {
            if (isRectCollision(lookAheadRectY, wall)) { hitWallMovingUp = true; break; }
        }
        let hitPitMovingUp = false;
        if (!hitWallMovingUp) { // Only check pits if not already hitting a wall upwards
            for (const pit of pits) {
                if (isRectCollision(lookAheadRectY, pit)) { hitPitMovingUp = true; break; }
            }
        }

        if (!hitWallMovingUp && !hitPitMovingUp) {
            // Can move UPWARDS successfully
            ai.y = intendedNextY;
            ai.stuckDirection = 0;
        } else {
            // CANNOT move UPWARDS, engage or continue stuck logic
            ai.y = prevY; // Stay at current Y, upward movement blocked

            if (ai.stuckDirection === 0) { // If not already trying a direction, pick one
                ai.stuckDirection = (Math.random() < 0.5) ? -1 : 1;
            }

            // Attempt to move sideways in the current ai.stuckDirection
            intendedNextX = ai.x + (ai.speed * SIDE_STEP_SPEED_FACTOR * ai.stuckDirection);
            let lookAheadRectX = { x: intendedNextX - ai.size / 2, y: ai.y - ai.size / 2, width: ai.size, height: ai.size };
            
            let canMoveSidewaysThisStep = true;
            for (const wall of walls) {
                if (isRectCollision(lookAheadRectX, wall)) { canMoveSidewaysThisStep = false; break; }
            }
            if (canMoveSidewaysThisStep) { // Check pits only if walls are clear for sideways move
                for (const pit of pits) {
                    if (isRectCollision(lookAheadRectX, pit)) { canMoveSidewaysThisStep = false; break; }
                }
            }

            if (canMoveSidewaysThisStep) {
                ai.x = intendedNextX;
            } else {
                // CANNOT move sideways in the current stuckDirection.
                ai.x = prevX; // Stay put horizontally.
                // Force a flip in direction immediately, as this path is blocked.
                ai.stuckDirection *= -1;
            }
        }

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
    const totalRacers = 1 + NUM_AI_OPPONENTS;
    const requiredToTriggerRaceEnd = Math.ceil(totalRacers * QUALIFICATION_PERCENTAGE);

    if (gameState === 'PLAYING') { // Only proceed if the game is currently active
        if (finishers.length >= requiredToTriggerRaceEnd) {
            // Enough racers have finished according to qualification percentage
            gameState = 'RACE_OVER';
            determineRaceOutcome();
        } else if (finishers.length === totalRacers) {
            // All racers have finished (covers cases where QUALIFICATION_PERCENTAGE = 1.0)
            gameState = 'RACE_OVER';
            determineRaceOutcome();
        }
    }
    // If player falls into a pit, checkCollisions sets player.finished = true, player.finishTime = Infinity,
    // adds player to finishers, and then calls this. This function will then trigger RACE_OVER.
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
    if (character.finished) return; // Finished characters don't collide with walls/pits

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
        const playerCenterX = character.x;
        const playerCenterY = character.y;
        if (playerCenterX > pit.x && playerCenterX < pit.x + pit.width &&
            playerCenterY > pit.y && playerCenterY < pit.y + pit.height) {
            if (character.isPlayer) { // Pitfall logic primarily for player as per spec
                console.log("Player fell into a pit!");
                character.finished = true; 
                character.finishTime = Infinity; 
                if (!finishers.find(f => f.isPlayer)) { 
                     finishers.push({ id: 'player', time: Infinity, isPlayer: true });
                }
                // checkAllFinished will be called from updatePlayerMovement after this function returns
                // and will then trigger RACE_OVER and determineRaceOutcome.
            } else {
                // AI hitting a pit - for simplicity, make them stop and effectively DNF if they hit one
                // This isn't per spec (AI should avoid) but is a fallback if avoidance fails
                character.finished = true;
                character.finishTime = Infinity;
                if (!finishers.find(f => f.id === character.id)) {
                    finishers.push({ id: character.id, time: Infinity, isPlayer: false });
                }
            }
            checkAllFinished(); // Update race status immediately if anyone falls into a pit
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
        console.log("Game Over - You Lose (pit)");
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

    finishers.length = 0; // Clear finishers array
    initAI(); // This will now correctly clear and re-populate AIs.

    raceStartTime = performance.now();
    gameState = 'PLAYING';
    resetJoystick(); // Also reset joystick state
}

function initAI() {
    aiOpponents.length = 0; // Clear previous AI if any (for restarts)
    for (let i = 0; i < NUM_AI_OPPONENTS; i++) {
        // Stagger starting positions slightly and assign varied speeds
        const startX = (gameWidth / (NUM_AI_OPPONENTS + 1)) * (i + 1) + (Math.random() * 20 - 10);
        aiOpponents.push({
            x: Math.max(10, Math.min(gameWidth - 10, startX)), // Keep within bounds
            y: gameHeight - 30 - (Math.random() * 20), // Slightly staggered y start near player
            size: 20,
            color: aiColors[i % aiColors.length],
            speed: 1 + Math.random() * 0.8, // Speed between 1.0 and 1.8
            finished: false,
            finishTime: 0,
            isPlayer: false,
            id: 'ai' + i,
            stuckDirection: 0 // 0: not stuck, -1: trying left, 1: trying right
        });
    }
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
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial sizing

    // Pointer events for cross-device compatibility
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('mouseout', onPointerUp); // If mouse leaves canvas

    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    canvas.addEventListener('touchmove', onPointerMove, { passive: false });
    canvas.addEventListener('touchend', onPointerUp, { passive: false });
    canvas.addEventListener('touchcancel', onPointerUp, { passive: false });
    
    initAI(); // Initialize AI characters
    raceStartTime = performance.now(); // Initialize race start time

    // Start game loop
    gameLoop();
}

init(); 