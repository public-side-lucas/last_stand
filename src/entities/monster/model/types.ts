import type { Vector3 } from '@/shared'
import type * as THREE from 'three'

export interface Monster {
  id: string
  position: Vector3
  health: number
  speed: number
  mesh?: THREE.Mesh
}
