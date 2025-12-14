# CLAUDE.md

## Project Overview

**Last Stand** - A 3D shooting game built with React, Three.js, and Feature-Sliced Design architecture.

This is a browser-based action game where the player defends their position against waves of enemies using mouse-aimed shooting mechanics with intelligent target acquisition.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D rendering engine
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Tailwind CSS** - Styling

## Architecture: Feature-Sliced Design (FSD)

We follow FSD methodology for scalable, maintainable architecture. Each layer has specific responsibilities and import restrictions.
```
src/
├── app/                    # Application layer
│   ├── providers/         # React context providers
│   ├── styles/            # Global styles
│   └── App.tsx            # Root component
│
├── pages/                 # Page layer (route-based)
│   └── game/
│       └── GamePage.tsx
│
├── widgets/               # Widget layer (complex UI blocks)
│   ├── game-canvas/
│   │   ├── ui/
│   │   │   └── GameCanvas.tsx
│   │   ├── lib/
│   │   │   └── useGameLoop.ts
│   │   └── index.ts
│   │
│   ├── score-board/
│   │   ├── ui/
│   │   │   └── ScoreBoard.tsx
│   │   └── index.ts
│   │
│   └── game-over-screen/
│       ├── ui/
│       │   └── GameOverScreen.tsx
│       └── index.ts
│
├── features/              # Feature layer (user scenarios)
│   ├── shooting/
│   │   ├── model/
│   │   │   ├── types.ts
│   │   │   └── shooting.store.ts
│   │   ├── lib/
│   │   │   ├── createBullet.ts
│   │   │   ├── findNearestTarget.ts
│   │   │   └── calculateTrajectory.ts
│   │   └── index.ts
│   │
│   ├── monster-spawning/
│   │   ├── model/
│   │   │   └── spawner.store.ts
│   │   ├── lib/
│   │   │   ├── createMonster.ts
│   │   │   └── getSpawnPosition.ts
│   │   └── index.ts
│   │
│   ├── collision-detection/
│   │   ├── lib/
│   │   │   ├── checkBulletCollision.ts
│   │   │   └── checkPlayerCollision.ts
│   │   └── index.ts
│   │
│   └── scoring/
│       ├── model/
│       │   ├── types.ts
│       │   └── score.store.ts
│       └── index.ts
│
├── entities/              # Entity layer (business entities)
│   ├── player/
│   │   ├── model/
│   │   │   ├── types.ts
│   │   │   └── player.store.ts
│   │   ├── lib/
│   │   │   ├── createPlayer.ts
│   │   │   └── updatePlayerRotation.ts
│   │   └── index.ts
│   │
│   ├── monster/
│   │   ├── model/
│   │   │   ├── types.ts
│   │   │   └── monster.store.ts
│   │   ├── lib/
│   │   │   └── moveTowardsPlayer.ts
│   │   └── index.ts
│   │
│   ├── bullet/
│   │   ├── model/
│   │   │   └── types.ts
│   │   ├── lib/
│   │   │   └── updateBulletPosition.ts
│   │   └── index.ts
│   │
│   └── game/
│       ├── model/
│       │   ├── types.ts
│       │   └── game.store.ts
│       └── index.ts
│
└── shared/               # Shared layer (reusable code)
    ├── ui/              # UI components
    │   ├── Button/
    │   ├── Card/
    │   └── Text/
    │
    ├── lib/             # Utilities
    │   ├── three/
    │   │   ├── scene.ts
    │   │   ├── camera.ts
    │   │   └── lights.ts
    │   ├── math/
    │   │   ├── vector.ts
    │   │   └── distance.ts
    │   └── hooks/
    │       └── useAnimationFrame.ts
    │
    ├── config/          # Configuration
    │   ├── game.config.ts
    │   └── constants.ts
    │
    └── types/           # Global types
        └── common.ts
```

## Import Rules (Strictly Enforced)

### Layer Import Matrix
```
app       → pages, widgets, features, entities, shared
pages     → widgets, features, entities, shared
widgets   → features, entities, shared
features  → entities, shared
entities  → shared
shared    → nothing (isolated)
```

### ❌ Anti-Patterns (Never Do This)
```typescript
// ❌ Cross-feature imports
import { shooting } from '@/features/shooting'  // in features/monster-spawning

// ❌ Upward imports
import { GamePage } from '@/pages/game'  // in widgets/game-canvas

// ❌ Shared importing from upper layers
import { useGameStore } from '@/entities/game'  // in shared/lib
```

