import * as THREE from 'three'
import { CAMERA_CONFIG } from '@/shared'

export const createCamera = (aspect: number): THREE.PerspectiveCamera => {
  const camera = new THREE.PerspectiveCamera(
    CAMERA_CONFIG.FOV,
    aspect,
    CAMERA_CONFIG.NEAR,
    CAMERA_CONFIG.FAR
  )

  camera.position.set(
    CAMERA_CONFIG.POSITION.x,
    CAMERA_CONFIG.POSITION.y,
    CAMERA_CONFIG.POSITION.z
  )

  camera.lookAt(
    CAMERA_CONFIG.LOOK_AT.x,
    CAMERA_CONFIG.LOOK_AT.y,
    CAMERA_CONFIG.LOOK_AT.z
  )

  return camera
}
