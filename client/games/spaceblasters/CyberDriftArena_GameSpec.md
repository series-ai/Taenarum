# Cyber Drift Arena – Game Spec

## Platform
- **HTML5** (no external libraries)
- **Mobile-first design**, portrait orientation

---

## Game Overview
**Cyber Drift Arena** is a minimalist 2D cyberpunk survival shooter. Players float in zero gravity with smooth, slow motion and limited laser ammo. They must eliminate AI enemies while collecting power-ups for ammo and shields. The last entity alive wins.

---

## Core Gameplay

### Player Controls
- **Movement** (slow and smooth):
  - Virtual buttons (Up, Down, Left, Right)
  - Tapping applies small acceleration (zero-gravity drift)
  - Momentum carries movement; gradual deceleration when not thrusting

- **Laser Fire**:
  - Fire button launches a laser in the current facing direction
  - **Max 2 lasers** per life
  - Ammo is replenished through power-ups

### Combat Mechanics
- **Lasers**:
  - Neon beams with short life span
  - One-hit kill
  - Limited to 2 shots unless replenished

- **Ammo Limit**:
  - Players start with 2 lasers
  - Must collect ammo power-ups for more

- **Shield Power-up**:
  - Grants a protective shield that blocks one hit
  - Displays as a glowing energy ring around the player
  - Shield is removed after absorbing damage
  - Only one active shield allowed

---

## Power-ups

### 1. Ammo Power-up
- Floating neon orb
- Grants +2 lasers
- Can be picked up by touch/contact

### 2. Shield Power-up
- Distinct glowing orb (e.g. cyan)
- Grants a one-time shield
- Shield appears visually around player

---

## Enemies (AI)
- Follow same physics as player
- Move randomly or track the player
- Shoot when in line of sight
- Have limited ammo and collect power-ups

---

## Win Condition
- Game ends when only one entity (player or AI) remains
- Shows `You Win` or `Game Over` message
- Game restarts after short delay

---

## Visual Style & UI

### Cyberpunk Theme
- **Players & AI**: Neon glowing rings with directional triangle
- **Laser**: Sleek neon beam (e.g., pink, green)
- **Shield**: Pulsing neon ring (cyan or purple)
- **Background**: Dark, starfield with glitch and circuit effects

### UI Layout (Mobile - Portrait)
- **Top HUD**:
  - `Laser: X/2`
  - `Shield: ON/OFF`
  - Enemy count

- **Main Area**:
  - Game canvas

- **Bottom Controls**:
  - Left: Directional boosters (Up, Down, Left, Right)
  - Right: Fire button

---

## Sound (Optional)
- Thruster: low futuristic hum
- Laser: synth zap
- Shield: idle buzz, fizz when hit
- Background: slow ambient synth loop

---

## Technical Notes
- Uses HTML `<canvas>` for rendering
- No third-party libraries
- Pure JavaScript for:
  - Game loop (`requestAnimationFrame`)
  - Touch input
  - Movement & inertia physics:
    ```js
    velocity += acceleration * delta;
    velocity *= 0.98; // smooth drag
    ```
- All visuals drawn via canvas (no image files)

---

## Summary
**Cyber Drift Arena** is a stylish, minimalist mobile-friendly shooter with slow, floaty movement and strategic limitations. The use of ammo and shields creates meaningful decisions in a fast but deliberate combat arena.