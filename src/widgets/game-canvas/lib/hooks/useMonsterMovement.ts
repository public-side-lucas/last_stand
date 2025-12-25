import { useCallback } from 'react'
import { usePlayerStore } from '@/entities/player'
import { useMonsterStore } from '@/entities/monster'
import { moveTowardsPlayer } from '@/entities/monster'

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
    })
  }, [updateMonsterPosition])

  return { updateMonsters }
}
