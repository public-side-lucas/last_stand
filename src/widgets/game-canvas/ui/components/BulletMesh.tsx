import { useRef, memo, useMemo } from 'react'
import { Mesh } from 'three'
import type { Bullet } from '@/entities/bullet'
import { COLORS } from '@/shared/config/constants'

interface BulletMeshProps {
  bullet: Bullet
}

const BulletMeshComponent = ({ bullet }: BulletMeshProps) => {
  const meshRef = useRef<Mesh>(null)

  // Memoize geometry args to prevent recreation
  const geometryArgs = useMemo(() => [0.2] as [number], [])

  return (
    <mesh
      ref={meshRef}
      position={[bullet.position.x, bullet.position.y, bullet.position.z]}
    >
      <sphereGeometry args={geometryArgs} />
      <meshStandardMaterial color={COLORS.BULLET} />
    </mesh>
  )
}

// Memoize to prevent unnecessary re-renders
export const BulletMesh = memo(BulletMeshComponent, (prev, next) => {
  return (
    prev.bullet.id === next.bullet.id &&
    prev.bullet.position.x === next.bullet.position.x &&
    prev.bullet.position.y === next.bullet.position.y &&
    prev.bullet.position.z === next.bullet.position.z
  )
})