### ✅ Correct Patterns
```typescript
// ✅ Widget using features and entities
import { useShootingStore } from '@/features/shooting'
import { usePlayerStore } from '@/entities/player'

// ✅ Feature using entities and shared
import { Player } from '@/entities/player'
import { Vector3Utils } from '@/shared/lib/math'

// ✅ Shared lib composition
import { clamp } from '@/shared/lib/math/clamp'
import { lerp } from '@/shared/lib/math/lerp'
```

## Code Organization Guidelines

### 1. Slice Structure

Each slice (folder) follows this internal structure:
```
feature-name/
├── ui/              # React components (if needed)
├── model/           # State management, types
├── lib/             # Business logic, utilities
├── api/             # API calls (if needed)
└── index.ts         # Public API
```

**Only export through `index.ts`** - this is the public API of the slice.

### 2. Store Management (Zustand)
```typescript
// entities/player/model/player.store.ts
import { create } from 'zustand'
import { Player } from './types'

interface PlayerStore {
  player: Player | null
  setPlayer: (player: Player) => void
  updateRotation: (angle: number) => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  player: null,
  setPlayer: (player) => set({ player }),
  updateRotation: (angle) => set((state) => ({
    player: state.player 
      ? { ...state.player, rotation: angle }
      : null
  }))
}))

// entities/player/index.ts
export { usePlayerStore } from './model/player.store'
export type { Player } from './model/types'
export { createPlayer } from './lib/createPlayer'
```

### 3. Pure Functions in lib/

All business logic should be pure, testable functions:
```typescript
// features/shooting/lib/findNearestTarget.ts
import type { Monster } from '@/entities/monster'
import type { Vector3 } from '@/shared/types'
import { calculateAngleBetween } from '@/shared/lib/math'

interface FindTargetParams {
  playerPosition: Vector3
  playerDirection: Vector3
  monsters: Monster[]
  maxAngle?: number
}

export const findNearestTarget = ({
  playerPosition,
  playerDirection,
  monsters,
  maxAngle = Math.PI / 3
}: FindTargetParams): Monster | null => {
  let closestMonster: Monster | null = null
  let closestAngle = Infinity

  for (const monster of monsters) {
    const toMonster = {
      x: monster.position.x - playerPosition.x,
      y: 0,
      z: monster.position.z - playerPosition.z
    }

    const angle = calculateAngleBetween(playerDirection, toMonster)

    if (angle < maxAngle && angle < closestAngle) {
      closestAngle = angle
      closestMonster = monster
    }
  }

  return closestMonster
}
```

### 4. Component Composition
```typescript
// widgets/game-canvas/ui/GameCanvas.tsx
import { useEffect, useRef } from 'react'
import { useGameLoop } from '../lib/useGameLoop'
import { usePlayerStore } from '@/entities/player'
import { useMonsterStore } from '@/entities/monster'
import { initScene, initCamera, initRenderer } from '@/shared/lib/three'

export const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { player } = usePlayerStore()
  const { monsters } = useMonsterStore()
  
  const { scene, camera, renderer } = useGameLoop({
    containerRef,
    player,
    monsters
  })

  useEffect(() => {
    if (!containerRef.current) return

    const sceneInstance = initScene()
    const cameraInstance = initCamera()
    const rendererInstance = initRenderer()

    containerRef.current.appendChild(rendererInstance.domElement)

    return () => {
      containerRef.current?.removeChild(rendererInstance.domElement)
      rendererInstance.dispose()
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
```

### 5. Type Definitions
```typescript
// entities/monster/model/types.ts
import type { Vector3 } from '@/shared/types'

export interface Monster {
  id: string
  position: Vector3
  health: number
  speed: number
  mesh?: THREE.Mesh
}

export interface MonsterConfig {
  initialHealth: number
  baseSpeed: number
  spawnDistance: {
    min: number
    max: number
  }
}
```

## Naming Conventions

### Files and Folders
- **kebab-case** for all files and folders
- **PascalCase** only for React components: `GameCanvas.tsx`
- Use descriptive names: `findNearestTarget.ts`, not `find.ts`

### Functions and Variables
```typescript
// ✅ Good
export const findNearestTarget = () => {}
export const calculateBulletTrajectory = () => {}
const playerPosition = { x: 0, y: 0, z: 0 }

// ❌ Bad
export const find = () => {}
export const calc = () => {}
const pos = { x: 0, y: 0, z: 0 }
```

