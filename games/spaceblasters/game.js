class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Initialize stars
        this.stars = [];
        this.initStars();
        
        // Game state
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            velocity: { x: 0, y: 0 },
            rotation: 0,
            lasers: 0,
            hasShield: true,
            hasHeatSeeker: false,
            score: 0
        };
        
        this.enemies = [];
        this.powerups = [];
        this.lasers = [];
        this.gameOver = false;
        
        // Power-up spawn timing
        this.lastPowerupSpawn = 0;
        this.powerupSpawnInterval = 3; // 3 seconds
        
        // Survival time tracking
        this.lastSurvivalPoint = 0;
        this.survivalPointInterval = 2; // 2 seconds
        
        // Input state
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        // Bind event listeners
        this.bindEvents();
        
        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
        
        // Spawn initial enemies
        this.spawnEnemies(3);
    }
    
    resizeCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }
    
    bindEvents() {
        // Touch controls
        document.getElementById('up').addEventListener('touchstart', () => this.keys.up = true);
        document.getElementById('up').addEventListener('touchend', () => this.keys.up = false);
        document.getElementById('down').addEventListener('touchstart', () => this.keys.down = true);
        document.getElementById('down').addEventListener('touchend', () => this.keys.down = false);
        document.getElementById('left').addEventListener('touchstart', () => this.keys.left = true);
        document.getElementById('left').addEventListener('touchend', () => this.keys.left = false);
        document.getElementById('right').addEventListener('touchstart', () => this.keys.right = true);
        document.getElementById('right').addEventListener('touchend', () => this.keys.right = false);
        document.getElementById('fire').addEventListener('touchstart', () => this.fireLaser());
        
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    this.keys.up = true;
                    break;
                case 'ArrowDown':
                    this.keys.down = true;
                    break;
                case 'ArrowLeft':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                    this.keys.right = true;
                    break;
                case ' ': // Spacebar
                    this.fireLaser();
                    break;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    this.keys.up = false;
                    break;
                case 'ArrowDown':
                    this.keys.down = false;
                    break;
                case 'ArrowLeft':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                    this.keys.right = false;
                    break;
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    spawnEnemies(count) {
        const minDistance = 200;
        const spawnAttempts = 50;
        
        for (let i = 0; i < count; i++) {
            let validPosition = false;
            let attempts = 0;
            let x, y;
            
            while (!validPosition && attempts < spawnAttempts) {
                x = Math.random() * (this.canvas.width - 100) + 50;
                y = Math.random() * (this.canvas.height - 100) + 50;
                
                const distFromPlayer = Math.sqrt(
                    Math.pow(x - this.player.x, 2) + 
                    Math.pow(y - this.player.y, 2)
                );
                
                let tooClose = false;
                for (let enemy of this.enemies) {
                    const distFromEnemy = Math.sqrt(
                        Math.pow(x - enemy.x, 2) + 
                        Math.pow(y - enemy.y, 2)
                    );
                    if (distFromEnemy < minDistance) {
                        tooClose = true;
                        break;
                    }
                }
                
                if (distFromPlayer >= minDistance && !tooClose) {
                    validPosition = true;
                }
                
                attempts++;
            }
            
            if (validPosition) {
                this.enemies.push({
                    x: x,
                    y: y,
                    velocity: { x: 0, y: 0 },
                    rotation: Math.random() * Math.PI * 2,
                    lasers: 0,
                    hasShield: true
                });
            }
        }
    }
    
    spawnPowerup() {
        // Spawn two power-ups at different locations
        for (let i = 0; i < 2; i++) {
            this.powerups.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                type: 'ammo'
            });
        }
    }
    
    fireLaser() {
        if (this.player.lasers > 0) {
            // Find closest enemy
            let closestEnemy = null;
            let closestDistance = Infinity;
            
            this.enemies.forEach(enemy => {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            });

            if (closestEnemy) {
                this.lasers.push({
                    x: this.player.x,
                    y: this.player.y,
                    rotation: this.player.rotation,
                    velocity: {
                        x: Math.cos(this.player.rotation) * 10,
                        y: Math.sin(this.player.rotation) * 10
                    },
                    owner: 'player',
                    lifeTime: 0,
                    target: closestEnemy
                });
                this.player.lasers--;
                this.updateHUD();
            }
        }
    }
    
    updateHUD() {
        document.getElementById('laser-count').textContent = `${this.player.lasers}/5`;
        document.getElementById('shield-status').textContent = this.player.hasShield ? 'ON' : 'OFF';
        document.getElementById('enemy-count').textContent = this.enemies.length;
        document.getElementById('score').textContent = `Score: ${this.player.score}`;  // Add score display
    }
    
    initStars() {
        // Create stars with different sizes and speeds
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.1,
                brightness: Math.random() * 0.5 + 0.5
            });
        }
    }

    updateStars(deltaTime) {
        this.stars.forEach(star => {
            // Move stars based on their speed
            star.y += star.speed;
            
            // Wrap stars around when they go off screen
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });
    }

    drawStars() {
        this.stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.fill();
        });
    }
    
    update(deltaTime) {
        if (this.gameOver) return;
        
        // Update stars
        this.updateStars(deltaTime);
        
        // Award survival points every 2 seconds
        const survivalTime = performance.now() / 1000; // Convert to seconds
        if (survivalTime - this.lastSurvivalPoint >= this.survivalPointInterval) {
            this.player.score += 10;  // Increased from 1 to 10
            this.lastSurvivalPoint = survivalTime;
            this.updateHUD();
        }
        
        // Calculate movement direction
        let targetRotation = this.player.rotation;
        let isMoving = false;
        
        // Update player movement
        const acceleration = 0.2;
        if (this.keys.up) {
            this.player.velocity.y -= acceleration;
            isMoving = true;
            targetRotation = -Math.PI/2; // Up
        }
        if (this.keys.down) {
            this.player.velocity.y += acceleration;
            isMoving = true;
            targetRotation = Math.PI/2; // Down
        }
        if (this.keys.left) {
            this.player.velocity.x -= acceleration;
            isMoving = true;
            targetRotation = Math.PI; // Left
        }
        if (this.keys.right) {
            this.player.velocity.x += acceleration;
            isMoving = true;
            targetRotation = 0; // Right
        }
        
        // Handle diagonal movement
        if ((this.keys.up && this.keys.right) || (this.keys.down && this.keys.left)) {
            targetRotation = -Math.PI/4; // Up-Right or Down-Left
        }
        if ((this.keys.up && this.keys.left) || (this.keys.down && this.keys.right)) {
            targetRotation = -3*Math.PI/4; // Up-Left or Down-Right
        }
        
        // Smoothly rotate to target direction
        if (isMoving) {
            // Calculate the shortest rotation path
            let rotationDiff = targetRotation - this.player.rotation;
            if (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
            if (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;
            
            // Apply smooth rotation
            this.player.rotation += rotationDiff * 0.2;
        }
        
        // Apply drag
        this.player.velocity.x *= 0.98;
        this.player.velocity.y *= 0.98;
        
        // Update position
        this.player.x += this.player.velocity.x;
        this.player.y += this.player.velocity.y;
        
        // Wrap player around screen edges
        if (this.player.x < 0) this.player.x = this.canvas.width;
        if (this.player.x > this.canvas.width) this.player.x = 0;
        if (this.player.y < 0) this.player.y = this.canvas.height;
        if (this.player.y > this.canvas.height) this.player.y = 0;
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update lasers
        this.lasers = this.lasers.filter(laser => {
            // Update heat seeker trajectory
            if (laser.target) {
                const dx = laser.target.x - laser.x;
                const dy = laser.target.y - laser.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Gradually adjust velocity towards target
                const turnSpeed = 0.1;
                laser.velocity.x += (dx / distance) * turnSpeed;
                laser.velocity.y += (dy / distance) * turnSpeed;
                
                // Normalize velocity to maintain speed
                const speed = Math.sqrt(laser.velocity.x * laser.velocity.x + laser.velocity.y * laser.velocity.y);
                laser.velocity.x = (laser.velocity.x / speed) * 10;
                laser.velocity.y = (laser.velocity.y / speed) * 10;
                
                // Update rotation to match movement direction
                laser.rotation = Math.atan2(laser.velocity.y, laser.velocity.x);
            }

            laser.x += laser.velocity.x;
            laser.y += laser.velocity.y;
            
            // Wrap lasers around screen edges
            if (laser.x < 0) laser.x = this.canvas.width;
            if (laser.x > this.canvas.width) laser.x = 0;
            if (laser.y < 0) laser.y = this.canvas.height;
            if (laser.y > this.canvas.height) laser.y = 0;
            
            // Remove lasers that have been alive too long
            if (laser.lifeTime > 2000) { // 2 seconds
                return false;
            }
            laser.lifeTime += deltaTime * 1000;
            
            if (laser.owner === 'player') {
                for (let i = this.enemies.length - 1; i >= 0; i--) {
                    const enemy = this.enemies[i];
                    if (this.checkCollision(laser, enemy)) {
                        if (enemy.hasShield) {
                            enemy.hasShield = false;
                            this.player.score += 10;  // Increased from 1 to 10
                            this.updateHUD();
                        } else {
                            this.enemies.splice(i, 1);
                            this.player.score += 20;  // Increased from 2 to 20
                            this.updateHUD();
                        }
                        return false;
                    }
                }
            } else if (laser.owner === 'enemy') {
                if (this.checkCollision(laser, this.player)) {
                    if (this.player.hasShield) {
                        this.player.hasShield = false;
                    } else {
                        this.gameOver = true;
                        this.showMessage(`Eliminated! Final Score: ${this.player.score}`);
                    }
                    return false;
                }
                for (let i = this.enemies.length - 1; i >= 0; i--) {
                    const enemy = this.enemies[i];
                    if (enemy !== laser.sourceEnemy && this.checkCollision(laser, enemy)) {
                        if (enemy.hasShield) {
                            enemy.hasShield = false;
                        } else {
                            this.enemies.splice(i, 1);
                        }
                        return false;
                    }
                }
            }
            
            return true;
        });
        
        // Spawn powerups every 3 seconds
        const currentTime = performance.now() / 1000; // Convert to seconds
        if (currentTime - this.lastPowerupSpawn >= this.powerupSpawnInterval) {
            this.spawnPowerup();
            this.lastPowerupSpawn = currentTime;
        }
        
        // Check powerup collisions
        this.powerups = this.powerups.filter(powerup => {
            // Check player collision
            if (this.checkCollision(this.player, powerup)) {
                this.player.lasers = Math.min(5, this.player.lasers + 1);
                this.player.score += 10;  // Increased from 1 to 10
                this.updateHUD();
                return false;
            }
            
            // Check enemy collisions
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                if (this.checkCollision(enemy, powerup)) {
                    enemy.lasers = Math.min(5, enemy.lasers + 1);
                    return false;
                }
            }
            
            return true;
        });
        
        // Check win condition
        if (this.enemies.length === 0) {
            this.gameOver = true;
            this.player.score += 50;  // Increased from 5 to 50
            this.updateHUD();
            this.showMessage(`Victory! Final Score: ${this.player.score}`);
        }
        
        // Update powerups
        this.updatePowerups();
    }
    
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            // Add personality traits to each enemy if they don't exist
            if (!enemy.personality) {
                enemy.personality = {
                    aggressiveness: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
                    cautiousness: Math.random() * 0.3, // Reduced from 0.5 to 0.3
                    wanderlust: Math.random() * 0.2, // Reduced from 0.3 to 0.2
                    targetBias: Math.random() * 0.7 + 0.3 // Increased bias towards other enemies (0.3 to 1.0)
                };
            }

            // Find closest ammo power-up
            let closestAmmo = null;
            let closestAmmoDistance = Infinity;
            this.powerups.forEach(powerup => {
                if (powerup.type === 'ammo') {
                    const distance = this.getDistance(enemy, powerup);
                    if (distance < closestAmmoDistance) {
                        closestAmmoDistance = distance;
                        closestAmmo = powerup;
                    }
                }
            });

            // Find potential targets with weighted selection
            let potentialTargets = [];
            
            // Always consider the player
            const playerDistance = this.getDistance(enemy, this.player);
            potentialTargets.push({
                target: this.player,
                distance: playerDistance,
                weight: 1.0 - enemy.personality.targetBias
            });
            
            // Consider other enemies
            this.enemies.forEach(otherEnemy => {
                if (otherEnemy !== enemy) {
                    const distance = this.getDistance(enemy, otherEnemy);
                    potentialTargets.push({
                        target: otherEnemy,
                        distance: distance,
                        weight: enemy.personality.targetBias
                    });
                }
            });

            // Select target based on weights and distances
            let selectedTarget = potentialTargets[0];
            let bestScore = -Infinity;
            
            potentialTargets.forEach(potential => {
                const score = (1 / potential.distance) * potential.weight;
                if (score > bestScore) {
                    bestScore = score;
                    selectedTarget = potential;
                }
            });

            // Calculate direction to target
            let dx, dy, distance;
            
            // Prioritize ammo collection when out of ammo
            if (enemy.lasers === 0 && closestAmmo) {
                dx = closestAmmo.x - enemy.x;
                dy = closestAmmo.y - enemy.y;
                distance = closestAmmoDistance;
                
                // Move more aggressively towards ammo
                const ammoSpeed = 0.25; // Increased from 0.15
                enemy.velocity.x += (dx / distance) * ammoSpeed;
                enemy.velocity.y += (dy / distance) * ammoSpeed;
            } else {
                dx = selectedTarget.target.x - enemy.x;
                dy = selectedTarget.target.y - enemy.y;
                distance = selectedTarget.distance;
                
                // Movement behavior based on personality
                const minDistance = 30 + (enemy.personality.cautiousness * 50); // Reduced minimum distance
                const maxDistance = 300 + (enemy.personality.aggressiveness * 100); // Increased maximum distance
                
                if (distance > minDistance && distance < maxDistance) {
                    // Move towards target with increased speed
                    const speed = 0.2 * enemy.personality.aggressiveness; // Increased from 0.15
                    enemy.velocity.x += (dx / distance) * speed;
                    enemy.velocity.y += (dy / distance) * speed;
                } else if (distance <= minDistance) {
                    // Reduced retreat behavior
                    const retreatSpeed = 0.05 * enemy.personality.cautiousness; // Reduced from 0.1
                    enemy.velocity.x -= (dx / distance) * retreatSpeed;
                    enemy.velocity.y -= (dy / distance) * retreatSpeed;
                }
            }

            // Reduced random movement
            if (Math.random() < enemy.personality.wanderlust) {
                enemy.velocity.x += (Math.random() - 0.5) * 0.1; // Reduced from 0.2
                enemy.velocity.y += (Math.random() - 0.5) * 0.1; // Reduced from 0.2
            }

            // Apply drag
            enemy.velocity.x *= 0.98;
            enemy.velocity.y *= 0.98;

            // Update position
            enemy.x += enemy.velocity.x;
            enemy.y += enemy.velocity.y;

            // Wrap enemy around screen edges
            if (enemy.x < 0) enemy.x = this.canvas.width;
            if (enemy.x > this.canvas.width) enemy.x = 0;
            if (enemy.y < 0) enemy.y = this.canvas.height;
            if (enemy.y > this.canvas.height) enemy.y = 0;

            // Update rotation to face movement direction
            if (Math.abs(enemy.velocity.x) > 0.1 || Math.abs(enemy.velocity.y) > 0.1) {
                enemy.rotation = Math.atan2(enemy.velocity.y, enemy.velocity.x);
            }

            // Enhanced shooting behavior
            if (enemy.lasers > 0) {
                const targetAngle = Math.atan2(dy, dx);
                const angleDiff = Math.abs(targetAngle - enemy.rotation);
                
                // More aggressive shooting
                const shootAngle = 0.3 + (enemy.personality.aggressiveness * 0.2);
                const shootDistance = 250 + (enemy.personality.aggressiveness * 150);
                
                if (angleDiff < shootAngle && distance < shootDistance) {
                    // Find closest target for enemy
                    let closestTarget = this.player;
                    let closestTargetDistance = this.getDistance(enemy, this.player);
                    
                    this.enemies.forEach(otherEnemy => {
                        if (otherEnemy !== enemy) {
                            const dist = this.getDistance(enemy, otherEnemy);
                            if (dist < closestTargetDistance) {
                                closestTargetDistance = dist;
                                closestTarget = otherEnemy;
                            }
                        }
                    });

                    this.lasers.push({
                        x: enemy.x,
                        y: enemy.y,
                        rotation: enemy.rotation,
                        velocity: {
                            x: Math.cos(enemy.rotation) * 10,
                            y: Math.sin(enemy.rotation) * 10
                        },
                        owner: 'enemy',
                        sourceEnemy: enemy,
                        lifeTime: 0,
                        target: closestTarget
                    });
                    enemy.lasers--;
                }
            }
        });
    }
    
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 20; // Collision radius
    }
    
    showMessage(message) {
        // Create toast container if it doesn't exist
        let toast = document.getElementById('game-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'game-toast';
            document.body.appendChild(toast);
        }

        // Calculate fish rewards
        const fishCount = Math.floor(this.player.score / 50);
        const fishEmoji = '🐟';
        const fishReward = fishCount > 0 ? `<br><br>You earned ${fishCount} ${fishEmoji}!` : '';

        // Set message and show toast
        toast.innerHTML = `<div>${message}${fishReward}</div>`;
        
        // Add restart button
        let restartButton = document.createElement('button');
        restartButton.textContent = 'Play Again';
        restartButton.onclick = () => {
            location.reload();
        };
        toast.appendChild(restartButton);

        // Show the toast
        toast.className = 'show';
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        this.drawStars();
        
        // Draw player
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        this.ctx.rotate(this.player.rotation);
        
        // Draw shield if active
        if (this.player.hasShield) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#0ff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        // Draw engine glow
        const engineGlow = this.ctx.createRadialGradient(-20, 0, 0, -20, 0, 15);
        engineGlow.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
        engineGlow.addColorStop(0.5, 'rgba(0, 255, 255, 0.3)');
        engineGlow.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        // Pulsing engine effect
        const pulseSize = Math.sin(performance.now() / 100) * 3 + 12;
        this.ctx.beginPath();
        this.ctx.arc(-20, 0, pulseSize, 0, Math.PI * 2);
        this.ctx.fillStyle = engineGlow;
        this.ctx.fill();
        
        // Main body
        this.ctx.beginPath();
        this.ctx.moveTo(25, 0);
        this.ctx.lineTo(-15, -15);
        this.ctx.lineTo(-20, -5);
        this.ctx.lineTo(-25, 0);
        this.ctx.lineTo(-20, 5);
        this.ctx.lineTo(-15, 15);
        this.ctx.closePath();
        this.ctx.fillStyle = '#0ff';
        this.ctx.fill();
        
        // Cockpit
        this.ctx.beginPath();
        this.ctx.arc(8, 0, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        
        // Cockpit glow
        const cockpitGlow = this.ctx.createRadialGradient(8, 0, 0, 8, 0, 8);
        cockpitGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        cockpitGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.beginPath();
        this.ctx.arc(8, 0, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = cockpitGlow;
        this.ctx.fill();
        
        // Wings
        this.ctx.beginPath();
        this.ctx.moveTo(0, -15);
        this.ctx.lineTo(-10, -25);
        this.ctx.lineTo(5, -15);
        this.ctx.closePath();
        this.ctx.fillStyle = '#0ff';
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, 15);
        this.ctx.lineTo(-10, 25);
        this.ctx.lineTo(5, 15);
        this.ctx.closePath();
        this.ctx.fillStyle = '#0ff';
        this.ctx.fill();
        
        // Wing details
        this.ctx.beginPath();
        this.ctx.moveTo(-5, -20);
        this.ctx.lineTo(0, -15);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(-5, 20);
        this.ctx.lineTo(0, 15);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // Draw lasers
        this.lasers.forEach(laser => {
            // Draw laser glow
            const glowGradient = this.ctx.createRadialGradient(
                laser.x, laser.y, 0,
                laser.x, laser.y, 15
            );
            glowGradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
            glowGradient.addColorStop(0.3, 'rgba(255, 0, 0, 0.8)');
            glowGradient.addColorStop(0.6, 'rgba(255, 0, 0, 0.4)');
            glowGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(laser.x, laser.y, 15, 0, Math.PI * 2);
            this.ctx.fillStyle = glowGradient;
            this.ctx.fill();
            
            // Draw laser beam
            this.ctx.save();
            this.ctx.translate(laser.x, laser.y);
            this.ctx.rotate(laser.rotation);
            
            // Main laser beam
            this.ctx.beginPath();
            this.ctx.moveTo(0, -4);
            this.ctx.lineTo(35, -4);
            this.ctx.lineTo(35, 4);
            this.ctx.lineTo(0, 4);
            this.ctx.closePath();
            
            // Create laser gradient
            const laserGradient = this.ctx.createLinearGradient(0, 0, 35, 0);
            laserGradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
            laserGradient.addColorStop(0.7, 'rgba(255, 0, 0, 0.8)');
            laserGradient.addColorStop(1, 'rgba(255, 0, 0, 0.4)');
            
            this.ctx.fillStyle = laserGradient;
            this.ctx.fill();
            
            // Add bright center line
            this.ctx.beginPath();
            this.ctx.moveTo(0, -2);
            this.ctx.lineTo(35, -2);
            this.ctx.lineTo(35, 2);
            this.ctx.lineTo(0, 2);
            this.ctx.closePath();
            this.ctx.fillStyle = '#fff';
            this.ctx.fill();
            
            this.ctx.restore();
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            this.ctx.save();
            this.ctx.translate(enemy.x, enemy.y);
            this.ctx.rotate(enemy.rotation);
            
            if (enemy.hasShield) {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
                this.ctx.strokeStyle = '#f0f';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
            
            // Draw engine glow
            const enemyEngineGlow = this.ctx.createRadialGradient(-20, 0, 0, -20, 0, 15);
            enemyEngineGlow.addColorStop(0, 'rgba(255, 0, 255, 0.8)');
            enemyEngineGlow.addColorStop(0.5, 'rgba(255, 0, 255, 0.3)');
            enemyEngineGlow.addColorStop(1, 'rgba(255, 0, 255, 0)');
            
            // Pulsing engine effect
            const enemyPulseSize = Math.sin(performance.now() / 100) * 3 + 12;
            this.ctx.beginPath();
            this.ctx.arc(-20, 0, enemyPulseSize, 0, Math.PI * 2);
            this.ctx.fillStyle = enemyEngineGlow;
            this.ctx.fill();
            
            // Main body
            this.ctx.beginPath();
            this.ctx.moveTo(25, 0);
            this.ctx.lineTo(-15, -15);
            this.ctx.lineTo(-20, -5);
            this.ctx.lineTo(-25, 0);
            this.ctx.lineTo(-20, 5);
            this.ctx.lineTo(-15, 15);
            this.ctx.closePath();
            this.ctx.fillStyle = '#f0f';
            this.ctx.fill();
            
            // Cockpit
            this.ctx.beginPath();
            this.ctx.arc(8, 0, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.fill();
            
            // Cockpit glow
            const enemyCockpitGlow = this.ctx.createRadialGradient(8, 0, 0, 8, 0, 8);
            enemyCockpitGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            enemyCockpitGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.beginPath();
            this.ctx.arc(8, 0, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = enemyCockpitGlow;
            this.ctx.fill();
            
            // Wings
            this.ctx.beginPath();
            this.ctx.moveTo(0, -15);
            this.ctx.lineTo(-10, -25);
            this.ctx.lineTo(5, -15);
            this.ctx.closePath();
            this.ctx.fillStyle = '#f0f';
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, 15);
            this.ctx.lineTo(-10, 25);
            this.ctx.lineTo(5, 15);
            this.ctx.closePath();
            this.ctx.fillStyle = '#f0f';
            this.ctx.fill();
            
            // Wing details
            this.ctx.beginPath();
            this.ctx.moveTo(-5, -20);
            this.ctx.lineTo(0, -15);
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(-5, 20);
            this.ctx.lineTo(0, 15);
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            this.ctx.restore();
        });
        
        // Draw powerups
        this.powerups.forEach(powerup => {
            // Create pulsing glow effect
            const pulseSize = Math.sin(performance.now() / 200) * 10 + 25;
            const gradient = this.ctx.createRadialGradient(
                powerup.x, powerup.y, 0,
                powerup.x, powerup.y, pulseSize
            );
            
            // Add glow gradient with increased intensity
            if (powerup.type === 'ammo') {
                gradient.addColorStop(0, 'rgba(255, 215, 0, 1)');  // Gold
                gradient.addColorStop(0.3, 'rgba(255, 215, 0, 0.6)');
                gradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.2)');
            } else {
                gradient.addColorStop(0, 'rgba(255, 100, 0, 1)');
                gradient.addColorStop(0.3, 'rgba(255, 100, 0, 0.6)');
                gradient.addColorStop(0.7, 'rgba(255, 100, 0, 0.2)');
            }
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            // Draw outer glow
            this.ctx.beginPath();
            this.ctx.arc(powerup.x, powerup.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Draw inner glow
            const innerGlow = this.ctx.createRadialGradient(
                powerup.x, powerup.y, 0,
                powerup.x, powerup.y, 15
            );
            if (powerup.type === 'ammo') {
                innerGlow.addColorStop(0, 'rgba(255, 215, 0, 0.8)');  // Gold
            } else {
                innerGlow.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
            }
            innerGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(powerup.x, powerup.y, 15, 0, Math.PI * 2);
            this.ctx.fillStyle = innerGlow;
            this.ctx.fill();
            
            // Draw power-up core
            this.ctx.beginPath();
            this.ctx.arc(powerup.x, powerup.y, 10, 0, Math.PI * 2);
            this.ctx.fillStyle = powerup.type === 'ammo' ? '#FFD700' : '#ff6400';  // Gold for ammo
            this.ctx.fill();
        });
    }
    
    gameLoop(currentTime) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    // Update powerup positions to wrap around screen
    updatePowerups() {
        this.powerups.forEach(powerup => {
            // Wrap powerups around screen edges
            if (powerup.x < 0) powerup.x = this.canvas.width;
            if (powerup.x > this.canvas.width) powerup.x = 0;
            if (powerup.y < 0) powerup.y = this.canvas.height;
            if (powerup.y > this.canvas.height) powerup.y = 0;
        });
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
}); 