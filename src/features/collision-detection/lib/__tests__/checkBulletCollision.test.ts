import { checkBulletCollision } from '../checkBulletCollision'
import type { Bullet } from '@/entities/bullet'
import type { Monster } from '@/entities/monster'

describe('checkBulletCollision', () => {
  const createBullet = (x: number, z: number): Bullet => ({
    id: 'bullet-1',
    position: { x, y: 0, z },
    direction: { x: 1, y: 0, z: 0 },
    speed: 0.5,
    damage: 1,
    knockbackForce: 2.5,
    createdAt: Date.now(),
  })

  const createMonster = (id: string, x: number, z: number): Monster => ({
    id,
    position: { x, y: 0, z },
    velocity: { x: 0, y: 0, z: 0 },
    health: 3,
    maxHealth: 3,
    damage: 1,
    speed: 0.02,
  })

  it('should detect collision when bullet is close to monster', () => {
    const bullet = createBullet(0, 0)
    const monsters = [createMonster('1', 0.5, 0)]

    const result = checkBulletCollision(bullet, monsters)

    expect(result?.id).toBe('1')
  })

  it('should return null when bullet is far from all monsters', () => {
    const bullet = createBullet(0, 0)
    const monsters = [createMonster('1', 10, 10)]

    const result = checkBulletCollision(bullet, monsters)

    expect(result).toBeNull()
  })
})
