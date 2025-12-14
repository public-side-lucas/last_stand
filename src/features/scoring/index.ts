import { GAME_CONFIG } from '@/shared'

export const calculateKillScore = (): number => {
  return GAME_CONFIG.POINTS_PER_KILL
}
