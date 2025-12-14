import type { Monster } from '../model/types'
import type { Vector3 } from '@/shared/types/common'
import { vector3Normalize } from '@/shared/lib/math/vector'

export const moveTowardsPlayer = (
  monster: Monster,
  playerPosition: Vector3,
  deltaTime: number
): Vector3 => {
  const direction = {
    x: playerPosition.x - monster.position.x,
    y: playerPosition.y - monster.position.y,
    z: playerPosition.z - monster.position.z,
  }

  const normalized = vector3Normalize(direction)
  const moveSpeed = monster.speed * (deltaTime / 16)

  return {
    x: monster.position.x + normalized.x * moveSpeed,
    y: monster.position.y + normalized.y * moveSpeed,
    z: monster.position.z + normalized.z * moveSpeed,
  }
}
