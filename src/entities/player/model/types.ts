import type { Vector3 } from '@/shared/types/common'
import type * as THREE from 'three'

export interface Player {
  id: string
  position: Vector3
  rotation: number
  mesh?: THREE.Mesh
}
