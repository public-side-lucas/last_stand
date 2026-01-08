import { useRef, memo, useMemo } from 'react'
import { Mesh } from 'three'
import type { Monster } from '@/entities/monster'
import { COLORS } from '@/shared/config/constants'
import { HealthBar } from './HealthBar'

interface MonsterMeshProps {
  monster: Monster
}

const MonsterMeshComponent = ({ monster }: MonsterMeshProps) => {
  const meshRef = useRef<Mesh>(null)

  // Memoize geometry args to prevent recreation
  const geometryArgs = useMemo(() => [1, 1, 1] as [number, number, number], [])
  const healthBarPosition = useMemo(() => [0, 1, 0] as [number, number, number], [])

  return (
    <group position={[monster.position.x, monster.position.y, monster.position.z]}>
      <mesh ref={meshRef}>
        <boxGeometry args={geometryArgs} />
        <meshStandardMaterial color={COLORS.MONSTER} />
      </mesh>
      <HealthBar
        position={healthBarPosition}
        health={monster.health}
        maxHealth={monster.maxHealth}
      />
    </group>
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
