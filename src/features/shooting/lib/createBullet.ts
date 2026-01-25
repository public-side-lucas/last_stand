import type { Bullet } from '@/entities/bullet'
import type { Vector3 } from '@/shared/types/common'
import { vector3Normalize } from '@/shared/lib/math/vector'
import type { BulletType } from '@/entities/bullet/model/types.ts'
import { GAME_CONFIG } from '@/shared'

interface CreateBulletOptions {
  type?: BulletType
  speed: number
  damage: number
  knockbackForce: number
  canPenetrate: boolean
  range: number
  explosionRadius?: number
}

export const createBullet = (
  position: Vector3,
  targetPosition: Vector3,
  options: CreateBulletOptions
): Bullet => {
  const isMortar = options.type === 'MORTAR'

  let velocity: Vector3 | undefined
  let direction = {
    x: targetPosition.x - position.x,
    y: targetPosition.y - position.y,
    z: targetPosition.z - position.z,
  }

  if (isMortar) {
    // 수평 거리 계산
    const dx = targetPosition.x - position.x
    const dz = targetPosition.z - position.z
    const horizontalDistance = Math.sqrt(dx * dx + dz * dz)

    // 비행 시간 계산 (거리 기반으로 조정)
    const flightTime = Math.max(
      GAME_CONFIG.MORTAR_FLIGHT_TIME,
      horizontalDistance / 10
    )

    // 수평 속도 = 거리 / 시간
    const velocityX = dx / flightTime
    const velocityZ = dz / flightTime

    // 수직 속도 계산 (포물선 운동)
    // y(t) = y0 + vy*t - 0.5*g*t^2
    // 착지 조건: 0 = y0 + vy*t - 0.5*g*t^2
    // vy = (0.5*g*t^2 - y0) / t = 0.5*g*t - y0/t
    const startHeight = position.y
    const velocityY =
      0.5 * GAME_CONFIG.GRAVITY * flightTime - startHeight / flightTime

    velocity = { x: velocityX, y: velocityY, z: velocityZ }

    // 방향 벡터는 속도 벡터의 정규화 (시각적 용도)
    direction = velocity
  }

  const normalized = vector3Normalize(direction)

  return {
    id: `bullet-${Date.now()}-${Math.random()}`,
    type: options.type || 'STANDARD',
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
    velocity: velocity,
    explosionRadius: options.explosionRadius,
  }
}
