import { memo, useMemo } from 'react'
import type { Monster } from '@/entities/monster'
import { usePlayerStore } from '@/entities/player'
import { PLAYER_CLASS_CONFIG } from '@/shared/config/constants'
import { HealthBar } from './HealthBar'
import { VoxelSlimeMonster } from './VoxelSlimeMonster'

interface MonsterMeshProps {
  monster: Monster
}

/**
 * 최적화된 몬스터 메쉬
 * - useFrame 제거 (매 프레임 회전 계산 불필요)
 * - 회전/투명도를 렌더 시점에 계산
 */
const MonsterMeshComponent = ({ monster }: MonsterMeshProps) => {
  const player = usePlayerStore((state) => state.player)

  // 플레이어 방향으로 회전 (렌더 시점에 계산)
  const rotation = useMemo(() => {
    if (!player) return 0
    const dx = player.position.x - monster.position.x
    const dz = player.position.z - monster.position.z
    return Math.atan2(dx, dz)
  }, [
    player?.position.x,
    player?.position.z,
    monster.position.x,
    monster.position.z,
  ])

  // 거리 기반 투명도 계산 (단순화)
  const opacity = useMemo(() => {
    if (!player) return 1

    const classConfig = PLAYER_CLASS_CONFIG[player.playerClass]
    const dx = monster.position.x - player.position.x
    const dz = monster.position.z - player.position.z
    const distSq = dx * dx + dz * dz // sqrt 제거로 성능 향상

    const clearSq = classConfig.VISION_RANGE_CLEAR ** 2
    const fadeSq = classConfig.VISION_RANGE_FADE ** 2
    const maxSq = classConfig.VISION_RANGE_MAX ** 2

    if (distSq <= clearSq) return 1
    if (distSq >= maxSq) return 0

    if (distSq <= fadeSq) {
      const t = (distSq - clearSq) / (fadeSq - clearSq)
      return 1 - t * 0.7
    }

    const t = (distSq - fadeSq) / (maxSq - fadeSq)
    return 0.3 - t * 0.3
  }, [
    monster.position.x,
    monster.position.z,
    player?.position.x,
    player?.position.z,
    player?.playerClass,
  ])

  if (opacity === 0) return null

  return (
    <group
      position={[monster.position.x, monster.position.y, monster.position.z]}
      rotation={[0, rotation, 0]}
    >
      <VoxelSlimeMonster opacity={opacity} />
      <HealthBar
        position={[0, 1.2, 0]}
        health={monster.health}
        maxHealth={monster.maxHealth}
        opacity={opacity}
      />
    </group>
  )
}

export const MonsterMesh = memo(MonsterMeshComponent, (prev, next) => {
  return (
    prev.monster.id === next.monster.id &&
    prev.monster.position.x === next.monster.position.x &&
    prev.monster.position.y === next.monster.position.y &&
    prev.monster.position.z === next.monster.position.z &&
    prev.monster.health === next.monster.health
  )
})
