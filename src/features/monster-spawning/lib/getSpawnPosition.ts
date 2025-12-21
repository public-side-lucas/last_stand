import type { Vector3 } from '@/shared/types/common'
import { GAME_CONFIG } from '@/shared/config/constants'
import {usePlayerStore} from "@/entities/player";

export const getSpawnPosition = (): Vector3 => {
    const playerPosition = usePlayerStore.getState().player?.position ?? { x: 0, y: 0, z: 0 }

  const angle = Math.random() * Math.PI * 2
  const distance =
    GAME_CONFIG.SPAWN_DISTANCE_MIN +
    Math.random() * (GAME_CONFIG.SPAWN_DISTANCE_MAX - GAME_CONFIG.SPAWN_DISTANCE_MIN)

  return {
    x: playerPosition.x + Math.cos(angle) * distance,
    y: 0,
    z: playerPosition.z + Math.sin(angle) * distance,
  }
}
