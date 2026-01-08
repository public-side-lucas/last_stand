import type { Monster } from '@/entities/monster'
import type { Player } from '@/entities/player'
import { vector3Distance } from '@/shared/lib/math/vector'

const COLLISION_DISTANCE = 1.0

export const checkPlayerCollision = (
  monsters: Monster[],
  player: Player | null
): Monster | null => {
  if (!player) return null

  for (const monster of monsters) {
    const distance = vector3Distance(player.position, monster.position)
    if (distance < COLLISION_DISTANCE) {
      return monster
    }
  }

  return null
}
