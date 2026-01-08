import type { Vector3 } from '@/shared/types/common'

export interface Bullet {
  id: string
  position: Vector3
  direction: Vector3
  speed: number
  damage: number
  createdAt: number
}
