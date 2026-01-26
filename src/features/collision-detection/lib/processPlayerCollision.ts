import type { Monster } from '@/entities/monster'
import type { Player } from '@/entities/player'
import type { Vector3 } from '@/shared/types/common'
import { checkPlayerCollision } from './checkPlayerCollision'
import { GAME_CONFIG } from '@/shared/config/constants'

// 플레이어 충돌 액션 타입들
export interface KnockbackPlayerAction {
  type: 'KNOCKBACK_PLAYER'
  velocity: Vector3
}

export interface DamagePlayerAction {
  type: 'DAMAGE_PLAYER'
  damage: number
}

export interface GameOverAction {
  type: 'GAME_OVER'
}

export interface UpdateLastDamageTimeAction {
  type: 'UPDATE_LAST_DAMAGE_TIME'
  time: number
}

export type PlayerCollisionAction =
  | KnockbackPlayerAction
  | DamagePlayerAction
  | GameOverAction
  | UpdateLastDamageTimeAction

interface ProcessPlayerCollisionParams {
  player: Player
  monsters: Monster[]
  now: number
  lastDamageTime: number
}

interface PlayerCollisionResult {
  actions: PlayerCollisionAction[]
  newLastDamageTime: number
}

/**
 * 플레이어-몬스터 충돌 처리 (순수 함수)
 * SRP: 플레이어 충돌 판정과 액션 생성만 담당
 */
export const processPlayerMonsterCollision = ({
  player,
  monsters,
  now,
  lastDamageTime,
}: ProcessPlayerCollisionParams): PlayerCollisionResult => {
  const actions: PlayerCollisionAction[] = []
  let newLastDamageTime = lastDamageTime

  const hitMonster = checkPlayerCollision(monsters, player)

  if (!hitMonster) {
    return { actions, newLastDamageTime }
  }

  // 넉백은 항상 적용 (무적 여부 무관)
  const dx = player.position.x - hitMonster.position.x
  const dz = player.position.z - hitMonster.position.z
  const distance = Math.sqrt(dx * dx + dz * dz)

  if (distance > 0) {
    actions.push({
      type: 'KNOCKBACK_PLAYER',
      velocity: {
        x: (dx / distance) * GAME_CONFIG.PLAYER_KNOCKBACK_FORCE,
        y: 0,
        z: (dz / distance) * GAME_CONFIG.PLAYER_KNOCKBACK_FORCE,
      },
    })
  }

  // 무적 시간 체크 후 데미지 적용
  if (now - lastDamageTime >= GAME_CONFIG.PLAYER_INVINCIBILITY_TIME) {
    actions.push({ type: 'DAMAGE_PLAYER', damage: hitMonster.damage })
    newLastDamageTime = now

    if (player.health - hitMonster.damage <= 0) {
      actions.push({ type: 'GAME_OVER' })
    }
  }

  return { actions, newLastDamageTime }
}
