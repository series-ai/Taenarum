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

export const mockHat = allHats.find(hat => hat.id === 'party_hat');

export const rarityWeights = {
  common: 0.5,
  uncommon: 0.3,
  rare: 0.15,
  legendary: 0.05
};

// Avatar Definitions
export const defaultAvatarId = 'tabby'; // Default avatar ID from original config

export const allAvatars = [
  // Avatars migrated from original config.js (using 128x128 sprites)
  {
    id: 'tabby',
    name: 'Tabby Cat',
    spritesheetPath: '/assets/avatars/tabby.png',
    frameWidth: 128,
    frameHeight: 128,
    animationRows: { idle: 0, eating: 0, coughing: 1 }, // Placeholder eating/coughing rows
    // TODO: Define headOffset for hat positioning for 128x128 avatars like tabby
  },
  {
    id: 'axolotl',
    name: 'Axolotl',
    spritesheetPath: '/assets/avatars/axolotl.png',
    frameWidth: 128,
    frameHeight: 128,
    animationRows: { idle: 0, eating: 0, coughing: 1 },
  },
  {
    id: 'duck',
    name: 'Duck',
    spritesheetPath: '/assets/avatars/duck.png',
    frameWidth: 128,
    frameHeight: 128,
    animationRows: { idle: 0, eating: 0, coughing: 1 },
  },
  {
    id: 'dragon',
    name: 'Dragon',
    spritesheetPath: '/assets/avatars/dragon.png',
    frameWidth: 128,
    frameHeight: 128,
    animationRows: { idle: 0, eating: 0, coughing: 1 },
  },
  {
    id: 'pug',
    name: 'Pug',
    spritesheetPath: '/assets/avatars/pug.png',
    frameWidth: 128,
    frameHeight: 128,
    animationRows: { idle: 0, eating: 0, coughing: 1 },
  },
  {
    id: 'bread',
    name: 'Bread Cat',
    spritesheetPath: '/assets/avatars/bread.png',
    frameWidth: 128,
    frameHeight: 128,
    animationRows: { idle: 0, eating: 0, coughing: 1 },
  },
  {
    id: 'onion',
    name: 'Onion Cat',
    spritesheetPath: '/assets/avatars/onion.png',
    frameWidth: 128,
    frameHeight: 128,
    animationRows: { idle: 0, eating: 0, coughing: 1 },
  },
  {
    id: 'giraffe',
    name: 'Giraffe',
    spritesheetPath: '/assets/avatars/giraffe.png',
    frameWidth: 128,
    frameHeight: 128,
    animationRows: { idle: 0, eating: 0, coughing: 1 },
  },
  {
    id: 'bear',
    name: 'Bear',
    spritesheetPath: '/assets/avatars/bear.png',
    frameWidth: 128,
    frameHeight: 128,
    animationRows: { idle: 0, eating: 0, coughing: 1 },
  },
  {
    id: 'panda',
    name: 'Panda',
    spritesheetPath: '/assets/avatars/panda.png',
    frameWidth: 128,
    frameHeight: 128,
    animationRows: { idle: 0, eating: 0, coughing: 1 },
  },
];

// Function to get a specific avatar's configuration
export const getAvatarConfig = (avatarId) => {
  return allAvatars.find(avatar => avatar.id === avatarId) || allAvatars.find(avatar => avatar.id === defaultAvatarId);
};

// Avatar Categories for filtering (based on original game.js)
// TODO: Review these categories and avatar assignments. Ensure all avatars in allAvatars are covered or have a default category.
export const avatarCategories = {
  all: { name: 'All', filterFn: (avatar) => true }, // Filter function for 'all'
  cats: { name: 'Cats', ids: ['defaultCat', 'tabby', 'bread', 'onion'] },
  animals: { name: 'Animals', ids: ['axolotl', 'duck', 'dragon', 'pug', 'giraffe', 'bear', 'panda', 'tabby'] }, // Tabby is also an animal
  food: { name: 'Food', ids: ['bread', 'onion'] },
  // other: { name: 'Other', ids: [] } // Can be a catch-all if needed
};

export const getAvatarType = (avatarId) => {
  for (const categoryName in avatarCategories) {
    if (categoryName === 'all') continue;
    if (avatarCategories[categoryName].ids && avatarCategories[categoryName].ids.includes(avatarId)) {
      return categoryName; // Returns the first category an avatar belongs to
    }
  }
  // If not found in specific categories, check if it's a known avatar and assign to a default category like 'other'
  // This ensures all avatars get some category, even if not explicitly listed.
  if (allAvatars.some(av => av.id === avatarId)) return 'other';
  return 'other'; // Fallback for any other case, or if an avatar ID isn't in allAvatars.
};
