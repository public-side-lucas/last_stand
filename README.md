# Last Stand

A 3D browser-based shooting game built with React, Three.js, and Feature-Sliced Design architecture.

## Overview

Last Stand is an action-packed defense game where you must survive endless waves of enemies. The player stays in the center while enemies spawn around them. Using mouse-aimed shooting with intelligent target acquisition, you must defend your position and rack up the highest score possible.

## Features

- **3D Graphics**: Rendered with Three.js for smooth, immersive gameplay
- **Mouse-Aimed Shooting**: Player automatically rotates to face mouse cursor
- **Smart Targeting**: Bullets automatically aim at the nearest enemy within your field of view
- **Endless Waves**: Enemies continuously spawn and move towards the player
- **Score System**: Earn points for each enemy defeated
- **Clean Architecture**: Built with Feature-Sliced Design for maintainability and scalability

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D rendering engine
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Jest** - Testing framework

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd last_stand

# Install dependencies
npm install

# Start development server
npm start
```

The game will open in your browser at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## How to Play

1. **Start**: Click "Start Game" on the main menu
2. **Aim**: Move your mouse to rotate the player
3. **Shoot**: The game automatically shoots at the nearest enemy in your aim direction
4. **Survive**: Avoid letting enemies reach you
5. **Score**: Defeat enemies to increase your score

### Controls

- **Mouse Movement**: Aim/rotate player
- **Automatic Shooting**: Game fires automatically at nearby targets

## Project Structure

This project follows Feature-Sliced Design (FSD) architecture:

```
src/
├── app/                    # Application initialization
├── pages/                  # Route-based pages
│   └── game/              # Main game page
├── widgets/               # Complex UI components
│   ├── game-canvas/       # 3D game rendering
│   ├── score-board/       # Score display
│   └── game-over-screen/  # Game over UI
├── features/              # User-facing features
│   ├── shooting/          # Shooting mechanics
│   ├── monster-spawning/  # Enemy spawning logic
│   ├── collision-detection/ # Collision handling
│   └── scoring/           # Score calculation
├── entities/              # Business entities
│   ├── player/            # Player state & logic
│   ├── monster/           # Monster state & logic
│   ├── bullet/            # Bullet state & logic
│   └── game/              # Game state management
└── shared/                # Reusable utilities
    ├── ui/                # Shared UI components
    ├── lib/               # Utility functions
    │   ├── three/         # Three.js helpers
    │   ├── math/          # Math utilities
    │   └── hooks/         # React hooks
    ├── config/            # Configuration
    └── types/             # TypeScript types
```

### Layer Rules

- **app** → can import from pages, widgets, features, entities, shared
- **pages** → can import from widgets, features, entities, shared
- **widgets** → can import from features, entities, shared
- **features** → can import from entities, shared
- **entities** → can import from shared
- **shared** → cannot import from other layers

## Game Configuration

You can modify game parameters in `src/shared/config/constants.ts`:

```typescript
export const GAME_CONFIG = {
  PLAYER_SPAWN_POSITION: { x: 0, y: 0, z: 0 },
  BULLET_SPEED: 0.5,
  BULLET_LIFETIME: 3000,
  MONSTER_BASE_HEALTH: 3,
  MONSTER_BASE_SPEED: 0.02,
  AUTO_SHOOT_INTERVAL: 300,
  MAX_TARGET_ANGLE: Math.PI / 3,
  SPAWN_DISTANCE_MIN: 15,
  SPAWN_DISTANCE_MAX: 20,
  SPAWN_INTERVAL: 2000,
  POINTS_PER_KILL: 100,
}
```

## Development

### Code Style

This project uses ESLint and TypeScript for code quality:

```bash
# Run linter
npm run lint
```

### Testing

Unit tests are written with Jest:

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Adding New Features

Follow the FSD structure when adding features:

1. Define types in `entities/` or `features/`
2. Create business logic in feature `lib/` folders
3. Build UI components in `widgets/` or `pages/`
4. Export public API through `index.ts` files
5. Write tests in `__tests__/` folders

## Performance Optimization

- Object pooling for bullets and monsters (planned)
- Efficient collision detection
- Optimized render loop
- React component memoization

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

WebGL support required.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new features
5. Submit a pull request

## License

MIT

## Acknowledgments

- Three.js community
- React team
- Feature-Sliced Design methodology
- Zustand state management

## Roadmap

- [ ] Sound effects and music
- [ ] Power-ups and special abilities
- [ ] Different enemy types
- [ ] Boss battles
- [ ] Leaderboard system
- [ ] Mobile touch controls
- [ ] Difficulty progression
- [ ] Weapon upgrades

---

Built with passion by the Last Stand team.
