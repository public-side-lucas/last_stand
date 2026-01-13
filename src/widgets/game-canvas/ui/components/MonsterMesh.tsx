import { useRef, memo, useMemo, useEffect } from 'react'
import { Instance } from '@react-three/drei'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import type { Monster } from '@/entities/monster'
import { HealthBar } from './HealthBar'

interface MonsterMeshProps {
  monster: Monster
}

const MonsterMeshComponent = ({ monster }: MonsterMeshProps) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null)

  const healthBarPosition = useMemo(() => [0, 1, 0] as [number, number, number], [])

  // Update RigidBody position when monster position changes
  useEffect(() => {
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setTranslation(
        { x: monster.position.x, y: monster.position.y, z: monster.position.z },
        true
      )
    }
  }, [monster.position.x, monster.position.y, monster.position.z])

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicPosition"
      colliders="cuboid"
      position={[monster.position.x, monster.position.y, monster.position.z]}
    >
      <Instance position={[0, 0, 0]} />
      <HealthBar
        position={healthBarPosition}
        health={monster.health}
        maxHealth={monster.maxHealth}
      />
    </RigidBody>
  )
}

// Memoize to prevent unnecessary re-renders
export const MonsterMesh = memo(MonsterMeshComponent, (prev, next) => {
  return (
    prev.monster.id === next.monster.id &&
    prev.monster.position.x === next.monster.position.x &&
    prev.monster.position.y === next.monster.position.y &&
    prev.monster.position.z === next.monster.position.z &&
    prev.monster.health === next.monster.health
  )
})
