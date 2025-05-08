const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const endScreen = document.getElementById('endScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const TARGET_FPS = 30;
const MS_PER_FRAME = 1000 / TARGET_FPS;

// Game state variables (will be expanded)
let score = 0;
let timeLeft = 30; // seconds, from spec
let gameIsOver = false;

// Player state
const player = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 100, // Positioned towards the bottom
    width: 50, // As per spec example
    height: 100, // As per spec example
    bucketWidth: 120, // 30% of screen width
    bucketHeight: 30, // Arbitrary, can adjust
    color: 'blue',
    leanSpeed: 200, // pixels per second, adjust for smooth animation
    isLeaningLeft: false,
    isLeaningRight: false,
    returnToCenterSmoothTime: 0.5, // seconds, from spec
    timeToReturnToCenter: 0, // current countdown for returning
    lastTapTime: 0,
    tapCooldown: 200, // 0.2 seconds in milliseconds
    targetX: GAME_WIDTH / 2, // For smooth return
    isStunned: false,
    stunDuration: 1000, // 1 second in milliseconds
    stunTimer: 0
};

// Falling Objects
const objectTypes = {
    APPLE: 'apple',
    BOMB: 'bomb'
};
const fallingObjects = [];
const objectSize = 20; // 20x20 pixels
const objectFallSpeed = 300; // pixels per second
let spawnInterval = 2000; // milliseconds (2 seconds)
let timeToNextSpawn = spawnInterval;
const spawnRateIncreaseInterval = 10000; // 10 seconds
const spawnRateDecrease = 100; // 0.1 seconds in milliseconds
let timeToNextSpawnRateIncrease = spawnRateIncreaseInterval;
const maxObjectsOnScreen = 5;

// Lanes for spawning
const laneWidth = GAME_WIDTH / 3;
const lanes = [
    laneWidth / 2,             // Left lane center
    GAME_WIDTH / 2,            // Middle lane center
    GAME_WIDTH - laneWidth / 2 // Right lane center
];

function spawnObject() {
    if (fallingObjects.length >= maxObjectsOnScreen || gameIsOver) {
        return;
    }

    const x = lanes[Math.floor(Math.random() * lanes.length)];
    const type = Math.random() < 0.7 ? objectTypes.APPLE : objectTypes.BOMB; // 70% apples, 30% bombs

    fallingObjects.push({
        x: x,
        y: -objectSize, // Start just above the screen
        type: type,
        width: objectSize,
        height: objectSize,
        color: type === objectTypes.APPLE ? 'green' : 'red'
    });
}

