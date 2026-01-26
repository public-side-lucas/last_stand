import type { Bullet } from '@/entities/bullet'
import type { Monster } from '@/entities/monster'
import type { Player } from '@/entities/player'
import type { Explosion } from '@/entities/explosion'
import type { Vector3 } from '@/shared/types/common'
import { checkGroundCollision, getMonstersInExplosionRange } from './checkExplosion'

// 폭발 관련 액션 타입들
export interface CreateExplosionAction {
  type: 'CREATE_EXPLOSION'
  explosion: Explosion
}

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

export interface AddScoreAction {
  type: 'ADD_SCORE'
}

export interface RemoveBulletAction {
  type: 'REMOVE_BULLET'
  bulletId: string
}

export interface DamagePlayerAction {
  type: 'DAMAGE_PLAYER'
  damage: number
}

export interface KnockbackPlayerAction {
  type: 'KNOCKBACK_PLAYER'
  velocity: Vector3
}

export interface GameOverAction {
  type: 'GAME_OVER'
}

export type MortarExplosionAction =
  | CreateExplosionAction
  | DamageMonsterAction
  | KnockbackMonsterAction
  | AddScoreAction
  | RemoveBulletAction
  | DamagePlayerAction
  | KnockbackPlayerAction
  | GameOverAction

interface ProcessMortarExplosionParams {
  bullet: Bullet
  monsters: Monster[]
  player: Player
  now: number
}

/**
 * 박격포 폭발 처리 (순수 함수)
 * SRP: 박격포 폭발 충돌 판정과 액션 생성만 담당
 */
export const processMortarExplosion = ({
  bullet,
  monsters,
  player,
  now,
}: ProcessMortarExplosionParams): MortarExplosionAction[] => {
  const actions: MortarExplosionAction[] = []

  // 지면 충돌 체크
  if (!checkGroundCollision(bullet.position)) {
    return actions
  }

  const explosionRadius = bullet.explosionRadius || 4
  const explosionPos = bullet.position

  // 폭발 이펙트 생성
  actions.push({
    type: 'CREATE_EXPLOSION',
    explosion: {
      id: `explosion-${now}-${Math.random()}`,
      position: { ...explosionPos },
      radius: explosionRadius,
      damage: bullet.damage,
      createdAt: now,
      duration: 500,
    },
  })

  // 범위 내 몬스터 처리
  const hitMonsters = getMonstersInExplosionRange(
    explosionPos,
    explosionRadius,
    monsters
  )

  hitMonsters.forEach((monster) => {
    const newHealth = monster.health - bullet.damage

    if (newHealth <= 0) {
      actions.push({ type: 'ADD_SCORE' })
    } else {
      // 넉백 계산
      const dx = monster.position.x - explosionPos.x
      const dz = monster.position.z - explosionPos.z
      const dist = Math.sqrt(dx * dx + dz * dz) || 1

      actions.push({
        type: 'KNOCKBACK_MONSTER',
        monsterId: monster.id,
        velocity: {
          x: monster.velocity.x + (dx / dist) * bullet.knockbackForce,
          y: 0,
          z: monster.velocity.z + (dz / dist) * bullet.knockbackForce,
        },
      })
    }

    actions.push({
      type: 'DAMAGE_MONSTER',
      monsterId: monster.id,
      damage: bullet.damage,
    })
  })

  // 플레이어 자폭 데미지 처리
  const playerDx = player.position.x - explosionPos.x
  const playerDz = player.position.z - explosionPos.z
  const playerDist = Math.sqrt(playerDx * playerDx + playerDz * playerDz)

  if (playerDist <= explosionRadius) {
    const selfDamage = Math.floor(bullet.damage / 2)
    const selfKnockback = bullet.knockbackForce * 0.5
    const dist = playerDist || 1

    actions.push({
      type: 'KNOCKBACK_PLAYER',
      velocity: {
        x: (playerDx / dist) * selfKnockback * 2,
        y: 0,
        z: (playerDz / dist) * selfKnockback * 2,
      },
    })

    if (selfDamage > 0) {
      actions.push({ type: 'DAMAGE_PLAYER', damage: selfDamage })

      if (player.health - selfDamage <= 0) {
        actions.push({ type: 'GAME_OVER' })
      }
    }
  }

  // 총알 제거
  actions.push({ type: 'REMOVE_BULLET', bulletId: bullet.id })

  return actions
}
