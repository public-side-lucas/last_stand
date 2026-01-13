import { memo, useMemo, useRef } from 'react'
import { Mesh } from 'three'
import type { Bullet } from '@/entities/bullet'
import { usePlayerStore } from '@/entities/player'
import { COLORS, PLAYER_CLASS_CONFIG } from '@/shared/config/constants'

interface BulletMeshProps {
  bullet: Bullet
}

const BulletMeshComponent = ({ bullet }: BulletMeshProps) => {
  const meshRef = useRef<Mesh>(null)
  const player = usePlayerStore((state) => state.player)

  const geometryArgs = useMemo(() => [0.2] as [number], [])

  // Calculate opacity based on distance to player
  const opacity = useMemo(() => {
    if (!player) return 1

    const classConfig = PLAYER_CLASS_CONFIG[player.playerClass]
    const dx = bullet.position.x - player.position.x
    const dz = bullet.position.z - player.position.z
    const distance = Math.sqrt(dx * dx + dz * dz)

    // Clear vision range: fully visible
    if (distance <= classConfig.VISION_RANGE_CLEAR) {
      return 1
    }

    // Fade range: gradually fade out
    if (distance <= classConfig.VISION_RANGE_FADE) {
      const fadeStart = classConfig.VISION_RANGE_CLEAR
      const fadeEnd = classConfig.VISION_RANGE_FADE
      const fadeProgress = (distance - fadeStart) / (fadeEnd - fadeStart)
      return 1 - fadeProgress * 0.7 // Fade from 1 to 0.3
    }

    // Max range: continue fading to invisible
    if (distance <= classConfig.VISION_RANGE_MAX) {
      const fadeStart = classConfig.VISION_RANGE_FADE
      const fadeEnd = classConfig.VISION_RANGE_MAX
      const fadeProgress = (distance - fadeStart) / (fadeEnd - fadeStart)
      return 0.3 - fadeProgress * 0.3 // Fade from 0.3 to 0
    }

    // Beyond max range: invisible
    return 0
  }, [bullet.position.x, bullet.position.z, player?.position.x, player?.position.z, player?.playerClass])

  // Don't render if completely invisible
  if (opacity === 0) return null

  return (
    <mesh
      ref={meshRef}
      position={[bullet.position.x, bullet.position.y, bullet.position.z]}
    >
      <sphereGeometry args={geometryArgs} />
      <meshStandardMaterial
        color={COLORS.BULLET}
        transparent={true}
        opacity={opacity}
      />
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
