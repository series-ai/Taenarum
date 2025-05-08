import { rarityWeights, allHats } from '../gameConfig'; // Assuming gameConfig is in src

// Helper function to get a random rarity based on weights
export const getRandomRarity = () => {
  const rand = Math.random();
  let cumulativeProbability = 0;
  for (const rarity in rarityWeights) {
    cumulativeProbability += rarityWeights[rarity];
    if (rand < cumulativeProbability) {
      return rarity;
    }
  }
  return 'common'; // Fallback, should not be reached if weights sum to 1
};

// Helper function to get a random hat, potentially filtered by rarity
export const getRandomHat = (targetRarity = null) => {
  const selectedRarity = targetRarity || getRandomRarity();
  const hatsOfSelectedRarity = allHats.filter(hat => hat.rarity === selectedRarity);

  if (hatsOfSelectedRarity.length > 0) {
    const randomIndex = Math.floor(Math.random() * hatsOfSelectedRarity.length);
    return hatsOfSelectedRarity[randomIndex];
  } else {
    // Fallback: if no hats of the selected rarity, try to get any common hat or any hat if no common
    const commonHats = allHats.filter(hat => hat.rarity === 'common');
    if (commonHats.length > 0) {
      const randomIndex = Math.floor(Math.random() * commonHats.length);
      return commonHats[randomIndex];
    }
    // If still no hat, return any hat (or null/undefined if allHats is empty)
    if (allHats.length > 0) {
      const randomIndex = Math.floor(Math.random() * allHats.length);
      return allHats[randomIndex];
    }
  }
  return null; // Should not happen if allHats is populated
};

// TODO: [Game Utils] Migrate RARITY_COLORS from original utils.js (web-client/public/games/metagame/js/utils.js)
// TODO: [Game Utils] Migrate other relevant utility functions from original utils.js 