function update(deltaTime) {
    if (gameIsOver) {
        return; // Don't update game logic if game is over
    }
    const now = Date.now();

    // Player stun logic
    if (player.isStunned) {
        player.stunTimer -= deltaTime * 1000;
        if (player.stunTimer <= 0) {
            player.isStunned = false;
        }
    }

    // Player movement logic (only if not stunned)
    if (!player.isStunned) {
        if (player.isLeaningLeft) {
            player.x -= player.leanSpeed * deltaTime;
            player.targetX = player.x; // Update target while actively leaning
            player.timeToReturnToCenter = 0; // Reset return timer
        } else if (player.isLeaningRight) {
            player.x += player.leanSpeed * deltaTime;
            player.targetX = player.x; // Update target while actively leaning
            player.timeToReturnToCenter = 0; // Reset return timer
        } else {
            // Not actively leaning, check if we need to return to center
            if (player.x !== GAME_WIDTH / 2) {
                if (player.timeToReturnToCenter <= 0) {
                    // This is the first frame after releasing, set target and start timer
                    player.targetX = GAME_WIDTH / 2;
                    player.timeToReturnToCenter = player.returnToCenterSmoothTime;
                }

                if (player.timeToReturnToCenter > 0) {
                    const distanceToCenter = player.targetX - player.x;
                    const moveAmount = (distanceToCenter / player.timeToReturnToCenter) * deltaTime;
                    player.x += moveAmount;
                    player.timeToReturnToCenter -= deltaTime;

                    if (player.timeToReturnToCenter <= 0 || Math.abs(player.x - player.targetX) < 1) {
                        player.x = player.targetX; // Snap to target
                        player.timeToReturnToCenter = 0;
                    }
                }
            }
        }

        // Keep player within screen bounds (bucket edges)
        const minX = player.bucketWidth / 2;
        const maxX = GAME_WIDTH - player.bucketWidth / 2;
        if (player.x < minX) {
            player.x = minX;
        }
        if (player.x > maxX) {
            player.x = maxX;
        }
    }

    // Game timer update
    if (timeLeft > 0) {
        timeLeft -= deltaTime;
        if (timeLeft < 0) {
            timeLeft = 0;
            gameIsOver = true; // Set game over flag
            showEndScreen(); // Call showEndScreen
            // console.log("Game Over! Score:", score); // Original log
        }
    }

    // Falling objects update
    if (timeLeft > 0) { // Only update and spawn if game is running
        // Spawning logic
        timeToNextSpawn -= deltaTime * 1000;
        if (timeToNextSpawn <= 0) {
            spawnObject();
            timeToNextSpawn = spawnInterval;
        }

        // Spawn rate increase logic
        timeToNextSpawnRateIncrease -= deltaTime * 1000;
        if (timeToNextSpawnRateIncrease <= 0) {
            spawnInterval = Math.max(500, spawnInterval - spawnRateDecrease); // Ensure spawn interval doesn't get too low
            timeToNextSpawnRateIncrease = spawnRateIncreaseInterval;
            console.log("New spawn interval:", spawnInterval);
        }
    }

    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        const obj = fallingObjects[i];
        obj.y += objectFallSpeed * deltaTime;

        // Remove objects that fall off screen
        if (obj.y > GAME_HEIGHT + obj.height) {
            fallingObjects.splice(i, 1);
            continue; // Object is off-screen, no need to check collision
        }

        // Collision detection
        // Player bucket hitbox (top part of the player)
        const bucketTop = player.y - player.height - player.bucketHeight;
        const bucketBottom = player.y - player.height;
        const bucketLeft = player.x - player.bucketWidth / 2;
        const bucketRight = player.x + player.bucketWidth / 2;

        // Object collision bounds (approximating circle with a square for simplicity here)
        const objTop = obj.y - obj.height / 2;
        const objBottom = obj.y + obj.height / 2;
        const objLeft = obj.x - obj.width / 2;
        const objRight = obj.x + obj.width / 2;

        if (
            objRight > bucketLeft &&
            objLeft < bucketRight &&
            objBottom > bucketTop &&
            objTop < bucketBottom
        ) {
            // Collision detected!
            if (obj.type === objectTypes.APPLE) {
                score += 10;
                console.log("Caught Apple! Score:", score);
            } else if (obj.type === objectTypes.BOMB) {
                score -= 30;
                if (score < 0) score = 0; // Score shouldn't go below 0, though spec doesn't state
                player.isStunned = true;
                player.stunTimer = player.stunDuration;
                console.log("Caught Bomb! Score:", score, "Player stunned.");
            }
            fallingObjects.splice(i, 1); // Remove the object
        }
    }
}

function draw() {
    if (gameIsOver) {
        // Optionally, you could clear the canvas once or leave it as is
        // ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT); 
        // For now, let's just not draw game elements
        return;
    }
    // Clear canvas
    ctx.fillStyle = '#ADD8E6'; // Light blue background
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw player
    // Main body
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - player.width / 2, player.y - player.height, player.width, player.height);

    // Bucket (hitbox on top)
    // The bucket is centered on the player's x position
    const bucketX = player.x - player.bucketWidth / 2;
    const bucketY = player.y - player.height - player.bucketHeight; // Bucket is on top of the main body
    ctx.fillStyle = player.color; // Same color for now, can change
    ctx.fillRect(bucketX, bucketY, player.bucketWidth, player.bucketHeight);

    // Draw falling objects
    fallingObjects.forEach(obj => {
        ctx.fillStyle = obj.color;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw UI (Score and Timer)
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.textAlign = 'right';
    ctx.fillText(`Time: ${Math.ceil(timeLeft)}`, GAME_WIDTH - 10, 30);
}

let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000; // Delta time in seconds
    lastTime = timestamp;

    // Only call update and draw if the game is not over OR 
    // if it's the first frame of game over to draw the final state before end screen
    // This logic might need refinement depending on exact desired behavior for the last frame.
    // For simplicity now, update and draw are skipped if gameIsOver is true.
    // The showEndScreen function handles hiding the canvas.
    if (!gameIsOver) {
        update(deltaTime);
        draw();
    }

    requestAnimationFrame(gameLoop);
}

