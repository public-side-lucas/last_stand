import type { Player, PlayerClass } from '../model/types'
import { GAME_CONFIG, PLAYER_CLASS_CONFIG } from '@/shared/config/constants'

export const createPlayer = (playerClass: PlayerClass = 'ASSAULT'): Player => {
  const classConfig = PLAYER_CLASS_CONFIG[playerClass]

  return {
    id: 'player',
    position: { ...GAME_CONFIG.PLAYER_SPAWN_POSITION },
    rotation: 0,
    health: classConfig.MAX_HEALTH,
    maxHealth: classConfig.MAX_HEALTH,
    velocity: { x: 0, y: 0, z: 0 },
    playerClass,
  }
}
