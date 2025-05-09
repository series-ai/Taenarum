# Game Design Specification: Fall Guys Racing Game

## 1. Overview
This is a top-down mobile HTML5 racing game inspired by Fall Guys, with a simple 2D art style similar to Archero. The player races against AI opponents to reach the finish line first. The game focuses on simplicity, with no health system, rewards, or audio.

## 2. Core Mechanics
- **Objective:** The player must reach the finish line before as many AI opponents as possible to qualify for the next round.
- **Qualification:** The top 50% of finishers (including the player and AI) qualify for the next round. For example, with 10 AI players (11 total racers), the top 6 qualify.
- **Game Outcome:** 
  - If the player qualifies (finishes in the top 50%), they see a "Win" screen and proceed to the next round.
  - If the player does not qualify, they see a "Lose" screen and the game ends.
  - If the player falls into a pit, they immediately lose and see a "Lose" screen.

## 3. Controls and Movement
- **Controls:** The player uses a virtual joystick to move their character. The joystick is a circular control on the bottom-right of the screen.
- **Movement:** The player moves in the direction the joystick is tilted. No additional abilities (e.g., dash, jump) are included.
- **No Attacks:** The player cannot attack or interact with AI players beyond racing.

## 4. Level Design
- **Structure:** The game has a single level for now, consisting of one race to the finish line.
- **Level Layout:** 
  - The level is a rectangular 2D plane with a start point at the bottom and a finish line at the top.
  - The level contains simple hazards:
    - **Walls:** Impassable rectangular obstacles that block the player’s path.
    - **Pits:** Gaps in the ground. If the player falls into a pit, they lose the race instantly.
  - The finish line is a visible horizontal line at the top of the level.
- **Level Count:** 1 level for now, with potential for more in future iterations.

## 5. AI Players
- **Number of AI Players:** 10 AI opponents race alongside the player (11 total racers, including the player).
- **AI Behavior:** AI players move toward the finish line along pre-defined paths, avoiding walls and pits. They do not interact with the player or each other beyond racing.
- **AI Movement:** AI players move at a constant speed, slightly varied between AIs to create natural competition (e.g., some AIs are faster, some slower).

## 6. Art Style and Visuals
- **Art Style:** Simple 2D top-down sprites, similar to Archero’s minimalist aesthetic.
- **Characters:** 
  - The player and AI characters are represented as simple blobs or squares with distinct colors (e.g., player is blue, AIs are red, green, etc.).
  - No animations; characters simply move across the screen.
- **Level Visuals:**
  - The ground is a solid color or simple tiled texture (e.g., light blue or green).
  - Walls are gray rectangles.
  - Pits are black or dark gray rectangles to indicate a gap.
  - The finish line is a bright yellow or green horizontal line.
- **Screens:**
  - **Win Screen:** A simple screen with the text "You Win! Top 50% Qualified" and a button to proceed to the next round.
  - **Lose Screen:** A simple screen with the text "You Lose!" and a button to restart the game.

## 7. Audio and Feedback
- **Audio:** No sound effects or background music.
- **Haptic Feedback:** None.

## 8. Technical Requirements
- **Platform:** HTML5 game playable in a mobile browser.
- **Screen Resolution:** Designed for a standard mobile resolution (e.g., 360x640 pixels, a common aspect ratio for mobile devices). The game should scale to fit different screen sizes while maintaining the aspect ratio.
- **Performance:** Target 30 FPS on mid-range mobile devices.
- **Libraries/Frameworks:** Use a lightweight HTML5 game framework like Phaser.js for 2D rendering and physics (e.g., for collision detection with walls and pits).

## 9. Monetization and Additional Features
- **Monetization:** None. No in-app purchases, ads, or currency systems.
- **Additional Features:** None. No daily challenges, leaderboards, or events.

## 10. Edge Cases and Polish
- **Falling into Pits:** If the player falls into a pit, the game ends immediately, and the "Lose" screen is displayed.
- **Boundaries:** The level is surrounded by walls to prevent the player from leaving the map.
- **Tutorial:** None. The game is simple enough to understand without a tutorial.
- **Interruptions:** If the game is interrupted (e.g., phone call), the game pauses automatically, and the player can resume.

## 11. Development Notes
- **Focus on Simplicity:** The game should be a minimal viable product with basic racing mechanics, hazards, and AI opponents.
- **Future Expansion:** The design allows for easy addition of more levels, hazards, rewards, or abilities in future iterations.
- **Testing:** Ensure collision detection works accurately for walls and pits, and that the virtual joystick is responsive on touch devices.