### Constants
```typescript
// shared/config/constants.ts
export const GAME_CONFIG = {
  PLAYER_SPAWN_POSITION: { x: 0, y: 0, z: 0 },
  BULLET_SPEED: 0.5,
  MONSTER_BASE_HEALTH: 3,
  AUTO_SHOOT_INTERVAL: 300,
  MAX_TARGET_ANGLE: Math.PI / 3
} as const
```

## State Management Strategy

### Global vs Local State

**Use Zustand for:**
- Game state (score, gameOver, isPaused)
- Player state
- Monster collection
- Bullet collection

**Use React useState for:**
- Component-specific UI state
- Animation states
- Temporary calculations
```typescript
// entities/game/model/game.store.ts
interface GameStore {
  score: number
  gameOver: boolean
  isPaused: boolean
  addScore: (points: number) => void
  setGameOver: (isOver: boolean) => void
  togglePause: () => void
  reset: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  score: 0,
  gameOver: false,
  isPaused: false,
  addScore: (points) => set((state) => ({ 
    score: state.score + points 
  })),
  setGameOver: (isOver) => set({ gameOver: isOver }),
  togglePause: () => set((state) => ({ 
    isPaused: !state.isPaused 
  })),
  reset: () => set({ 
    score: 0, 
    gameOver: false, 
    isPaused: false 
  })
}))
```

## Performance Best Practices

### 1. Memoization
```typescript
// widgets/game-canvas/lib/useGameLoop.ts
import { useMemo, useCallback } from 'react'

export const useGameLoop = () => {
  const updateBullets = useCallback((deltaTime: number) => {
    // Update logic
  }, [])

  const scene = useMemo(() => new THREE.Scene(), [])
  
  return { scene, updateBullets }
}
```

### 2. Object Pooling for Three.js
```typescript
// shared/lib/three/object-pool.ts
class BulletPool {
  private pool: THREE.Mesh[] = []
  
  acquire(): THREE.Mesh {
    return this.pool.pop() || this.create()
  }
  
  release(mesh: THREE.Mesh): void {
    this.pool.push(mesh)
  }
  
  private create(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.2)
    const material = new THREE.MeshStandardMaterial()
    return new THREE.Mesh(geometry, material)
  }
}
```

### 3. Avoid Unnecessary Re-renders
```typescript
// Use selectors for specific state slices
const score = useGameStore((state) => state.score)
// Instead of
const { score } = useGameStore()  // Re-renders on any state change
```

## Testing Strategy

### Unit Tests
```typescript
// features/shooting/lib/__tests__/findNearestTarget.test.ts
import { describe, it, expect } from 'vitest'
import { findNearestTarget } from '../findNearestTarget'

describe('findNearestTarget', () => {
  it('should return the closest monster within angle', () => {
    const result = findNearestTarget({
      playerPosition: { x: 0, y: 0, z: 0 },
      playerDirection: { x: 0, y: 0, z: 1 },
      monsters: [
        { id: '1', position: { x: 1, y: 0, z: 5 }, health: 3, speed: 0.02 },
        { id: '2', position: { x: 0, y: 0, z: 3 }, health: 3, speed: 0.02 }
      ]
    })

    expect(result?.id).toBe('2')
  })
})
```

## Development Workflow

### 1. Adding a New Feature
```bash
# Create feature structure
mkdir -p src/features/new-feature/{model,lib}
touch src/features/new-feature/index.ts
```

### 2. Creating Public API
```typescript
// Always export through index.ts
export { useNewFeatureStore } from './model/store'
export { newFeatureHelper } from './lib/helper'
export type { NewFeatureType } from './model/types'
```

### 3. Commit Convention
```
feat: add auto-targeting system
fix: correct bullet trajectory calculation
refactor: extract collision detection to separate feature
perf: implement object pooling for bullets
docs: update CLAUDE.md with new architecture
```

## Common Pitfalls to Avoid

1. **❌ Don't mix Three.js logic with React state**
    - Keep Three.js objects in refs
    - Use stores only for data, not mesh instances

2. **❌ Don't create objects in render**
```typescript
   // ❌ Bad
   const scene = new THREE.Scene()  // Re-created every render
   
   // ✅ Good
   const sceneRef = useRef(new THREE.Scene())
```

3. **❌ Don't bypass the public API**
```typescript
   // ❌ Bad
   import { internalHelper } from '@/features/shooting/lib/internal'
   
   // ✅ Good
   import { shootingHelper } from '@/features/shooting'
```

## Questions?

For architecture decisions, refer to:
- [Feature-Sliced Design Documentation](https://feature-sliced.design/)
- [Three.js Best Practices](https://threejs.org/docs/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

---

**Last Updated:** December 2024
**Maintained by:** Frontend Team