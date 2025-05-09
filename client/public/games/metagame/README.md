# Hairball Gacha Cat

A cute idle-style virtual pet game where you feed a cat to collect hats through a gacha system. Built with HTML5 and JavaScript.

## Features

- Tap to feed the cat with fish treats
- Watch cute animations as the cat eats
- Collect hats through the hairball gacha system
- Manage your hat collection
- Save game progress automatically
- Mobile-friendly design

## Setup

1. Clone this repository
2. Create an `assets` directory with the following structure:
   ```
   assets/
   ├── cat-idle.png
   ├── cat-eating.png
   ├── cat-coughing.png
   ├── fish-treat.png
   ├── hat-icon.png
   ├── hats/
   │   ├── crown.png
   │   ├── wizard.png
   │   ├── cowboy.png
   │   ├── beanie.png
   │   ├── party.png
   │   ├── santa.png
   │   ├── pirate.png
   │   └── crown_golden.png
   └── sounds/
       ├── eating.mp3
       ├── coughing.mp3
       ├── reveal_common.mp3
       ├── reveal_rare.mp3
       └── reveal_ultraRare.mp3
   ```
3. Open `index.html` in a modern web browser

## Game Mechanics

### Feeding
- Tap the cat to feed it a fish treat
- Each feeding increases the cat's fullness
- When fullness reaches the threshold, the cat coughs up a hairball

### Hairball Gacha
- Tap the hairball to open it
- Each hairball contains a random hat
- Hats come in three rarities:
  - Common (70% chance)
  - Rare (25% chance)
  - Ultra Rare (5% chance)

### Hat Collection
- View your hat collection by tapping the hat icon
- Filter hats by rarity
- Equip any unlocked hat on your cat

## Development

The game is built using vanilla JavaScript and HTML5 Canvas. The code is organized into several modules:

- `utils.js`: Utility functions and constants
- `animations.js`: Animation system for game effects
- `cat.js`: Cat behavior and rendering
- `hats.js`: Hat collection and management
- `game.js`: Main game logic and state management

## Browser Support

The game works best in modern browsers that support:
- HTML5 Canvas
- ES6+ JavaScript features
- Touch events
- LocalStorage

## License

MIT License - feel free to use and modify for your own projects! 