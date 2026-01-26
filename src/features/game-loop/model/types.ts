import type { Player } from '@/entities/player'
import type { Monster } from '@/entities/monster'
import type { Bullet } from '@/entities/bullet'
import type { Vector3 } from '@/shared/types/common'

// 게임 루프에서 사용하는 공통 컨텍스트 (DIP - 추상화에 의존)
export interface GameLoopContext {
  now: number
  deltaTime: number
  player: Player
  monsters: Monster[]
  bullets: Bullet[]
}

// 입력 상태
export interface InputState {
  moveX: number
  moveZ: number
  isMoving: boolean
  playerRotation: number
}

// 핸들러 결과 타입들 (순수 함수의 반환값)
export interface MovementResult {
  position: Vector3
  velocity: Vector3
}

export interface SpawnResult {
  shouldSpawn: boolean
  position?: Vector3
}

export interface ShootingResult {
  shouldShoot: boolean
  bullet?: Bullet
}

export interface CollisionResult {
  hit: boolean
  damage?: number
  knockback?: Vector3
}

export interface ExplosionData {
  id: string
  position: Vector3
  radius: number
  damage: number
  knockbackForce: number
}
