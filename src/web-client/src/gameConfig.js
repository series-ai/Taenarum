export const fullnessThreshold = 10;

// Utility function to load an image
export const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err); // Pass error object
    img.src = src;
  });
};

export const allHats = [
  {
    id: 'party_hat', // Kept from previous mock, not in original config.js
    name: 'Party Hat',
    rarity: 'common',
    imagePath: '/assets/hats/party_hat.png',
    // isUnlocked: true // isUnlocked will be managed by game state, not static config
  },
  {
    id: 'watermelon',
    name: 'Watermelon Hat',
    rarity: 'uncommon',
    imagePath: '/assets/hats/watermelon.png'
  },
  {
    id: 'viking',
    name: 'Viking Helmet',
    rarity: 'rare',
    imagePath: '/assets/hats/viking.png'
  },
  {
    id: 'flower',
    name: 'Flower Crown',
    rarity: 'common',
    imagePath: '/assets/hats/flower.png'
  },
  {
    id: 'pumpkin',
    name: 'Pumpkin Hat',
    rarity: 'uncommon',
    imagePath: '/assets/hats/pumpkin.png'
  },
  {
    id: 'bunnyears',
    name: 'Bunny Ears',
    rarity: 'rare',
    imagePath: '/assets/hats/bunnyears.png'
  },
  {
    id: 'fez',
    name: 'Fez',
    rarity: 'uncommon',
    imagePath: '/assets/hats/fez.png'
  },
  {
    id: 'grad',
    name: 'Graduation Cap',
    rarity: 'rare',
    imagePath: '/assets/hats/grad.png'
  },
  {
    id: 'santa',
    name: 'Santa Hat',
    rarity: 'rare',
    imagePath: '/assets/hats/santa.png'
  },
  {
    id: 'construction',
    name: 'Construction Hat',
    rarity: 'common',
    imagePath: '/assets/hats/construction.png'
  },
  {
    id: 'witchhat',
    name: 'Witch Hat',
    rarity: 'rare',
    imagePath: '/assets/hats/witchhat.png'
  },
  {
    id: 'pirate',
    name: 'Pirate Hat',
    rarity: 'legendary',
    imagePath: '/assets/hats/pirate.png'
  }
];

// For React, we might not need the mockHat separately if it's included in allHats
// or if the triggerGenerateHairball logic directly picks from allHats.
// For now, let's keep it for compatibility with existing code, but mark for review.
export const mockHat = allHats.find(hat => hat.id === 'party_hat');

export const rarityWeights = {
  common: 0.5,
  uncommon: 0.3,
  rare: 0.15,
  legendary: 0.05
};

// TODO: Add more configurations here as we extract them:
// - Avatar definitions (from original config.js)
// - Initial player stats (e.g., initial treats, if not managed by localStorage defaults)
// - Animation settings (frame rates, delays if they become configurable)
// - Sound paths and definitions 