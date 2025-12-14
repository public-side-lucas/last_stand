import {
  vector3Distance,
  vector3Normalize,
  vector3Dot,
  calculateAngleBetween,
} from '@/shared'

describe('vector utilities', () => {
  describe('vector3Distance', () => {
    it('should calculate distance between two points', () => {
      const a = { x: 0, y: 0, z: 0 }
      const b = { x: 3, y: 4, z: 0 }
      expect(vector3Distance(a, b)).toBe(5)
    })

    it('should return 0 for same points', () => {
      const a = { x: 1, y: 2, z: 3 }
      expect(vector3Distance(a, a)).toBe(0)
    })
  })

  describe('vector3Normalize', () => {
    it('should normalize a vector', () => {
      const v = { x: 3, y: 4, z: 0 }
      const result = vector3Normalize(v)
      expect(result.x).toBeCloseTo(0.6)
      expect(result.y).toBeCloseTo(0.8)
      expect(result.z).toBe(0)
    })

    it('should handle zero vector', () => {
      const v = { x: 0, y: 0, z: 0 }
      const result = vector3Normalize(v)
      expect(result).toEqual({ x: 0, y: 0, z: 0 })
    })
  })

  describe('vector3Dot', () => {
    it('should calculate dot product', () => {
      const a = { x: 1, y: 2, z: 3 }
      const b = { x: 4, y: 5, z: 6 }
      expect(vector3Dot(a, b)).toBe(32)
    })
  })

  describe('calculateAngleBetween', () => {
    it('should calculate angle between parallel vectors', () => {
      const a = { x: 1, y: 0, z: 0 }
      const b = { x: 2, y: 0, z: 0 }
      expect(calculateAngleBetween(a, b)).toBeCloseTo(0)
    })

    it('should calculate angle between perpendicular vectors', () => {
      const a = { x: 1, y: 0, z: 0 }
      const b = { x: 0, y: 1, z: 0 }
      expect(calculateAngleBetween(a, b)).toBeCloseTo(Math.PI / 2)
    })
  })
})
