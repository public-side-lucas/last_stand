import type { BulletCollisionAction } from '@/features/collision-detection/lib/processBulletCollisions'
import type { MortarExplosionAction } from '@/features/collision-detection/lib/processMortarExplosion'
import type { PlayerCollisionAction } from '@/features/collision-detection/lib/processPlayerCollision'
import { usePlayerStore } from '@/entities/player'
import { useMonsterStore } from '@/entities/monster'
import { useBulletStore } from '@/entities/bullet'
import { useExplosionStore } from '@/entities/explosion'
import { useGameStore } from '@/entities/game'
import { calculateKillScore } from '@/features/scoring'

type GameAction =
  | BulletCollisionAction
  | MortarExplosionAction
  | PlayerCollisionAction

/**
 * 게임 액션 실행기 (부수효과 담당)
 * SRP: 액션을 스토어에 적용하는 것만 담당
 * DIP: 액션 인터페이스에 의존
 */
export const executeGameActions = (actions: GameAction[]): void => {
  const playerStore = usePlayerStore.getState()
  const monsterStore = useMonsterStore.getState()
  const bulletStore = useBulletStore.getState()
  const explosionStore = useExplosionStore.getState()
  const gameStore = useGameStore.getState()

  actions.forEach((action) => {
    switch (action.type) {
      case 'DAMAGE_MONSTER':
        monsterStore.damageMonster(action.monsterId, action.damage)
        break

      case 'KNOCKBACK_MONSTER':
        monsterStore.updateMonsterVelocity(action.monsterId, action.velocity)
        break

      case 'KILL_MONSTER':
        monsterStore.removeMonster(action.monsterId)
        break

      case 'REMOVE_BULLET':
        bulletStore.removeBullet(action.bulletId)
        break

      case 'UPDATE_BULLET_HIT_LIST':
        const bullet = bulletStore.bullets.find(
          (b) => b.id === action.bulletId
        )
        if (bullet) {
          bulletStore.updateBullet(action.bulletId, {
            ...bullet,
            hitMonsters: [...bullet.hitMonsters, action.hitMonsterId],
          })
        }
        break

      case 'ADD_SCORE':
        gameStore.addScore(calculateKillScore())
        break

      case 'CREATE_EXPLOSION':
        explosionStore.addExplosion(action.explosion)
        break

      case 'DAMAGE_PLAYER':
        playerStore.damagePlayer(action.damage)
        break

      case 'KNOCKBACK_PLAYER':
        playerStore.updateVelocity(action.velocity)
        break

      case 'GAME_OVER':
        gameStore.setState('gameOver')
        break
    }
  })
}
