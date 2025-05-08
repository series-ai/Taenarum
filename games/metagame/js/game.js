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
        
        // Set up avatar selector UI
        document.getElementById('avatar-button').addEventListener('click', () => this.toggleAvatarSelector());
        document.getElementById('close-avatar-selector').addEventListener('click', () => this.toggleAvatarSelector());
        
        // Set up rarity filters for hats
        document.querySelectorAll('#hat-inventory .rarity-filter').forEach(button => {
            button.addEventListener('click', (e) => this.filterHats(e.target.dataset.rarity));
        });

        // Set up type filters for avatars
        document.querySelectorAll('#avatar-selector .rarity-filter').forEach(button => {
            button.addEventListener('click', (e) => this.filterAvatars(e.target.dataset.type));
        });
        
        // Set up debug controls
        document.getElementById('add-treats').addEventListener('click', () => {
            this.treats += 10;
            this.updateTreatsDisplay();
            this.saveGameState();
        });
        
        // Initialize collections
        console.log('Initializing collections...');
        await this.hatCollection.initialize();
        console.log('Collections initialized');
        
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
        
        // Add click handler to equip hat and hide display
        hatDisplay.addEventListener('click', () => {
            this.cat.wearHat(hat);
            hatDisplay.classList.add('fade-out');
            setTimeout(() => hatDisplay.remove(), 500);
        });
        
        document.getElementById('game-container').appendChild(hatDisplay);
        
        // Auto-hide after 5 seconds if not clicked
        setTimeout(() => {
            if (document.body.contains(hatDisplay)) {
                hatDisplay.classList.add('fade-out');
                setTimeout(() => {
                    if (document.body.contains(hatDisplay)) {
                        hatDisplay.remove();
                    }
                }, 500);
            }
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
        
        const currentFilter = document.querySelector('#hat-inventory .rarity-filter.active').dataset.rarity;
        const hats = this.hatCollection.getHatsByRarity(currentFilter);
        
        hats.forEach(hat => {
            const hatElement = document.createElement('div');
            const classes = ['hat-item'];
            if (!hat.isUnlocked) {
                classes.push('locked');
            }
            if (this.cat.currentHat && this.cat.currentHat.id === hat.id) {
                classes.push('selected');
            }
            hatElement.className = classes.join(' ');
            
            // Create an image for the hat
            const img = document.createElement('img');
            img.src = hat.imagePath;
            img.alt = hat.name;
            
            hatElement.appendChild(img);
            
            if (hat.isUnlocked) {
                hatElement.addEventListener('click', () => {
                    // If clicking the currently equipped hat, unequip it
                    if (this.cat.currentHat && this.cat.currentHat.id === hat.id) {
                        this.cat.wearHat(null);
                    } else {
                        this.cat.wearHat(hat);
                    }
                    this.updateInventory(); // Refresh to update selection
                });
            }
            
            this.hatsGrid.appendChild(hatElement);
        });
    }
    
    filterHats(rarity) {
        // Update active filter button
        document.querySelectorAll('#hat-inventory .rarity-filter').forEach(button => {
            button.classList.toggle('active', button.dataset.rarity === rarity);
        });
        this.updateInventory();
    }
    
    toggleAvatarSelector() {
        const selector = document.getElementById('avatar-selector');
        selector.classList.toggle('hidden');
        if (!selector.classList.contains('hidden')) {
            this.updateAvatarSelector();
        }
    }

    updateAvatarSelector() {
        const grid = document.getElementById('avatars-grid');
        grid.innerHTML = '';
        
        const currentFilter = document.querySelector('#avatar-selector .rarity-filter.active').dataset.type;
        const avatars = this.filterAvatarsByType(currentFilter);
        
        avatars.forEach(avatar => {
            const avatarElement = document.createElement('div');
            const classes = ['avatar-item', this.getAvatarType(avatar.id)];
            if (this.cat.avatar?.id === avatar.id) {
                classes.push('selected');
            }
            avatarElement.className = classes.join(' ');
            
            const img = document.createElement('img');
            img.src = `assets/avatars/${avatar.sprite.file}`;
            img.alt = avatar.displayName;
            
            const name = document.createElement('div');
            name.className = 'name';
            name.textContent = avatar.displayName;
            
            avatarElement.appendChild(img);
            avatarElement.appendChild(name);
            
            avatarElement.addEventListener('click', async () => {
                // If clicking the current avatar, do nothing
                if (this.cat.avatar?.id !== avatar.id) {
                    // Update selection immediately
                    document.querySelectorAll('.avatar-item').forEach(item => item.classList.remove('selected'));
                    avatarElement.classList.add('selected');
                    
                    // Then set the avatar
                    await this.cat.setAvatar(avatar.id);
                }
            });
            
            grid.appendChild(avatarElement);
        });
    }

    filterAvatars(type) {
        // Update active filter button
        document.querySelectorAll('#avatar-selector .rarity-filter').forEach(button => {
            button.classList.toggle('active', button.dataset.type === type);
        });
        
        this.updateAvatarSelector();
    }

    filterAvatarsByType(type) {
        const avatars = GameConfig.avatars.types;
        if (type === 'all') return avatars;
        
        return avatars.filter(avatar => this.getAvatarType(avatar.id) === type);
    }

    getAvatarType(id) {
        // Categorize avatars
        const cats = ['tabby', 'bread', 'onion'];
        const animals = ['axolotl', 'duck', 'dragon', 'pug', 'giraffe', 'bear', 'panda'];
        const food = ['bread', 'onion'];
        
        if (cats.includes(id)) return 'cats';
        if (animals.includes(id)) return 'animals';
        if (food.includes(id)) return 'food';
        return 'other';
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