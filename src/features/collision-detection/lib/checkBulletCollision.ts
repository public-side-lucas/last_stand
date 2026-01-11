import type { Bullet } from '@/entities/bullet'
import type { Monster } from '@/entities/monster'
import { vector3Distance } from '@/shared'

// Smaller collision distance for bullets (more precise)
const BULLET_COLLISION_DISTANCE = 0.6

export const checkBulletCollision = (
  bullet: Bullet,
  monsters: Monster[]
): Monster | null => {
  for (const monster of monsters) {
    const distance = vector3Distance(bullet.position, monster.position)
    if (distance < BULLET_COLLISION_DISTANCE) {
      return monster
    }
  }
  return null
}
