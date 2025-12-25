import { useCallback } from 'react'
import * as THREE from 'three'
import { useBulletStore } from '@/entities/bullet'
import { useMonsterStore } from '@/entities/monster'
import { useGameStore } from '@/entities/game'
import { updateBulletPosition } from '@/entities/bullet'
import { checkBulletCollision } from '@/features/collision-detection'
import { calculateKillScore } from '@/features/scoring'
import { GAME_CONFIG } from '@/shared/config/constants'

interface UseBulletSystemParams {
  sceneRef: React.MutableRefObject<THREE.Scene | undefined>
}

export const useBulletSystem = ({ sceneRef }: UseBulletSystemParams) => {
  const { removeBullet, updateBulletPosition: updateStoreBulletPosition } = useBulletStore()
  const { damageMonster } = useMonsterStore()
  const { addScore } = useGameStore()

  const updateBullets = useCallback((deltaTime: number, now: number) => {
    const currentBullets = useBulletStore.getState().bullets
    const currentMonsters = useMonsterStore.getState().monsters

    currentBullets.forEach((bullet) => {
      // Update bullet position
      const newPosition = updateBulletPosition(bullet, deltaTime)
      updateStoreBulletPosition(bullet.id, newPosition)

      if (bullet.mesh) {
        bullet.mesh.position.set(newPosition.x, newPosition.y, newPosition.z)
      }

      // Check collision with monsters
      const hitMonster = checkBulletCollision(bullet, currentMonsters)
      if (hitMonster) {
        damageMonster(hitMonster.id, 1)
        removeBullet(bullet.id)

        if (bullet.mesh && sceneRef.current) {
          sceneRef.current.remove(bullet.mesh)
        }

        if (hitMonster.health <= 1) {
          addScore(calculateKillScore())
          if (hitMonster.mesh && sceneRef.current) {
            sceneRef.current.remove(hitMonster.mesh)
          }
        }
        return
      }

      // Remove bullets that exceeded lifetime
      if (now - bullet.createdAt > GAME_CONFIG.BULLET_LIFETIME) {
        removeBullet(bullet.id)
        if (bullet.mesh && sceneRef.current) {
          sceneRef.current.remove(bullet.mesh)
        }
      }
    })
  }, [sceneRef, removeBullet, updateStoreBulletPosition, damageMonster, addScore])

  return { updateBullets }
}
