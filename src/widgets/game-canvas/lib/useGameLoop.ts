import { useEffect } from 'react'
import { usePlayerStore } from '@/entities/player'
import { useMonsterStore } from '@/entities/monster'
import { useGameStore } from '@/entities/game'
import { checkPlayerCollision } from '@/features/collision-detection'
import { useThreeScene } from './hooks/useThreeScene'
import { usePlayerControls } from './hooks/usePlayerControls'
import { useMonsterSpawner } from './hooks/useMonsterSpawner'
import { useMonsterMovement } from './hooks/useMonsterMovement'
import { useAutoShooting } from './hooks/useAutoShooting'
import { useBulletSystem } from './hooks/useBulletSystem'
import { useCameraFollow } from './hooks/useCameraFollow'

export const useGameLoop = (
  containerRef: React.RefObject<HTMLDivElement | null>
) => {
  const { state, setState } = useGameStore()

  // Initialize Three.js scene
  const { sceneRef, cameraRef, rendererRef, playerMeshRef } = useThreeScene(containerRef)

  // Player controls
  const { keysRef, updatePlayerMovement } = usePlayerControls({
    containerRef,
    cameraRef,
    playerMeshRef,
  })

  // Monster spawner
  const { spawnMonster } = useMonsterSpawner({ sceneRef })

  // Monster movement
  const { updateMonsters } = useMonsterMovement()

  // Auto shooting
  const { shoot } = useAutoShooting({ sceneRef })

  // Bullet system
  const { updateBullets } = useBulletSystem({ sceneRef })

  // Camera follow
  const { updateCamera } = useCameraFollow({ cameraRef })

  // Main game loop
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !keysRef.current || state !== 'playing') return

    let animationFrameId: number

    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = 16

      // Update player movement
      updatePlayerMovement(deltaTime)

      // Spawn monsters
      spawnMonster(now)

      // Update monsters
      updateMonsters(deltaTime)

      // Auto shoot
      shoot(now)

      // Update bullets
      updateBullets(deltaTime, now)

      // Check player collision
      const currentPlayer = usePlayerStore.getState().player
      const currentMonsters = useMonsterStore.getState().monsters
      if (currentPlayer && checkPlayerCollision(currentMonsters, currentPlayer.mesh)) {
        setState('gameOver')
      }

      // Update camera
      updateCamera()

      // Render scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [
    state,
    sceneRef,
    cameraRef,
    rendererRef,
    keysRef,
    updatePlayerMovement,
    spawnMonster,
    updateMonsters,
    shoot,
    updateBullets,
    updateCamera,
    setState,
  ])
}
