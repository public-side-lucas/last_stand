import type { Bullet } from '@/entities/bullet'
import type { Vector3 } from '@/shared/types/common'
import { vector3Normalize } from '@/shared/lib/math/vector'

interface CreateBulletOptions {
  speed: number
  damage: number
  knockbackForce: number
  canPenetrate: boolean
  range: number
}

export const createBullet = (
  position: Vector3,
  targetPosition: Vector3,
  options: CreateBulletOptions
): Bullet => {
  const direction = {
    x: targetPosition.x - position.x,
    y: targetPosition.y - position.y,
    z: targetPosition.z - position.z,
  }

  const normalized = vector3Normalize(direction)

  return {
    id: `bullet-${Date.now()}-${Math.random()}`,
    position: { ...position },
    spawnPosition: { ...position },
    direction: normalized,
    speed: options.speed,
    damage: options.damage,
    knockbackForce: options.knockbackForce,
    canPenetrate: options.canPenetrate,
    range: options.range,
    hitMonsters: [],
    createdAt: Date.now(),
  }
}
