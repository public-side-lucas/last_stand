import type { Vector3 } from '@/shared/types/common'

export interface Player {
  id: string
  position: Vector3
  rotation: number
  health: number
  maxHealth: number
  velocity: Vector3
}
