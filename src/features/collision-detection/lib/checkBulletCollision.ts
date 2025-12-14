import type { Bullet } from '@/entities/bullet'
import type { Monster } from '@/entities/monster'
import { vector3Distance } from '@/shared'

const COLLISION_DISTANCE = 1.0

export const checkBulletCollision = (
  bullet: Bullet,
  monsters: Monster[]
): Monster | null => {
  for (const monster of monsters) {
    const distance = vector3Distance(bullet.position, monster.position)
    if (distance < COLLISION_DISTANCE) {
      return monster
    }
  }
  return null
}
