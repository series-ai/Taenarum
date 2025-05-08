# Mobile Bucket Hat Game Specification

## Overview
This is a simple HTML5 mobile game where a player wearing a bucket hat catches falling apples and avoids bombs. The game runs in pure HTML5 with no third-party libraries, prioritizing simplicity, speed, and mobile compatibility. The game lasts 30 seconds, with the player earning points by catching apples and losing points for catching bombs.

## Game Dimensions
- **Canvas Size**: Fixed at 400x600 pixels, designed for mobile portrait mode.
- **Scaling**: No stretching or scaling; the game uses a fixed resolution.

## Player Mechanics
- **Appearance**: The player is represented by a blue rectangle with a large bucket (hitbox) on top, centered by default.
- **Hitbox**: The bucket spans 30% of the screen width (120 pixels).
- **Controls**: 
  - Tap left half of screen to lean left.
  - Tap right half of screen to lean right.
  - Release or do nothing to return to center.
- **Movement**: Smooth leaning animation with a 0.5-second return to center (calibratable post-testing).
- **Cooldown**: Minor 0.2-second cooldown between taps to prevent rapid inputs.

## Falling Objects
- **Types**: Apples (green circles) and bombs (red circles), both 20x20 pixels.
- **Spawn Locations**: Objects fall from left, middle, or right lanes (no curves initially, stretch goal for future).
- **Spawn Rate**: Starts at one object every 2 seconds, gradually increases over time (e.g., 0.1-second reduction every 10 seconds).
- **Fall Speed**: Moderate, approximately 300 pixels/second (adjustable).
- **Distribution**: 70% apples, 30% bombs.
- **Limit**: Maximum of 5 objects on screen at once for performance.

## Scoring and Game Over
- **Scoring**: 10 points per caught apple.
- **Penalties**: Catching a bomb deducts 30 points and stuns the player for 1 second (immobile).
- **Game Duration**: 30 seconds (configurable via a variable), with no high scores or lives system.
- **End Condition**: Game ends when the timer reaches zero.

## Visuals and Assets
- **Player**: Blue rectangle (e.g., 50x100 pixels) with a bucket as a simple shape.
- **Apples**: Green circles (20x20 pixels).
- **Bombs**: Red circles (20x20 pixels).
- **Background**: Solid light blue (#ADD8E6).
- **Feedback**: No additional visual effects beyond position changes.

## Sound
- **Audio**: No sound effects or music to keep it simple.

## Performance and Timing
- **Frame Rate**: Target 30 FPS (or easiest achievable rate with a simple game loop).
- **Optimization**: Limit object count and use basic shapes for rendering.

## User Interface
- **Score Display**: White text in the top-left corner (e.g., "Score: 0").
- **Timer**: Display remaining time (e.g., "Time: 30") in top-right corner.
- **Screens**: No start screen, pause, or game-over screen—just a timer and end state.

## Stretch Goals
- Add curved or horizontal movement to falling objects.
- Replace shapes with sprite images for player, apples, and bombs.
- Implement basic visual feedback (e.g., flash on catch/miss).

## Notes
- Keep the implementation lightweight and focused on core mechanics.
- Test and adjust timings (e.g., fall speed, return-to-center delay) post-implementation.