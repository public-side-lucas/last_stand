import type { Vector3 } from '@/shared'

export interface Monster {
  id: string
  position: Vector3
  velocity: Vector3
  health: number
  maxHealth: number
  damage: number
  speed: number
}
