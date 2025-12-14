import type { Monster } from '@/entities/monster'
import type { Vector3 } from '@/shared/types/common'
import { vector3Distance } from '@/shared/lib/math/vector'

const COLLISION_DISTANCE = 1.5

export const checkPlayerCollision = (
  playerPosition: Vector3,
  monsters: Monster[]
): boolean => {
  for (const monster of monsters) {
    const distance = vector3Distance(playerPosition, monster.position)
    if (distance < COLLISION_DISTANCE) {
      return true
    }
  }
  return false
}
