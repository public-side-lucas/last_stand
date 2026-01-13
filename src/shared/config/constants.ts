// Player class configurations
export const PLAYER_CLASS_CONFIG = {
  ASSAULT: {
    MAX_HEALTH: 10,
    MOVE_SPEED: 0.03,
    MAX_VELOCITY: 0.2,
    BULLET_SPEED: 0.5,
    BULLET_DAMAGE: 1,
    BULLET_KNOCKBACK_FORCE: 0.1,
    BULLET_PENETRATION: false,
    BULLET_RANGE: 20, // Assault rifle short range
    AUTO_SHOOT_INTERVAL: 50,
    VISION_RANGE_CLEAR: 15, // Clear vision distance
    VISION_RANGE_FADE: 25, // Start fading distance
    VISION_RANGE_MAX: 30,  // Completely invisible distance
  },
  SNIPER: {
    MAX_HEALTH: 7,
    MOVE_SPEED: 0.015,
    MAX_VELOCITY: 0.15,
    BULLET_SPEED: 1.2,
    BULLET_DAMAGE: 2,
    BULLET_KNOCKBACK_FORCE: 0.5,
    BULLET_PENETRATION: true,
    BULLET_RANGE: 40, // Sniper long range
    AUTO_SHOOT_INTERVAL: 800,
    VISION_RANGE_CLEAR: 25, // Clear vision distance (wider than assault)
    VISION_RANGE_FADE: 40, // Start fading distance
    VISION_RANGE_MAX: 50,  // Completely invisible distance
  },
} as const

export const GAME_CONFIG = {
  PLAYER_SPAWN_POSITION: { x: 0, y: 0, z: 0 },
  PLAYER_MAX_HEALTH: 10,
  PLAYER_INVINCIBILITY_TIME: 800,
  PLAYER_KNOCKBACK_FORCE: 4.0,
  PLAYER_VELOCITY_DAMPING: 0.9,
  BULLET_LIFETIME: 3000,
  MONSTER_BASE_HEALTH: 3,
  MONSTER_BASE_DAMAGE: 1,
  MONSTER_BASE_SPEED: 0.02,
  MONSTER_VELOCITY_DAMPING: 0.9,
  MAX_TARGET_ANGLE: Math.PI / 3,
  SPAWN_DISTANCE_MIN: 15,
  SPAWN_DISTANCE_MAX: 20,
  SPAWN_INTERVAL: 200,
  POINTS_PER_KILL: 100,
  MOVE_KEYS: ['KeyW', 'KeyA', 'KeyS', 'KeyD'],
} as const

export const CAMERA_CONFIG = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: { x: 0, y: 15, z: 15 },
  LOOK_AT: { x: 0, y: 0, z: 0 },
} as const

export const COLORS = {
  PLAYER: 0x00ff00,
  MONSTER: 0xff0000,
  BULLET: 0xffff00,
  GROUND: 0x808080,
} as const

