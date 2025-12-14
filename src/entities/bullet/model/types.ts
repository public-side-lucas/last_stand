import type { Vector3 } from '@/shared/types/common'
import type * as THREE from 'three'

export interface Bullet {
  id: string
  position: Vector3
  direction: Vector3
  speed: number
  createdAt: number
  mesh?: THREE.Mesh
}
