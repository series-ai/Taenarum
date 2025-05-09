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

export function createParticle(x, y, color, size = 5) {
  return {
    x,
    y,
    color,
    size,
    velocity: {
      x: (Math.random() - 0.5) * 5,
      y: (Math.random() - 0.5) * 5
    },
    life: 1.0
  };
}

export function updateParticles(particles) {
  return particles.filter(particle => {
    particle.x += particle.velocity.x;
    particle.y += particle.velocity.y;
    particle.life -= 0.02;
    return particle.life > 0;
  });
}

export function drawParticles(ctx, particles) {
  particles.forEach(particle => {
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// Animation easing functions
export const Easing = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  bounce: t => {
    if (t < (1 / 2.75)) {
      return 7.5625 * t * t;
    } else if (t < (2 / 2.75)) {
      return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
    } else if (t < (2.5 / 2.75)) {
      return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
    } else {
      return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
    }
  }
};

// TODO: [Game Utils] Migrate RARITY_COLORS from original utils.js (web-client/public/games/metagame/js/utils.js)
// TODO: [Game Utils] Migrate other relevant utility functions from original utils.js 