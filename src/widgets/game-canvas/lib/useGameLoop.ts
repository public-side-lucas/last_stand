import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/entities/player'
import { useMonsterStore } from '@/entities/monster'
import { useGameStore } from '@/entities/game'
import { checkPlayerCollision } from '@/features/collision-detection'
import { updateHealthBarScale, HEALTH_BAR_WIDTH } from '@/shared/lib/three'
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
  const { damagePlayer } = usePlayerStore()

  // Invincibility timer - 0.4 second bounce after taking damage
  const lastDamageTimeRef = useRef(0)

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

      // Update player health bar position
      const player = usePlayerStore.getState().player
      if (player?.healthBarBackground && player?.healthBarFill) {
        const healthBarY = player.position.y + 1.5
        const healthBarX = player.position.x - HEALTH_BAR_WIDTH / 2
        player.healthBarBackground.position.set(healthBarX, healthBarY, player.position.z)
        player.healthBarFill.position.set(healthBarX, healthBarY, player.position.z + 0.02)
      }

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
      const hitMonster = checkPlayerCollision(currentMonsters, currentPlayer?.mesh)

      // Only apply damage if invincibility period (400ms) has passed
      const INVINCIBILITY_TIME = 400
      if (currentPlayer && hitMonster && now - lastDamageTimeRef.current >= INVINCIBILITY_TIME) {
        damagePlayer(hitMonster.damage)
        updateHealthBarScale(
          currentPlayer.healthBarFill,
          currentPlayer.health - hitMonster.damage,
          currentPlayer.maxHealth
        )
        lastDamageTimeRef.current = now

        if (currentPlayer.health - hitMonster.damage <= 0) {
          setState('gameOver')
        }
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
