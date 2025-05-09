# Mobile Bucket Hat Game - Development Plan

## Phase 1: Core Setup & Player Mechanics
1.  **HTML Structure:**
    *   Create an `index.html` file.
    *   Add a `<canvas>` element with the fixed dimensions (400x600 pixels).
2.  **Basic Game Loop:**
    *   Set up a JavaScript file (e.g., `game.js`).
    *   Implement a simple game loop using `requestAnimationFrame` for rendering and updates, targeting ~30 FPS.
    *   Set the canvas background to light blue (`#ADD8E6`).
3.  **Player Rendering:**
    *   Represent the player as a blue rectangle with a "bucket" on top.
    *   Draw the player centered by default on the canvas.
4.  **Player Controls & Movement:**
    *   Implement tap controls:
        *   Detect taps on the left half of the screen to lean left.
        *   Detect taps on the right half of the screen to lean right.
        *   Player returns to the center when no tap is active or on release.
    *   Implement smooth leaning animation (0.5-second return to center, adjustable).
    *   Add a 0.2-second cooldown between taps.

## Phase 2: Falling Objects & Interactions
5.  **Falling Objects Rendering:**
    *   Create functions to draw apples (green circles) and bombs (red circles) of 20x20 pixels.
6.  **Object Spawning Logic:**
    *   Implement logic to spawn objects from three lanes (left, middle, right) at the top of the canvas.
    *   Start with one object every 2 seconds, gradually increasing the spawn rate.
    *   Ensure a 70% apple, 30% bomb distribution.
    *   Limit a maximum of 5 objects on screen at once.
7.  **Object Movement:**
    *   Make objects fall downwards at a moderate speed (approx. 300 pixels/second, adjustable).
8.  **Collision Detection:**
    *   Implement logic to detect when the player's bucket (hitbox: 120 pixels wide) collides with an apple or a bomb.

## Phase 3: Game Logic & UI
9.  **Scoring System:**
    *   Award 10 points for catching an apple.
    *   Remove the caught apple from the screen.
10. **Penalty System:**
    *   Deduct 30 points for catching a bomb.
    *   Implement a 1-second player stun (immobile) upon catching a bomb.
    *   Remove the caught bomb from the screen.
11. **Game Timer:**
    *   Implement a 30-second game timer (configurable).
    *   End the game when the timer reaches zero.
12. **User Interface (UI) Display:**
    *   Display the current score in the top-left corner (e.g., "Score: 0").
    *   Display the remaining time in the top-right corner (e.g., "Time: 30").

## Phase 4: Refinement & Testing
13. **Parameter Tuning:**
    *   Test and adjust game parameters like player movement speed, return-to-center delay, object fall speed, and spawn rates for optimal gameplay.
14. **Performance Checks:**
    *   Ensure the game runs smoothly, especially with the maximum number of objects on screen.
15. **Cross-Browser/Device Testing (Basic):**
    *   Since it's a simple HTML5 game, quick checks on a few mobile browsers would be good. 