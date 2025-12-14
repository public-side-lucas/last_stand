import type { Vector3 } from '@/shared/types/common'
import { GAME_CONFIG } from '@/shared/config/constants'

export const getSpawnPosition = (): Vector3 => {
  const angle = Math.random() * Math.PI * 2
  const distance =
    GAME_CONFIG.SPAWN_DISTANCE_MIN +
    Math.random() * (GAME_CONFIG.SPAWN_DISTANCE_MAX - GAME_CONFIG.SPAWN_DISTANCE_MIN)

  return {
    x: Math.cos(angle) * distance,
    y: 0,
    z: Math.sin(angle) * distance,
  }
}
