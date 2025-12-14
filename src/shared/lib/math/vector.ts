import type { Vector3, Vector2 } from '@/shared'

export const vector3Distance = (a: Vector3, b: Vector3): number => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export const vector3Normalize = (v: Vector3): Vector3 => {
  const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
  if (length === 0) return { x: 0, y: 0, z: 0 }
  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length,
  }
}

export const vector3Dot = (a: Vector3, b: Vector3): number => {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

export const calculateAngleBetween = (a: Vector3, b: Vector3): number => {
  const normA = vector3Normalize(a)
  const normB = vector3Normalize(b)
  const dot = vector3Dot(normA, normB)
  return Math.acos(Math.max(-1, Math.min(1, dot)))
}

export const vector2ToVector3 = (v: Vector2, y: number = 0): Vector3 => {
  return { x: v.x, y, z: v.y }
}
