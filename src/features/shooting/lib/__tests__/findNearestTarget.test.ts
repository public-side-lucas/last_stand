import { findNearestTarget } from '@/features/shooting'
import type { Monster } from '@/entities/monster'

describe('findNearestTarget', () => {
  const createMonster = (id: string, x: number, z: number): Monster => ({
    id,
    position: { x, y: 0, z },
    velocity: { x: 0, y: 0, z: 0 },
    health: 3,
    maxHealth: 3,
    damage: 1,
    speed: 0.02,
  })

  it('should find the closest monster within angle', () => {
    const monsters: Monster[] = [
      createMonster('1', 5, 5),
      createMonster('2', 3, 3),
    ]

    const result = findNearestTarget({
      playerPosition: { x: 0, y: 0, z: 0 },
      playerDirection: { x: 1, y: 0, z: 1 },
      monsters,
    })

    expect(result?.id).toBe('2')
  })

  it('should return null if no monsters in range', () => {
    const monsters: Monster[] = [createMonster('1', -10, 0)]

    const result = findNearestTarget({
      playerPosition: { x: 0, y: 0, z: 0 },
      playerDirection: { x: 1, y: 0, z: 0 },
      monsters,
      maxAngle: Math.PI / 6,
    })

    expect(result).toBeNull()
  })

  it('should return null for empty monster array', () => {
    const result = findNearestTarget({
      playerPosition: { x: 0, y: 0, z: 0 } ,
      playerDirection: { x: 1, y: 0, z: 0 },
      monsters: [],
    })

    expect(result).toBeNull()
  })
})
