import type { Vector3 } from '@/shared/types/common'

export interface Bullet {
  id: string
  position: Vector3
  spawnPosition: Vector3 // Initial position for range calculation
  direction: Vector3
  speed: number
  damage: number
  knockbackForce: number
  canPenetrate: boolean
  range: number // Maximum travel distance
  hitMonsters: string[] // IDs of monsters already hit (for penetration)
  createdAt: number
}
