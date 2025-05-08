// Main game class to handle game state and interactions

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Game state
        this.treats = 10; // Start with 10 treats
        this.fullness = 0;
        this.fullnessThreshold = 10;
        this.isHairballActive = false;
        this.currentHairball = null;
        
        // Initialize game objects
        this.background = new Background(canvas);
        this.cat = new Cat(canvas);
        this.hatCollection = new HatCollection();
        this.animationManager = new AnimationSystem.AnimationManager();
        
        // UI elements
        this.treatsCountElement = document.getElementById('treats-count');
        this.fullnessProgressElement = document.getElementById('fullness-progress');
        this.hatInventory = document.getElementById('hat-inventory');
        this.hatsGrid = document.getElementById('hats-grid');
        
        // Bind event handlers
        this.handleResize = this.handleResize.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleTouch = this.handleTouch.bind(this);
        
        // Initialize the game
        this.init();
    }
    
    async init() {
        // Set up event listeners
        window.addEventListener('resize', this.handleResize);
        this.canvas.addEventListener('click', this.handleClick);
        this.canvas.addEventListener('touchstart', this.handleTouch);
        
        // Set up inventory UI
        document.getElementById('hat-closet-button').addEventListener('click', () => this.toggleInventory());
        document.getElementById('close-inventory').addEventListener('click', () => this.toggleInventory());
        
        // Set up rarity filters
        document.querySelectorAll('.rarity-filter').forEach(button => {
            button.addEventListener('click', (e) => this.filterHats(e.target.dataset.rarity));
        });
        
        // Set up debug controls
        document.getElementById('add-treats').addEventListener('click', () => {
            this.treats += 10;
            this.updateTreatsDisplay();
            this.saveGameState();
        });
        
        // Initialize hat collection
        console.log('Initializing hat collection...');
        await this.hatCollection.initialize();
        console.log('Hat collection initialized');
        
        // Load saved game state
        this.loadGameState();
        
        // Start game loop
        this.handleResize();
        this.gameLoop();
    }
    
    handleResize() {
        // Update canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Update game objects
        this.background.handleResize();
        this.cat.handleResize();
    }
    
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.handleInteraction(x, y);
    }
    
    handleTouch(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.handleInteraction(x, y);
    }
    
    handleInteraction(x, y) {
        // If taps are blocked, ignore the interaction
        if (this.cat.isBlockingTaps()) {
            return;
        }

        // Start click animation
        this.cat.startClickAnimation();
        
        if (this.isHairballActive) {
            this.openHairball();
        } else if (this.treats > 0) {
            this.feedCat();
        }
    }
    
    feedCat() {
        if (this.treats <= 0) return;
        
        this.treats--;
        this.updateTreatsDisplay();
        
        // Start eating animation
        this.cat.startEating();
        
        // Increase fullness
        this.fullness++;
        this.updateFullnessDisplay();
        
        // Check if cat should cough up hairball
        if (this.fullness >= this.fullnessThreshold) {
            this.generateHairball();
        }
        
        // Save game state
        this.saveGameState();
    }
    
    generateHairball() {
        this.isHairballActive = true;
        this.fullness = 0;
        this.updateFullnessDisplay();
        
        // Start coughing animation
        this.cat.startCoughing();
        
        // Create hairball with random rarity
        const rarity = GameUtils.getRandomRarity();
        this.currentHairball = {
            rarity,
            hat: this.hatCollection.getRandomHat()
        };
        
        // Add hairball animation
        this.animationManager.add(new AnimationSystem.HairballAnimation(this.cat, rarity));
    }
    
    openHairball() {
        if (!this.isHairballActive || !this.currentHairball) return;
        
        this.isHairballActive = false;
        this.cat.stopCoughing();
        
        // Unlock and reveal the hat
        const hat = this.currentHairball.hat;
        if (!hat) {
            console.error('No hat in hairball!');
            return;
        }
        console.log('Opening hairball with hat:', hat);
        this.hatCollection.unlockHat(hat.id);
        
        // Create temporary hat reveal display
        const hatDisplay = document.createElement('div');
        hatDisplay.className = 'hat-reveal-display';
        
        const hatImage = document.createElement('img');
        hatImage.src = hat.imagePath;
        hatImage.alt = hat.name;
        
        const hatName = document.createElement('div');
        hatName.className = `hat-name ${hat.rarity}`;
        hatName.textContent = hat.name;
        
        hatDisplay.appendChild(hatImage);
        hatDisplay.appendChild(hatName);
        
        document.getElementById('game-container').appendChild(hatDisplay);
        
        // Remove display after 5 seconds
        setTimeout(() => {
            hatDisplay.classList.add('fade-out');
            setTimeout(() => {
                hatDisplay.remove();
            }, 500); // 500ms for fade out animation
        }, 5000);
        
        this.currentHairball = null;
    }
    
    updateTreatsDisplay() {
        this.treatsCountElement.textContent = this.treats;
    }
    
    updateFullnessDisplay() {
        const percentage = (this.fullness / this.fullnessThreshold) * 100;
        this.fullnessProgressElement.style.width = `${percentage}%`;
    }
    
    toggleInventory() {
        this.hatInventory.classList.toggle('hidden');
        if (!this.hatInventory.classList.contains('hidden')) {
            this.updateInventory();
        }
    }
    
    updateInventory() {
        this.hatsGrid.innerHTML = '';
        
        const currentFilter = document.querySelector('.rarity-filter.active').dataset.rarity;
        const hats = this.hatCollection.getHatsByRarity(currentFilter);
        
        hats.forEach(hat => {
            const hatElement = document.createElement('div');
            hatElement.className = `hat-item ${hat.isUnlocked ? '' : 'locked'}`;
            
            // Create an image for the hat
            const img = document.createElement('img');
            img.src = hat.imagePath;
            img.alt = hat.name;
            
            hatElement.appendChild(img);
            
            if (hat.isUnlocked) {
                hatElement.addEventListener('click', () => {
                    this.cat.wearHat(hat);
                });
            }
            
            this.hatsGrid.appendChild(hatElement);
        });
    }
    
    filterHats(rarity) {
        document.querySelectorAll('.rarity-filter').forEach(button => {
            button.classList.toggle('active', button.dataset.rarity === rarity);
        });
        this.updateInventory();
    }
    
    saveGameState() {
        const state = {
            treats: this.treats,
            fullness: this.fullness,
            fullnessThreshold: this.fullnessThreshold
        };
        GameUtils.saveGameState(state);
    }
    
    loadGameState() {
        const state = GameUtils.loadGameState();
        if (state) {
            this.treats = state.treats;
            this.fullness = state.fullness;
            this.fullnessThreshold = state.fullnessThreshold;
            
            this.updateTreatsDisplay();
            this.updateFullnessDisplay();
        }
    }
    
    gameLoop() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.background.draw();
        
        // Update game objects
        this.cat.update();
        this.animationManager.update(performance.now());
        
        // Draw game objects
        this.cat.draw();
        this.cat.drawHat();
        this.animationManager.draw(this.ctx);
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    new Game(canvas);
}); 