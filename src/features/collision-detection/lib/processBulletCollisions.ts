import type { Bullet } from '@/entities/bullet'
import type { Monster } from '@/entities/monster'
import type { Vector3 } from '@/shared/types/common'
import { checkBulletCollision } from './checkBulletCollision'
import { GAME_CONFIG } from '@/shared/config/constants'

// 충돌 결과 액션 타입들
export interface DamageMonsterAction {
  type: 'DAMAGE_MONSTER'
  monsterId: string
  damage: number
}

export interface KnockbackMonsterAction {
  type: 'KNOCKBACK_MONSTER'
  monsterId: string
  velocity: Vector3
}

export interface KillMonsterAction {
  type: 'KILL_MONSTER'
  monsterId: string
}

export interface RemoveBulletAction {
  type: 'REMOVE_BULLET'
  bulletId: string
}

export interface UpdateBulletHitListAction {
  type: 'UPDATE_BULLET_HIT_LIST'
  bulletId: string
  hitMonsterId: string
}

export interface AddScoreAction {
  type: 'ADD_SCORE'
}

export type BulletCollisionAction =
  | DamageMonsterAction
  | KnockbackMonsterAction
  | KillMonsterAction
  | RemoveBulletAction
  | UpdateBulletHitListAction
  | AddScoreAction

interface ProcessStandardBulletParams {
  bullet: Bullet
  monsters: Monster[]
  now: number
}

/**
 * 일반 총알 충돌 처리 (순수 함수)
 * SRP: 일반 총알의 충돌 판정과 액션 생성만 담당
 * OCP: 새 액션 타입 추가로 확장 가능
 */
export const processStandardBulletCollision = ({
  bullet,
  monsters,
  now,
}: ProcessStandardBulletParams): BulletCollisionAction[] => {
  const actions: BulletCollisionAction[] = []

  const hitMonster = checkBulletCollision(bullet, monsters)

  if (hitMonster) {
    // 이미 맞은 몬스터 스킵 (관통탄용)
    if (bullet.hitMonsters.includes(hitMonster.id)) {
      return actions
    }

    const newHealth = hitMonster.health - bullet.damage

    // 관통탄 처리
    if (bullet.canPenetrate) {
      actions.push({
        type: 'UPDATE_BULLET_HIT_LIST',
        bulletId: bullet.id,
        hitMonsterId: hitMonster.id,
      })
    } else {
      actions.push({ type: 'REMOVE_BULLET', bulletId: bullet.id })
    }

    // 데미지 적용
    actions.push({
      type: 'DAMAGE_MONSTER',
      monsterId: hitMonster.id,
      damage: bullet.damage,
    })

    // 넉백 적용
    actions.push({
      type: 'KNOCKBACK_MONSTER',
      monsterId: hitMonster.id,
      velocity: {
        x: hitMonster.velocity.x + bullet.direction.x * bullet.knockbackForce,
        y: 0,
        z: hitMonster.velocity.z + bullet.direction.z * bullet.knockbackForce,
      },
    })

    // 처치 시 점수 및 제거
    if (newHealth <= 0) {
      actions.push({ type: 'ADD_SCORE' })
      actions.push({ type: 'KILL_MONSTER', monsterId: hitMonster.id })
    }
  }

  // 사거리 초과 체크
  const travelDistance = Math.sqrt(
    Math.pow(bullet.position.x - bullet.spawnPosition.x, 2) +
      Math.pow(bullet.position.z - bullet.spawnPosition.z, 2)
  )

  if (travelDistance > bullet.range) {
    actions.push({ type: 'REMOVE_BULLET', bulletId: bullet.id })
  }

  // 수명 초과 체크
  if (now - bullet.createdAt > GAME_CONFIG.BULLET_LIFETIME) {
    actions.push({ type: 'REMOVE_BULLET', bulletId: bullet.id })
  }

  return actions
}
