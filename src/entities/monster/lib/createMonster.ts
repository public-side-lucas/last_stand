import type { Monster } from '../model/types'
import { GAME_CONFIG } from '@/shared/config/constants'

export const createMonster = (position: { x: number; y: number; z: number }): Monster => {
  return {
    id: `monster-${Date.now()}-${Math.random()}`,
    position,
    health: GAME_CONFIG.MONSTER_BASE_HEALTH,
    speed: GAME_CONFIG.MONSTER_BASE_SPEED,
  }
}
