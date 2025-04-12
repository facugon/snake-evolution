# Snake Game

A simple Snake game built with Phaser.js

## Project Structure

- `src/` - Source code
  - `game.js` - Main game code
  - `index.html` - HTML template
- `public/` - Static assets (images, sounds, etc.)
- `dist/` - Production build output (generated)

## Development

To run the development server:

```bash
npm install
npm start
```

The game will be available at http://localhost:8080

## Production Build

To build for production:

```bash
npm run build
```

This will generate the production files in the `dist/` directory.

## Notes

- The game is built using Phaser 3
- The webpack configuration handles both development and production builds
- The source code is in `src/game.js`

## Game Controls

- Use arrow keys to control the snake
- Eat the food to grow longer
- Avoid hitting the walls or yourself

## Project Structure

```
snake-game/
├── src/
│   └── game.js      # Main game logic
├── public/          # Assets directory
├── index.html       # Game entry point
└── package.json     # Project dependencies
``` 