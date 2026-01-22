import { useRef, useMemo } from 'react'
import { Group } from 'three'
import { useFrame } from '@react-three/fiber'
import { usePlayerStore, AssaultSoldierModel } from '@/entities/player'
import { HealthBar } from './HealthBar'

export const PlayerMesh = () => {
  const groupRef = useRef<Group>(null)
  const player = usePlayerStore((state) => state.player)

  // Track shooting state for animation
  const isShootingRef = useRef(false)
  const shootAnimationTimeRef = useRef(0)

  // Memoize health bar position
  const healthBarPosition = useMemo(() => [0, 2, 0] as [number, number, number], [])

  // Track movement based on velocity
  useFrame(() => {
    if (!player) return

    // Check if moving based on velocity magnitude
    const velocityMagnitude = Math.sqrt(
      player.velocity.x * player.velocity.x +
      player.velocity.z * player.velocity.z
    )

    // Consider moving if velocity is above threshold
    const isMoving = velocityMagnitude > 0.02

    // Simulate shooting detection (auto-shoot is always on when playing)
    // We'll pulse the shooting animation periodically
    shootAnimationTimeRef.current += 0.016
    if (shootAnimationTimeRef.current > 0.3) {
      isShootingRef.current = !isMoving
      shootAnimationTimeRef.current = 0
    }
  })

  if (!player) return null

  // Calculate if currently moving
  const velocityMagnitude = Math.sqrt(
    player.velocity.x * player.velocity.x +
    player.velocity.z * player.velocity.z
  )
  const isMoving = velocityMagnitude > 0.02

  return (
    <group
      ref={groupRef}
      position={[player.position.x, player.position.y, player.position.z]}
    >
      <group rotation-y={player.rotation}>
        <AssaultSoldierModel
          animation="idle"
          isMoving={isMoving}
          isShooting={!isMoving}
          scale={0.5}
        />
      </group>
      <HealthBar
        position={healthBarPosition}
        health={player.health}
        maxHealth={player.maxHealth}
      />
    </group>
  )
}
