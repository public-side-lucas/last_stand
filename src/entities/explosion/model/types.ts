import type { Vector3 } from '@/shared/types/common'

export interface Explosion {
  id: string
  position: Vector3
  radius: number
  damage: number
  createdAt: number
  duration: number // 애니메이션 지속 시간 (ms)
}
