import type { Bullet } from '@/entities/bullet'
import type { Vector3 } from '@/shared/types/common'
import { vector3Normalize } from '@/shared/lib/math/vector'
import { GAME_CONFIG } from '@/shared/config/constants'

export const createBullet = (
  position: Vector3,
  targetPosition: Vector3
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
    direction: normalized,
    speed: GAME_CONFIG.BULLET_SPEED,
    createdAt: Date.now(),
  }
}
