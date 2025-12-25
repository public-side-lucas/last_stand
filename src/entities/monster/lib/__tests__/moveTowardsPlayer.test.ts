import { moveTowardsPlayer } from '@/entities/monster'
import type { Monster } from '../../model/types'

describe('moveTowardsPlayer', () => {
  it('should move monster towards player', () => {
    const monster: Monster = {
      id: 'monster-1',
      position: { x: 10, y: 0, z: 10 },
      health: 3,
      maxHealth: 3,
      speed: 0.02,
    }

    const playerPosition = { x: 0, y: 0, z: 0 }
    const deltaTime = 16

    const newPosition = moveTowardsPlayer(monster, playerPosition, deltaTime)

    expect(newPosition.x).toBeLessThan(monster.position.x)
    expect(newPosition.z).toBeLessThan(monster.position.z)
  })

  it('should not move if already at player position', () => {
    const monster: Monster = {
      id: 'monster-1',
      position: { x: 0, y: 0, z: 0 },
      health: 3,
      maxHealth: 3,
      speed: 0.02,
    }

    const playerPosition = { x: 0, y: 0, z: 0 }
    const deltaTime = 16

    const newPosition = moveTowardsPlayer(monster, playerPosition, deltaTime)

    expect(newPosition.x).toBeCloseTo(0)
    expect(newPosition.z).toBeCloseTo(0)
  })
})
