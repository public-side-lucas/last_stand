import { useCallback } from 'react'
import { usePlayerStore } from '@/entities/player'
import { useMonsterStore } from '@/entities/monster'
import { moveTowardsPlayer } from '@/entities/monster'
import { HEALTH_BAR_WIDTH } from '@/shared/lib/three'

export const useMonsterMovement = () => {
  const { updateMonsterPosition } = useMonsterStore()

  const updateMonsters = useCallback((deltaTime: number) => {
    const currentPlayer = usePlayerStore.getState().player
    const currentMonsters = useMonsterStore.getState().monsters

    if (!currentPlayer) return

    currentMonsters.forEach((monster) => {
      const newPosition = moveTowardsPlayer(monster, currentPlayer.position, deltaTime)
      updateMonsterPosition(monster.id, newPosition)

      if (monster.mesh) {
        monster.mesh.position.set(newPosition.x, newPosition.y, newPosition.z)
      }

      // Update health bar position (centered above monster)
      const healthBarY = newPosition.y + 1
      const healthBarX = newPosition.x - HEALTH_BAR_WIDTH / 2
      if (monster.healthBarBackground) {
        monster.healthBarBackground.position.set(healthBarX, healthBarY, newPosition.z)
      }
      if (monster.healthBarFill) {
        monster.healthBarFill.position.set(healthBarX, healthBarY, newPosition.z + 0.02)
      }
    })
  }, [updateMonsterPosition])

  return { updateMonsters }
}
