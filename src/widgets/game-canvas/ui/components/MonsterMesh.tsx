import { useRef, memo, useMemo } from 'react'
import { Mesh } from 'three'
import type { Monster } from '@/entities/monster'
import { usePlayerStore } from '@/entities/player'
import { COLORS, PLAYER_CLASS_CONFIG } from '@/shared/config/constants'
import { HealthBar } from './HealthBar'

interface MonsterMeshProps {
  monster: Monster
}

const MonsterMeshComponent = ({ monster }: MonsterMeshProps) => {
  const meshRef = useRef<Mesh>(null)
  const player = usePlayerStore((state) => state.player)

  const healthBarPosition = useMemo(() => [0, 1, 0] as [number, number, number], [])
  const geometryArgs = useMemo(() => [1, 1, 1] as [number, number, number], [])

  // Calculate opacity based on distance to player
  const opacity = useMemo(() => {
    if (!player) return 1

    const classConfig = PLAYER_CLASS_CONFIG[player.playerClass]
    const dx = monster.position.x - player.position.x
    const dz = monster.position.z - player.position.z
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
  }, [monster.position.x, monster.position.z, player?.position.x, player?.position.z, player?.playerClass])

  // Don't render if completely invisible
  if (opacity === 0) return null

  return (
    <group position={[monster.position.x, monster.position.y, monster.position.z]}>
      <mesh ref={meshRef}>
        <boxGeometry args={geometryArgs} />
        <meshStandardMaterial
          color={COLORS.MONSTER}
          transparent={true}
          opacity={opacity}
        />
      </mesh>
      <HealthBar
        position={healthBarPosition}
        health={monster.health}
        maxHealth={monster.maxHealth}
        opacity={opacity}
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
