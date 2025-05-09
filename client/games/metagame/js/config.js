// Game configuration

const GameConfig = {
    // Avatar configuration
    avatars: {
        // Available avatars
        types: [
            {
                id: 'tabby',
                displayName: 'Tabby Cat',
                sprite: {
                    file: 'avatarvector/tabby.png',
                    frameWidth: 128,
                    frameHeight: 128,
                    animations: {
                        idle: { row: 0, frames: 1 }
                    }
                }
            },
            {
                id: 'axolotl',
                displayName: 'Axolotl',
                sprite: {
                    file: 'avatarvector/axolotl.png',
                    frameWidth: 128,
                    frameHeight: 128,
                    animations: {
                        idle: { row: 0, frames: 1 }
                    }
                }
            },
            {
                id: 'duck',
                displayName: 'Duck',
                sprite: {
                    file: 'avatarvector/duck.png',
                    frameWidth: 128,
                    frameHeight: 128,
                    animations: {
                        idle: { row: 0, frames: 1 }
                    }
                }
            },
            {
                id: 'dragon',
                displayName: 'Dragon',
                sprite: {
                    file: 'avatarvector/dragon.png',
                    frameWidth: 128,
                    frameHeight: 128,
                    animations: {
                        idle: { row: 0, frames: 1 }
                    }
                }
            },
            {
                id: 'pug',
                displayName: 'Pug',
                sprite: {
                    file: 'avatarvector/pug.png',
                    frameWidth: 128,
                    frameHeight: 128,
                    animations: {
                        idle: { row: 0, frames: 1 }
                    }
                }
            },
            {
                id: 'bread',
                displayName: 'Bread Cat',
                sprite: {
                    file: 'avatarvector/bread.png',
                    frameWidth: 128,
                    frameHeight: 128,
                    animations: {
                        idle: { row: 0, frames: 1 }
                    }
                }
            },
            {
                id: 'onion',
                displayName: 'Onion Cat',
                sprite: {
                    file: 'avatarvector/onion.png',
                    frameWidth: 128,
                    frameHeight: 128,
                    animations: {
                        idle: { row: 0, frames: 1 }
                    }
                }
            },
            {
                id: 'giraffe',
                displayName: 'Giraffe',
                sprite: {
                    file: 'avatarvector/giraffe.png',
                    frameWidth: 128,
                    frameHeight: 128,
                    animations: {
                        idle: { row: 0, frames: 1 }
                    }
                }
            },
            {
                id: 'bear',
                displayName: 'Bear',
                sprite: {
                    file: 'avatarvector/bear.png',
                    frameWidth: 128,
                    frameHeight: 128,
                    animations: {
                        idle: { row: 0, frames: 1 }
                    }
                }
            },
            {
                id: 'panda',
                displayName: 'Panda',
                sprite: {
                    file: 'avatarvector/panda.png',
                    frameWidth: 128,
                    frameHeight: 128,
                    animations: {
                        idle: { row: 0, frames: 1 }
                    }
                }
            }
        ],
        // Default animation timings
        animationSpeed: {
            idle: 150      // ms per frame
        }
    },

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