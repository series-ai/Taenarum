// Game configuration

const GameConfig = {
    // Avatar definitions
    avatars: [
        {
            id: 'tabby',
            name: 'Tabby Cat',
            file: 'tabby.png'
        },
        {
            id: 'siamese',
            name: 'Siamese Cat',
            file: 'siamese.png'
        },
        {
            id: 'tuxedo',
            name: 'Tuxedo Cat',
            file: 'tuxedo.png'
        },
        {
            id: 'orange',
            name: 'Orange Cat',
            file: 'orange.png'
        },
        {
            id: 'calico',
            name: 'Calico Cat',
            file: 'calico.png'
        }
    ],

    // Hat definitions with file paths, display names, and rarities
    hats: [
        {
            id: 'watermelon',
            name: 'Watermelon Hat',
            rarity: 'uncommon',
            file: 'watermelon.png'
        },
        {
            id: 'viking',
            name: 'Viking Helmet',
            rarity: 'rare',
            file: 'viking.png'
        },
        {
            id: 'flower',
            name: 'Flower Crown',
            rarity: 'common',
            file: 'flower.png'
        },
        {
            id: 'pumpkin',
            name: 'Pumpkin Hat',
            rarity: 'uncommon',
            file: 'pumpkin.png'
        },
        {
            id: 'bunnyears',
            name: 'Bunny Ears',
            rarity: 'rare',
            file: 'bunnyears.png'
        },
        {
            id: 'fez',
            name: 'Fez',
            rarity: 'uncommon',
            file: 'fez.png'
        },
        {
            id: 'grad',
            name: 'Graduation Cap',
            rarity: 'rare',
            file: 'grad.png'
        },
        {
            id: 'santa',
            name: 'Santa Hat',
            rarity: 'rare',
            file: 'santa.png'
        },
        {
            id: 'construction',
            name: 'Construction Hat',
            rarity: 'common',
            file: 'construction.png'
        },
        {
            id: 'witchhat',
            name: 'Witch Hat',
            rarity: 'rare',
            file: 'witchhat.png'
        },
        {
            id: 'pirate',
            name: 'Pirate Hat',
            rarity: 'legendary',
            file: 'pirate.png'
        }
    ],

    // Rarity weights for random hat selection
    rarityWeights: {
        common: 0.5,
        uncommon: 0.3,
        rare: 0.15,
        legendary: 0.05
    },

    // Default player settings
    defaultPlayer: {
        avatarId: 'tabby',
        hatId: null
    }
};

// Export config
window.GameConfig = GameConfig; 