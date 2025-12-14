import type { Bullet } from '../model/types'
import type { Vector3 } from '@/shared/types/common'

export const updateBulletPosition = (bullet: Bullet, deltaTime: number): Vector3 => {
  const moveSpeed = bullet.speed * (deltaTime / 16)

  return {
    x: bullet.position.x + bullet.direction.x * moveSpeed,
    y: bullet.position.y + bullet.direction.y * moveSpeed,
    z: bullet.position.z + bullet.direction.z * moveSpeed,
  }
}
