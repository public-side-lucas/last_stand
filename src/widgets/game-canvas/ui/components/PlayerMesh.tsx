import { useRef, useMemo } from 'react'
import { Mesh } from 'three'
import { usePlayerStore } from '@/entities/player'
import { COLORS } from '@/shared/config/constants'
import { HealthBar } from './HealthBar'

export const PlayerMesh = () => {
  const meshRef = useRef<Mesh>(null)
  const player = usePlayerStore((state) => state.player)

  // Memoize geometry args and positions
  const geometryArgs = useMemo(() => [0.5, 1, 3] as [number, number, number], [])
  const healthBarPosition = useMemo(() => [0, 1.5, 0] as [number, number, number], [])

  if (!player) return null

  return (
    <group position={[player.position.x, player.position.y, player.position.z]}>
      <mesh ref={meshRef} rotation-y={player.rotation}>
        <coneGeometry args={geometryArgs} />
        <meshStandardMaterial color={COLORS.PLAYER} />
      </mesh>
      <HealthBar
        position={healthBarPosition}
        health={player.health}
        maxHealth={player.maxHealth}
      />
    </group>
  )
}
