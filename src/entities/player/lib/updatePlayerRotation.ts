import type { Vector3 } from '@/shared/types/common'

export const calculatePlayerRotation = (
  playerPosition: Vector3,
  mousePosition: { x: number; z: number }
): number => {
  const dx = mousePosition.x - playerPosition.x
  const dz = mousePosition.z - playerPosition.z
  return Math.atan2(dx, dz)
}
