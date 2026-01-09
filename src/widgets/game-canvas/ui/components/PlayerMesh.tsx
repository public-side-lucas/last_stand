import { useRef, useMemo, useEffect } from 'react'
import { Mesh } from 'three'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import { usePlayerStore } from '@/entities/player'
import { COLORS } from '@/shared/config/constants'
import { HealthBar } from './HealthBar'

export const PlayerMesh = () => {
  const meshRef = useRef<Mesh>(null)
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const player = usePlayerStore((state) => state.player)

  // Memoize geometry args and positions
  const geometryArgs = useMemo(() => [0.5, 1, 3] as [number, number, number], [])
  const healthBarPosition = useMemo(() => [0, 1.5, 0] as [number, number, number], [])

  // Update RigidBody position when player position changes
  useEffect(() => {
    if (rigidBodyRef.current && player) {
      rigidBodyRef.current.setTranslation(
        { x: player.position.x, y: player.position.y, z: player.position.z },
        true
      )
    }
  }, [player?.position.x, player?.position.y, player?.position.z])

  if (!player) return null

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicPosition"
      colliders="hull"
      position={[player.position.x, player.position.y, player.position.z]}
    >
      <mesh ref={meshRef} rotation-y={player.rotation}>
        <coneGeometry args={geometryArgs} />
        <meshStandardMaterial color={COLORS.PLAYER} />
      </mesh>
      <HealthBar
        position={healthBarPosition}
        health={player.health}
        maxHealth={player.maxHealth}
      />
    </RigidBody>
  )
}
