# Fall Guys Racing Game - Development Plan

This plan outlines the steps to implement the Fall Guys-inspired racing game, prioritizing vanilla JavaScript, HTML5 Canvas, speed, and simplicity, and avoiding third-party libraries.

## Phase 1: Core Gameplay Foundation

*   **Objective:** Get a playable character moving on a screen with basic interactions.
*   **Tasks:**
    1.  **HTML & Canvas Setup:**
        *   Create the basic `index.html` file.
        *   Add a `<canvas>` element where the game will be rendered.
        *   Basic CSS for page layout (e.g., centering the canvas).
    2.  **Game Loop:**
        *   Implement the main game loop using `requestAnimationFrame` in a `script.js` file. This will be the heartbeat of our game, calling update and rendering functions continuously.
    3.  **Player Rendering:**
        *   Define the player object (position, size, color as per spec - e.g., a blue blob/square).
        *   Write a function to draw the player on the canvas.
    4.  **Virtual Joystick Implementation:**
        *   Visually render a joystick (a static outer circle and a movable inner circle) on the canvas in the bottom-right corner.
        *   Implement touch/mouse event listeners for the joystick:
            *   Detect when the user touches/clicks down on the joystick area.
            *   Track movement to update the inner circle's position and determine the movement direction and intensity.
            *   Handle touch/mouse release to reset the joystick.
    5.  **Player Movement:**
        *   Connect the joystick input to the player's movement. The player should move in the direction the joystick is tilted.
        *   Implement basic boundary checks to keep the player within the canvas for now.

## Phase 2: Level Design and Obstacles

*   **Objective:** Build the race track and introduce hazards.
*   **Tasks:**
    1.  **Level Rendering:**
        *   Define the level's dimensions (rectangular 2D plane).
        *   Draw the ground (solid color or simple texture as per spec).
        *   Draw the finish line at the top.
    2.  **Wall Implementation:**
        *   Define wall objects (rectangles with position and size).
        *   Render walls on the canvas (e.g., gray rectangles).
        *   Implement collision detection between the player and walls. The player should not be able to pass through walls.
    3.  **Pit Implementation:**
        *   Define pit objects (rectangles representing gaps).
        *   Render pits (e.g., black or dark gray rectangles).
        *   Implement collision detection between the player and pits. If the player enters a pit, trigger the lose condition.
    4.  **Level Boundaries:**
        *   Ensure the level is enclosed by walls (or invisible boundaries) to prevent the player from leaving the map, as specified.

## Phase 3: AI Opponents

*   **Objective:** Add AI racers to compete against the player.
*   **Tasks:**
    1.  **AI Rendering:**
        *   Define properties for AI opponents (10 of them, simple shapes with distinct colors).
        *   Render the AI characters on the canvas.
    2.  **AI Movement:**
        *   Implement AI movement towards the finish line. The spec mentions "pre-defined paths." For simplicity, we can start with AIs moving directly upwards.
        *   Assign slightly varied constant speeds to different AIs to create a sense of competition.
        *   Ensure AI also respects walls (either through path design or basic collision avoidance if paths are simple). The spec says paths avoid walls/pits, so path design is key.

## Phase 4: Game Logic and User Interface

*   **Objective:** Implement the rules of the game, win/lose conditions, and basic UI.
*   **Tasks:**
    1.  **Finish Line & Qualification:**
        *   Detect when the player and each AI cross the finish line.
        *   Keep track of the finishing order.
        *   Implement the qualification logic: top 50% of finishers qualify.
    2.  **Game Outcome:**
        *   If the player falls into a pit, trigger the "Lose" screen immediately.
        *   If the race ends, determine if the player qualified.
        *   Display a "Win" screen if qualified ("You Win! Top 50% Qualified").
        *   Display a "Lose" screen if not qualified or fell into a pit ("You Lose!").
    3.  **Screen Displays:**
        *   Create functions to render these simple "Win" and "Lose" screens directly on the canvas. These screens should include a button/text to "Proceed" (for win) or "Restart" (for lose).
    4.  **Game State Management:**
        *   Implement a simple state manager (e.g., `START_SCREEN`, `PLAYING`, `GAME_WIN`, `GAME_LOSE`).
        *   Control game updates and rendering based on the current state.
    5.  **Interactions on Win/Lose Screens:**
        *   Handle clicks/touches on the "Proceed" or "Restart" areas on the canvas to transition game states (e.g., restart the race). Since there's only one level, "Proceed" will effectively be like a restart for now or a placeholder.

## Phase 5: Polish and Technical Requirements

*   **Objective:** Address screen scaling and ensure the game meets technical specs.
*   **Tasks:**
    1.  **Screen Scaling:**
        *   Implement logic to scale the canvas to fit different mobile screen sizes while maintaining the specified aspect ratio (e.g., 360x640). This involves listening to window resize events and adjusting canvas dimensions and drawing scales.
    2.  **Performance:**
        *   Continuously profile and optimize drawing and logic to aim for 30 FPS on target devices. Since we're avoiding libraries, efficient direct canvas drawing is key.
    3.  **Testing:**
        *   Thoroughly test joystick responsiveness on touch devices.
        *   Verify collision detection is accurate.
        *   Test game logic across various scenarios.

## Alignment with Speed and Simplicity

*   **Vanilla JS & Canvas:** No overhead from external libraries. We control every piece of code.
*   **Phased Approach:** We build feature by feature, ensuring each part works before moving to the next.
*   **Simple Graphics & Physics:** The 2D art style and basic collision detection (rectangle-based) are inherently simple to implement.
*   **No Complex Systems:** The spec excludes health, rewards, complex AI, audio, etc., which simplifies development significantly. 