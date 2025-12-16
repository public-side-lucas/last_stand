import type { Monster } from '@/entities/monster'
import {calculateAngleBetween, GAME_CONFIG, type Vector3} from '@/shared'

interface FindTargetParams {
  playerPosition: Vector3
  playerDirection: Vector3
  monsters: Monster[]
  maxAngle?: number
}

export const findNearestTarget = ({
  playerPosition,
  playerDirection,
  monsters,
  maxAngle = GAME_CONFIG.MAX_TARGET_ANGLE,
}: FindTargetParams): Monster | null => {
  let closestMonster: Monster | null = null
  let closestAngle = Infinity

  for (const monster of monsters) {
    const toMonster = {
      x: monster.position.x - playerPosition.x,
      y: 0,
      z: monster.position.z - playerPosition.z,
    }

    const angle = calculateAngleBetween(playerDirection, toMonster)

    if (angle < maxAngle && angle < closestAngle) {
      closestAngle = angle
      closestMonster = monster
    }
  }

  return closestMonster
}
