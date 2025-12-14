import type { Player } from '../model/types'
import { GAME_CONFIG } from '@/shared/config/constants'

export const createPlayer = (): Player => {
  return {
    id: 'player',
    position: { ...GAME_CONFIG.PLAYER_SPAWN_POSITION },
    rotation: 0,
  }
}
