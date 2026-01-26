import type { Player } from '@/entities/player'
import type { Vector3 } from '@/shared/types/common'
import type { MovementResult, InputState } from '@/features/game-loop/model/types'
import { GAME_CONFIG } from '@/shared/config/constants'

interface PlayerMovementParams {
  player: Player
  input: InputState
  deltaTime: number
  moveSpeed: number
  maxVelocity: number
}

/**
 * 플레이어 이동 계산 (순수 함수)
 * SRP: 플레이어 이동 물리 계산만 담당
 */
export const calculatePlayerMovement = ({
  player,
  input,
  deltaTime,
  moveSpeed,
  maxVelocity,
}: PlayerMovementParams): MovementResult => {
  // 속도 감쇠 적용
  let velocity: Vector3 = {
    x: player.velocity.x * GAME_CONFIG.PLAYER_VELOCITY_DAMPING,
    y: player.velocity.y,
    z: player.velocity.z * GAME_CONFIG.PLAYER_VELOCITY_DAMPING,
  }

  // 입력에 따른 속도 추가
  if (input.moveX !== 0 || input.moveZ !== 0) {
    const speed = moveSpeed * (deltaTime / 16)
    velocity.x += input.moveX * speed
    velocity.z += input.moveZ * speed
  }

  // 미세 속도 제거 (부동소수점 드리프트 방지)
  if (input.moveX === 0 && Math.abs(velocity.x) < 0.02) velocity.x = 0
  if (input.moveZ === 0 && Math.abs(velocity.z) < 0.02) velocity.z = 0

  // 최대 속도 제한
  const magnitude = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
  if (magnitude > maxVelocity) {
    const scale = maxVelocity / magnitude
    velocity.x *= scale
    velocity.z *= scale
  }

  // 새 위치 계산
  const position: Vector3 = {
    x: player.position.x + velocity.x,
    y: player.position.y,
    z: player.position.z + velocity.z,
  }

  return { position, velocity }
}
