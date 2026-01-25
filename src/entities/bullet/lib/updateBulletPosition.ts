import type { Bullet } from '../model/types'
import type { Vector3 } from '@/shared/types/common'
import { CAMERA_CONFIG, GAME_CONFIG } from '@/shared'

export const updateBulletPosition = (
  bullet: Bullet,
  deltaTime: number
): Vector3 => {
  if (bullet.type === 'MORTAR' && bullet.velocity) {
    // deltaTime은 밀리초 단위 (GameLogic에서 delta * 1000)
    const dt = deltaTime / 1000

    // 포물선 운동: 위치 업데이트
    const newPos = {
      x: bullet.position.x + bullet.velocity.x * dt,
      y: bullet.position.y + bullet.velocity.y * dt,
      z: bullet.position.z + bullet.velocity.z * dt,
    }

    // 중력에 의한 수직 속도 감소 (mutation - 성능상 이유)
    bullet.velocity.y -= GAME_CONFIG.GRAVITY * dt

    return newPos
  }

  const moveSpeed = bullet.speed * (deltaTime / 16)

  return {
    x: bullet.position.x + bullet.direction.x * moveSpeed,
    y: bullet.position.y + bullet.direction.y * moveSpeed,
    z: bullet.position.z + bullet.direction.z * moveSpeed,
  }
}
