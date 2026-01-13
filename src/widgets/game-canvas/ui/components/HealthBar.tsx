import { useMemo, memo } from 'react'

interface HealthBarProps {
  position: [number, number, number]
  health: number
  maxHealth: number
  opacity?: number
}

const HEALTH_BAR_WIDTH = 1
const HEALTH_BAR_HEIGHT = 0.1
const HEALTH_BAR_DEPTH = 0.01

const HealthBarComponent = ({ position, health, maxHealth, opacity = 1 }: HealthBarProps) => {
  const healthPercentage = Math.max(0, Math.min(1, health / maxHealth))

  // Memoize calculations
  const fillWidth = useMemo(() => HEALTH_BAR_WIDTH * healthPercentage, [healthPercentage])
  const fillPositionX = useMemo(() => -HEALTH_BAR_WIDTH / 2 + fillWidth / 2, [fillWidth])

  // Memoize geometry args
  const bgGeometryArgs = useMemo(
    () => [HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT, HEALTH_BAR_DEPTH] as [number, number, number],
    []
  )
  const fillGeometryArgs = useMemo(
    () => [fillWidth, HEALTH_BAR_HEIGHT, HEALTH_BAR_DEPTH] as [number, number, number],
    [fillWidth]
  )

  return (
    <group position={position}>
      {/* Background (red) - 중앙 정렬 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={bgGeometryArgs} />
        <meshBasicMaterial color={0xff0000} transparent={true} opacity={opacity} />
      </mesh>

      {/* Fill (green) - 왼쪽부터 채워짐 */}
      <mesh position={[fillPositionX, 0, 0.02]}>
        <boxGeometry args={fillGeometryArgs} />
        <meshBasicMaterial color={0x00ff00} transparent={true} opacity={opacity} />
      </mesh>
    </group>
  )
}

// Memoize to prevent unnecessary re-renders
export const HealthBar = memo(HealthBarComponent, (prev, next) => {
  return (
    prev.health === next.health &&
    prev.maxHealth === next.maxHealth &&
    prev.opacity === next.opacity
  )
})
