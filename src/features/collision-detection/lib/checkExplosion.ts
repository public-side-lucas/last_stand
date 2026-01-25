import type { Monster } from '@/entities/monster'
import type { Vector3 } from '@/shared'

interface ExplosionResult {
  hitMonsters: Monster[]
}

// 총알이 땅에 닿았는지 확인
export const checkGroundCollision = (position: Vector3): boolean => {
  return position.y <= 0.1 // 지면 높이 0 가정
}

// 폭발 범위 내 몬스터 탐색
export const getMonstersInExplosionRange = (
  center: Vector3,
  radius: number,
  monsters: Monster[]
): Monster[] => {
  return monsters.filter((monster) => {
    // 2D 거리 계산 (y축 제외하고 x, z 평면 거리만 볼 경우)
    const dist = Math.sqrt(
      Math.pow(monster.position.x - center.x, 2) +
        Math.pow(monster.position.z - center.z, 2)
    )
    return dist <= radius
  })
}
