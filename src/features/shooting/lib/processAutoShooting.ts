import type { Player } from '@/entities/player'
import type { Bullet } from '@/entities/bullet'
import type { Vector3 } from '@/shared/types/common'
import { createBullet } from './createBullet'
import { PLAYER_CLASS_CONFIG } from '@/shared/config/constants'

interface AutoShootingParams {
  player: Player
  playerRotation: number
  isMoving: boolean
  now: number
  lastShootTime: number
}

interface AutoShootingResult {
  bullet: Bullet | null
  newLastShootTime: number
}

/**
 * 자동 사격 처리 (순수 함수)
 * SRP: 자동 사격 판정 및 총알 생성만 담당
 */
export const processAutoShooting = ({
  player,
  playerRotation,
  isMoving,
  now,
  lastShootTime,
}: AutoShootingParams): AutoShootingResult => {
  const classConfig = PLAYER_CLASS_CONFIG[player.playerClass]

  // 스나이퍼는 이동 중 사격 불가
  const canShoot = player.playerClass !== 'SNIPER' || !isMoving

  // 쿨다운 체크
  if (!canShoot || now - lastShootTime <= classConfig.AUTO_SHOOT_INTERVAL) {
    return { bullet: null, newLastShootTime: lastShootTime }
  }

  const direction: Vector3 = {
    x: Math.sin(playerRotation),
    y: 0,
    z: Math.cos(playerRotation),
  }

  const isMortar = player.playerClass === 'MORTAR'

  // 타겟 위치 계산
  const targetPosition: Vector3 = {
    x: player.position.x + direction.x * classConfig.BULLET_RANGE,
    y: isMortar ? 0 : player.position.y,
    z: player.position.z + direction.z * classConfig.BULLET_RANGE,
  }

  // 발사 위치 (박격포는 높이 보정)
  const spawnPosition: Vector3 = isMortar
    ? { ...player.position, y: player.position.y + 1.5 }
    : { ...player.position }

  const bullet = createBullet(spawnPosition, targetPosition, {
    speed: classConfig.BULLET_SPEED,
    damage: classConfig.BULLET_DAMAGE,
    knockbackForce: classConfig.BULLET_KNOCKBACK_FORCE,
    canPenetrate: classConfig.BULLET_PENETRATION,
    range: classConfig.BULLET_RANGE,
    type: isMortar ? 'MORTAR' : 'STANDARD',
    explosionRadius:
      'EXPLOSION_RADIUS' in classConfig
        ? (classConfig as { EXPLOSION_RADIUS: number }).EXPLOSION_RADIUS
        : undefined,
  })

  return { bullet, newLastShootTime: now }
}