// Initialize event listeners for controls
canvas.addEventListener('pointerdown', handlePointerDown);
canvas.addEventListener('pointerup', handlePointerUp);
canvas.addEventListener('pointercancel', handlePointerUp); // Treat cancel like up

function handlePointerDown(event) {
    const now = Date.now();

    // Ignore input if player is stunned or game is over
    if (player.isStunned || timeLeft <= 0) {
        return;
    }

    if (now - player.lastTapTime < player.tapCooldown) {
        return; // Cooldown active
    }
    // Allow immediate lean if already returning to center
    // player.lastTapTime = now; // Apply cooldown only if not returning or already centered

    const rect = canvas.getBoundingClientRect();
    const touchX = event.clientX - rect.left;

    // Only update lastTapTime if a new lean action is initiated
    // and not just a tap while already leaning or returning.
    let isNewAction = false;

    if (touchX < GAME_WIDTH / 2) {
        if (!player.isLeaningLeft) { // New action if wasn't leaning left
            isNewAction = true;
        }
        player.isLeaningLeft = true;
        player.isLeaningRight = false;
        player.timeToReturnToCenter = 0; // Stop returning to center
    } else {
        if (!player.isLeaningRight) { // New action if wasn't leaning right
            isNewAction = true;
        }
        player.isLeaningRight = true;
        player.isLeaningLeft = false;
        player.timeToReturnToCenter = 0; // Stop returning to center
    }

    if(isNewAction || (player.x === GAME_WIDTH / 2 && player.timeToReturnToCenter <=0) ){
        // Apply cooldown if it's a genuinely new tap action or tapping from center
        // Or if cooldown period has passed anyway since last tap
         if (now - player.lastTapTime >= player.tapCooldown) {
            player.lastTapTime = now;
        } else if (player.isLeaningLeft || player.isLeaningRight) {
            // If trying to lean but in cooldown, do nothing if it's a new lean attempt.
            // If it's a continuation (e.g. holding finger), allow it (already handled by isLeaning flags)
            // This check is tricky with pointerdown being momentary.
            // The current cooldown logic already prevents re-triggering if too fast.
        }
    }
}

function handlePointerUp(event) {
    if (player.isLeaningLeft || player.isLeaningRight) {
        // Only start returning if player was actively leaning
        player.isLeaningLeft = false;
        player.isLeaningRight = false;
        // Set up return to center, if not already centered
        if (player.x !== GAME_WIDTH / 2) {
            player.targetX = GAME_WIDTH / 2;
            player.timeToReturnToCenter = player.returnToCenterSmoothTime;
        }
    }
}

// Add these new functions

function showEndScreen() {
    gameIsOver = true;
    finalScoreDisplay.textContent = score;
    canvas.style.display = 'none';
    endScreen.style.display = 'block';
}

function restartGame() {
    // Reset game state variables
    score = 0;
    timeLeft = 30; // Reset to initial time
    gameIsOver = false;
    player.x = GAME_WIDTH / 2;
    player.y = GAME_HEIGHT - 100;
    player.isLeaningLeft = false;
    player.isLeaningRight = false;
    player.targetX = GAME_WIDTH / 2;
    player.isStunned = false;
    player.stunTimer = 0;
    
    fallingObjects.length = 0; // Clear falling objects
    timeToNextSpawn = spawnInterval; // Reset spawn timer (initial spawnInterval might need to be reset if it changes dynamically beyond the current logic)
    // Reset spawn rate increase related timers/values if necessary
    // For now, spawnInterval is reset by timeToNextSpawnRateIncrease logic or remains as last decreased
    // If we want a fresh game, spawnInterval should be reset to its initial value
    // spawnInterval = 2000; // Reset to initial if needed
    // timeToNextSpawnRateIncrease = spawnRateIncreaseInterval;


    // Hide end screen, show canvas
    endScreen.style.display = 'none';
    canvas.style.display = 'block';

    // Reset lastTime for gameLoop to avoid a large deltaTime jump
    lastTime = performance.now(); 
    // The gameLoop is already running via requestAnimationFrame, 
    // it will pick up the reset state. No need to call it directly.
}

// Add event listener for the restart button
restartButton.addEventListener('click', restartGame);

// Start the game loop
lastTime = performance.now(); // Initialize lastTime before first call
requestAnimationFrame(gameLoop); 