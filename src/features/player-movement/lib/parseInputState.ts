import type { InputState } from '@/features/game-loop/model/types'
import { GAME_CONFIG } from '@/shared/config/constants'

/**
 * 키 입력을 InputState로 변환 (순수 함수)
 * SRP: 입력 파싱만 담당
 */
export const parseInputState = (
  keys: { [key: string]: boolean },
  playerRotation: number
): InputState => {
  let moveX = 0
  let moveZ = 0

  if (keys[GAME_CONFIG.MOVE_KEYS[0]]) moveZ -= 1 // W
  if (keys[GAME_CONFIG.MOVE_KEYS[1]]) moveX -= 1 // A
  if (keys[GAME_CONFIG.MOVE_KEYS[2]]) moveZ += 1 // S
  if (keys[GAME_CONFIG.MOVE_KEYS[3]]) moveX += 1 // D

  // 대각선 이동 정규화
  if (moveX !== 0 && moveZ !== 0) {
    const length = Math.sqrt(moveX * moveX + moveZ * moveZ)
    moveX /= length
    moveZ /= length
  }

  return {
    moveX,
    moveZ,
    isMoving: moveX !== 0 || moveZ !== 0,
    playerRotation,
  }
}
