class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreDisplay = document.getElementById('score-display');
        
        // Set canvas size
        this.canvas.width = 400;
        this.canvas.height = 600;
        
        // Load background image
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'road.png';
        this.backgroundY = 0;
        this.backgroundSpeed = -2; // Negative speed for upward scroll
        
        // Game state
        this.score = 0;
        this.gameOver = false;
        this.victory = false;
        this.gameOverTime = 0;
        this.victoryStartTime = 0;
        this.obstacles = [];
        this.spawnInterval = 1200; // Faster initial spawn interval
        this.lastSpawnTime = 0;
        this.minSpawnInterval = 300; // Faster minimum spawn interval
        
        // Player properties
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            width: 30,
            height: 30,
            isJumping: false,
            jumpDuration: 500,
            jumpStartTime: 0,
            initialY: this.canvas.height / 2,
            isPlayer: true,
            isDead: false,
            obstaclesAvoided: 0
        };

        // Create NPCs
        this.npcs = [
            this.createNPC(this.canvas.width * 0.2), // 20% from left
            this.createNPC(this.canvas.width * 0.4), // 40% from left
            this.createNPC(this.canvas.width * 0.6), // 60% from left
            this.createNPC(this.canvas.width * 0.8)  // 80% from left
        ];
        
        // Bind event listeners
        this.bindEvents();
        
        // Start game loop
        this.lastTime = 0;
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    createNPC(x) {
        // Give each NPC a unique "personality" with different jumping parameters
        return {
            x: x,
            y: this.canvas.height / 2,
            width: 30,
            height: 30,
            isJumping: false,
            jumpDuration: 500,
            jumpStartTime: 0,
            initialY: this.canvas.height / 2,
            isPlayer: false,
            isDead: false,
            // More varied reaction distances for each NPC
            minReactionDistance: 80 + Math.random() * 120, // Range: 80-200
            maxReactionDistance: 200 + Math.random() * 150, // Range: 200-350
            successRate: 0.85 + Math.random() * 0.14, // Range: 85-99%
            lastJumpTime: 0,
            jumpCooldown: 10 + Math.random() * 90, // Range: 10-100ms
            // Personality traits
            riskTaker: Math.random(), // 0-1: affects when they choose to jump
            jumpEarly: Math.random() < 0.5, // Some NPCs prefer to jump early, others late
            panicThreshold: 150 + Math.random() * 100, // When they start to panic
            decisionStyle: Math.floor(Math.random() * 3), // 0: cautious, 1: normal, 2: aggressive
            waitForOthers: Math.random() < 0.3, // 30% chance to wait for others
            independentThinking: Math.random() * 0.5 // 0-0.5: how much they ignore others
        };
    }
    
    bindEvents() {
        // Handle both mouse click and touch
        this.canvas.addEventListener('click', () => this.jump());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jump();
        });
        
        // Handle spacebar
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            }
        });
    }
    
    jump() {
        if (this.gameOver) {
            // Only allow restart after 2 seconds
            if (performance.now() - this.gameOverTime >= 2000) {
                this.restart();
            }
            return;
        }
        
        if (!this.player.isJumping) {
            this.player.isJumping = true;
            this.player.jumpStartTime = performance.now();
        }
    }
    
    spawnObstacle() {
        const height = 15; // Fixed height for obstacles
        const speed = 3 + (this.score / 20); // Base speed increases with score
        
        // Create a single full-width obstacle
        this.obstacles.push({
            x: 0,
            y: this.canvas.height,
            width: this.canvas.width,
            height: height,
            speed: speed
        });
    }
    
    updateCharacter(character, currentTime) {
        if (character.isDead) return;

        if (character.isJumping) {
            const jumpElapsed = currentTime - character.jumpStartTime;
            if (jumpElapsed >= character.jumpDuration) {
                character.isJumping = false;
            }
        }

        // For NPCs, check if they need to jump
        if (!character.isPlayer && !character.isJumping) {
            // Don't try to jump again too quickly
            if (currentTime - character.lastJumpTime < character.jumpCooldown) {
                return;
            }

            // Find all approaching obstacles
            const approachingObstacles = this.obstacles.filter(obs => {
                const distanceToObstacle = obs.y - character.y;
                return obs.y > character.y && 
                       distanceToObstacle <= character.maxReactionDistance;
            });
            
            if (approachingObstacles.length === 0) return;
            
            // Sort obstacles by distance
            approachingObstacles.sort((a, b) => (a.y - character.y) - (b.y - character.y));
            const nearestObstacle = approachingObstacles[0];
            const distanceToObstacle = nearestObstacle.y - character.y;
            
            // Count how many other NPCs are jumping
            const jumpingNPCs = this.npcs.filter(npc => 
                npc !== character && !npc.isDead && npc.isJumping
            ).length;
            
            // Base decision making on personality
            let shouldConsiderJump = false;
            let jumpThreshold = character.successRate;
            
            // Adjust based on decision style
            switch(character.decisionStyle) {
                case 0: // Cautious
                    shouldConsiderJump = distanceToObstacle <= character.maxReactionDistance * 0.7;
                    jumpThreshold *= 1.1;
                    break;
                case 1: // Normal
                    shouldConsiderJump = distanceToObstacle <= character.maxReactionDistance * 0.85;
                    break;
                case 2: // Aggressive
                    shouldConsiderJump = distanceToObstacle <= character.maxReactionDistance;
                    jumpThreshold *= 0.9;
                    break;
            }
            
            // Adjust for waiting behavior
            if (character.waitForOthers && jumpingNPCs > 0) {
                // If they wait for others, they're more likely to jump when others are jumping
                jumpThreshold *= 0.8;
            } else if (character.independentThinking > 0.25 && jumpingNPCs > 1) {
                // Independent thinkers are less likely to jump when everyone else is
                jumpThreshold *= 1.2;
            }
            
            // Panic mode overrides normal decision making
            if (distanceToObstacle < character.panicThreshold) {
                shouldConsiderJump = true;
                jumpThreshold *= 0.7; // More likely to jump in panic
            }
            
            // Add some randomness to the decision
            const randomFactor = 0.8 + Math.random() * 0.4; // ±20% random variation
            jumpThreshold *= randomFactor;
            
            if (shouldConsiderJump && Math.random() < jumpThreshold) {
                character.isJumping = true;
                character.jumpStartTime = currentTime;
                character.lastJumpTime = currentTime;
            } else if (shouldConsiderJump) {
                // If decided not to jump, add a random delay before next consideration
                character.lastJumpTime = currentTime + (Math.random() * 150);
            }
        }
    }
    
    update(deltaTime) {
        if (this.gameOver) return;
        
        const currentTime = performance.now();

        // Update all characters
        this.updateCharacter(this.player, currentTime);
        this.npcs.forEach(npc => this.updateCharacter(npc, currentTime));
        
        // Check if all NPCs are dead and player is alive (victory condition)
        if (!this.player.isDead && this.npcs.every(npc => npc.isDead)) {
            if (this.victoryStartTime === 0) {
                this.victoryStartTime = currentTime;
            } else if (currentTime - this.victoryStartTime >= 1000) {
                this.gameOver = true;
                this.victory = true;
                this.gameOverTime = currentTime;
                return;
            }
        }
        
        // Spawn obstacles with random timing
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnObstacle();
            this.lastSpawnTime = currentTime;
            
            // Calculate next spawn interval with randomness
            const baseInterval = Math.max(
                this.minSpawnInterval,
                1200 - (this.score * 15)
            );
            // Add random variation of ±30% to the base interval
            this.spawnInterval = baseInterval + (Math.random() * baseInterval * 0.6 - baseInterval * 0.3);
        }
        
        // Update obstacles and check collisions
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.y -= obstacle.speed;
            
            // Check collisions for all characters
            [this.player, ...this.npcs].forEach(character => {
                if (!character.isDead && !character.isJumping) {
                    if (this.checkCollision(character, obstacle)) {
                        character.isDead = true;
                        if (character.isPlayer) {
                            this.gameOver = true;
                            this.victory = false;
                            this.gameOverTime = performance.now();
                        }
                    }
                }
            });
            
            // Remove obstacles that are off screen and update score
            if (obstacle.y + obstacle.height < 0) {
                if (!this.player.isDead) {
                    this.score = ++this.player.obstaclesAvoided;
                    this.scoreDisplay.textContent = `Score: ${this.score}`;
                }
                return false;
            }
            
            return true;
        });
    }
    
    checkCollision(player, obstacle) {
        return player.x < obstacle.x + obstacle.width &&
               player.x + player.width > obstacle.x &&
               player.y < obstacle.y + obstacle.height &&
               player.y + player.height > obstacle.y;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw scrolling background
        if (this.backgroundImage.complete) {
            // Draw two copies of the background for seamless scrolling
            // Draw first copy
            this.ctx.drawImage(
                this.backgroundImage,
                0,
                Math.floor(this.backgroundY), // Floor to prevent subpixel rendering
                this.canvas.width,
                this.canvas.height
            );
            // Draw second copy
            this.ctx.drawImage(
                this.backgroundImage,
                0,
                Math.floor(this.backgroundY) + this.canvas.height,
                this.canvas.width,
                this.canvas.height
            );
            
            // Update background position
            this.backgroundY += this.backgroundSpeed;
            // Reset position before it gets too far, preventing any possible gaps
            if (this.backgroundY <= -this.canvas.height + this.backgroundSpeed) {
                this.backgroundY = 0;
            }
        }
        
        // Draw all characters (player and NPCs)
        const drawCharacter = (character) => {
            if (character.isDead) return;

            // Set color based on type and state
            if (character.isPlayer) {
                this.ctx.fillStyle = character.isJumping ? '#00ffff' : '#00ff00';
            } else {
                this.ctx.fillStyle = character.isJumping ? '#ff00ff' : '#ff9900';
            }

            // Add glow effect when jumping
            if (character.isJumping) {
                this.ctx.shadowColor = character.isPlayer ? '#00ffff' : '#ff00ff';
                this.ctx.shadowBlur = 15;
            } else {
                this.ctx.shadowColor = 'transparent';
                this.ctx.shadowBlur = 0;
            }

            this.ctx.fillRect(
                character.x - character.width/2,
                character.y - character.height/2,
                character.width,
                character.height
            );
        };

        // Draw player and NPCs
        drawCharacter(this.player);
        this.npcs.forEach(npc => drawCharacter(npc));
        
        // Draw obstacles with gradient
        this.obstacles.forEach(obstacle => {
            const gradient = this.ctx.createLinearGradient(0, obstacle.y, 0, obstacle.y + obstacle.height);
            gradient.addColorStop(0, '#ff3333');
            gradient.addColorStop(1, '#ff0000');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
            );
            
            // Add spikes effect only if the segment is wide enough
            if (obstacle.width >= 20) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = '#ff6666';
                this.ctx.lineWidth = 2;
                
                for (let x = obstacle.x; x < obstacle.x + obstacle.width; x += 20) {
                    this.ctx.moveTo(x, obstacle.y);
                    this.ctx.lineTo(x + 10, obstacle.y - 5);
                    this.ctx.lineTo(Math.min(x + 20, obstacle.x + obstacle.width), obstacle.y);
                }
                
                this.ctx.stroke();
            }
        });
        
        // Draw game over screen
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            
            if (this.victory) {
                this.ctx.fillText('Victory!', this.canvas.width/2, this.canvas.height/2 - 20);
                this.ctx.font = '20px Arial';
                this.ctx.fillText(
                    'You outlasted all competitors!',
                    this.canvas.width/2,
                    this.canvas.height/2 + 20
                );
            } else {
                this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2 - 20);
            }
            
            this.ctx.font = '20px Arial';
            this.ctx.fillText(
                'Click to restart',
                this.canvas.width/2,
                this.canvas.height/2 + 60
            );
        }
    }
    
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    restart() {
        this.score = 0;
        this.scoreDisplay.textContent = 'Score: 0';
        this.gameOver = false;
        this.victory = false;
        this.gameOverTime = 0;
        this.victoryStartTime = 0;
        this.obstacles = [];
        this.spawnInterval = 1200;
        this.lastSpawnTime = 0;
        
        // Reset player
        this.player.isJumping = false;
        this.player.isDead = false;
        this.player.obstaclesAvoided = 0;
        
        // Reset NPCs with new positions
        this.npcs = [
            this.createNPC(this.canvas.width * 0.2),
            this.createNPC(this.canvas.width * 0.4),
            this.createNPC(this.canvas.width * 0.6),
            this.createNPC(this.canvas.width * 0.8)
        ];
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
}); 