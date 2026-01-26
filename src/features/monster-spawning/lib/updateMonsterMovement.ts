import type { Monster } from '@/entities/monster'
import type { Vector3 } from '@/shared/types/common'
import type { MovementResult } from '@/features/game-loop/model/types'
import { moveTowardsPlayer } from '@/entities/monster'
import { GAME_CONFIG } from '@/shared/config/constants'

interface MonsterMovementUpdate {
  monsterId: string
  position: Vector3
  velocity: Vector3
}

/**
 * 모든 몬스터의 이동 계산 (순수 함수)
 * SRP: 몬스터 AI 이동만 담당
 */
export const calculateMonsterMovements = (
  monsters: Monster[],
  playerPosition: Vector3,
  deltaTime: number
): MonsterMovementUpdate[] => {
  return monsters.map((monster) => {
    // 속도 감쇠 (넉백 처리용)
    let velocity: Vector3 = {
      x: monster.velocity.x * GAME_CONFIG.MONSTER_VELOCITY_DAMPING,
      y: monster.velocity.y,
      z: monster.velocity.z * GAME_CONFIG.MONSTER_VELOCITY_DAMPING,
    }

    // 미세 속도 제거
    if (Math.abs(velocity.x) < 0.01) velocity.x = 0
    if (Math.abs(velocity.z) < 0.01) velocity.z = 0

    // 플레이어 방향으로 이동
    const targetPosition = moveTowardsPlayer(monster, playerPosition, deltaTime)

    // 넉백 속도 적용
    const position: Vector3 = {
      x: targetPosition.x + velocity.x,
      y: monster.position.y,
      z: targetPosition.z + velocity.z,
    }

    return {
      monsterId: monster.id,
      position,
      velocity,
    }
  })
}
