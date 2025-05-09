class HatCollection {
    constructor() {
        this.hats = [];
        this.unlockedHats = new Set();
    }

    async initialize() {
        // Create Hat instances from config
        this.hats = GameConfig.hats.map(def => 
            new Hat(
                def.id,
                def.name,
                def.rarity,
                `assets/hats/${def.file}`
            )
        );

        // Load saved unlocked hats
        this.loadUnlockedHats();
    }

    getRandomHat() {
        // Use rarity weights from config
        const weights = GameConfig.rarityWeights;

        // First, determine rarity
        const roll = Math.random();
        let targetRarity;
        let sum = 0;
        
        for (const [rarity, weight] of Object.entries(weights)) {
            sum += weight;
            if (roll <= sum) {
                targetRarity = rarity;
                break;
            }
        }

        // Get all hats of that rarity
        const possibleHats = this.hats.filter(hat => hat.rarity === targetRarity);
        
        // Return a random hat from that rarity pool
        return possibleHats[Math.floor(Math.random() * possibleHats.length)];
    }

    unlockHat(hatId) {
        this.unlockedHats.add(hatId);
        this.hats.find(hat => hat.id === hatId).isUnlocked = true;
        this.saveUnlockedHats();
    }

    getHatsByRarity(rarity) {
        if (rarity === 'all') {
            return this.hats;
        }
        return this.hats.filter(hat => hat.rarity === rarity);
    }

    saveUnlockedHats() {
        localStorage.setItem('unlockedHats', JSON.stringify(Array.from(this.unlockedHats)));
    }

    loadUnlockedHats() {
        const saved = localStorage.getItem('unlockedHats');
        if (saved) {
            this.unlockedHats = new Set(JSON.parse(saved));
            // Update isUnlocked flag on hat objects
            this.unlockedHats.forEach(hatId => {
                const hat = this.hats.find(h => h.id === hatId);
                if (hat) {
                    hat.isUnlocked = true;
                }
            });
        }
    }
}

// Export HatCollection class
window.HatCollection = HatCollection; 