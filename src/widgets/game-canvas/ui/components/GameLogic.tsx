import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { usePlayerStore } from '@/entities/player'
import { useMonsterStore } from '@/entities/monster'
import { useBulletStore } from '@/entities/bullet'
import { useGameStore } from '@/entities/game'
import { updateBulletPosition } from '@/entities/bullet'
import { createMonster } from '@/entities/monster'
import { GAME_CONFIG, PLAYER_CLASS_CONFIG } from '@/shared/config/constants'

// Feature imports (FSD 준수)
import {
  calculatePlayerMovement,
  parseInputState,
} from '@/features/player-movement'
import {
  getSpawnPosition,
  calculateMonsterMovements,
} from '@/features/monster-spawning'
import { processAutoShooting } from '@/features/shooting'
import {
  processStandardBulletCollision,
  processMortarExplosion,
  processPlayerMonsterCollision,
} from '@/features/collision-detection'
import { executeGameActions } from '@/features/game-loop'

interface GameLogicProps {
  keysRef: React.MutableRefObject<{ [key: string]: boolean }>
  playerRotation: number
}

/**
 * 게임 로직 컴포넌트 (리팩토링됨)
 *
 * SOLID 원칙 적용:
 * - SRP: 각 핸들러가 단일 책임을 가짐
 * - OCP: 새 기능은 새 핸들러 추가로 확장
 * - DIP: 액션 인터페이스를 통해 추상화에 의존
 *
 * FSD 원칙 적용:
 * - widgets → features → entities → shared 레이어 준수
 * - 각 feature는 독립적인 public API를 통해 접근
 */
export const GameLogic = ({ keysRef, playerRotation }: GameLogicProps) => {
  // 시간 관련 refs
  const lastShootTimeRef = useRef(0)
  const lastSpawnTimeRef = useRef(0)
  const lastDamageTimeRef = useRef(0)

  useFrame((_, delta) => {
    // === 상태 수집 ===
    const gameStore = useGameStore.getState()
    const playerStore = usePlayerStore.getState()
    const monsterStore = useMonsterStore.getState()
    const bulletStore = useBulletStore.getState()

    if (gameStore.state !== 'playing') return
    if (!playerStore.player) return

    const now = Date.now()
    const deltaTime = delta * 1000
    const player = playerStore.player
    const monsters = monsterStore.monsters
    const bullets = bulletStore.bullets
    const classConfig = PLAYER_CLASS_CONFIG[player.playerClass]

    // === 1. 입력 파싱 (순수 함수) ===
    const input = parseInputState(keysRef.current, playerRotation)

    // === 2. 플레이어 이동 (순수 함수 + 부수효과) ===
    const movementResult = calculatePlayerMovement({
      player,
      input,
      deltaTime,
      moveSpeed: classConfig.MOVE_SPEED,
      maxVelocity: classConfig.MAX_VELOCITY,
    })
    playerStore.updatePosition(movementResult.position)
    playerStore.updateVelocity(movementResult.velocity)

    // === 3. 몬스터 스폰 ===
    if (now - lastSpawnTimeRef.current > GAME_CONFIG.SPAWN_INTERVAL) {
      const position = getSpawnPosition()
      const monster = createMonster(position)
      monsterStore.addMonster(monster)
      lastSpawnTimeRef.current = now
    }

    // === 4. 몬스터 이동 (순수 함수 + 부수효과) ===
    const monsterMovements = calculateMonsterMovements(
      monsters,
      player.position,
      deltaTime
    )
    monsterMovements.forEach(({ monsterId, position, velocity }) => {
      monsterStore.updateMonsterPosition(monsterId, position)
      monsterStore.updateMonsterVelocity(monsterId, velocity)
    })

    // === 5. 자동 사격 (순수 함수 + 부수효과) ===
    const shootingResult = processAutoShooting({
      player,
      playerRotation,
      isMoving: input.isMoving,
      now,
      lastShootTime: lastShootTimeRef.current,
    })
    if (shootingResult.bullet) {
      bulletStore.addBullet(shootingResult.bullet)
    }
    lastShootTimeRef.current = shootingResult.newLastShootTime

    // === 6. 총알 업데이트 및 충돌 처리 ===
    bullets.forEach((bullet) => {
      // 위치 업데이트
      const newPosition = updateBulletPosition(bullet, deltaTime)
      bulletStore.updateBulletPosition(bullet.id, newPosition)

      const updatedBullet = { ...bullet, position: newPosition }

      if (bullet.type === 'MORTAR') {
        // 박격포 폭발 처리 (순수 함수 → 액션 실행)
        const actions = processMortarExplosion({
          bullet: updatedBullet,
          monsters,
          player,
          now,
        })
        executeGameActions(actions)
      } else {
        // 일반 총알 충돌 처리 (순수 함수 → 액션 실행)
        const actions = processStandardBulletCollision({
          bullet: updatedBullet,
          monsters,
          now,
        })
        executeGameActions(actions)
      }
    })

    // === 7. 플레이어 충돌 처리 ===
    const collisionResult = processPlayerMonsterCollision({
      player,
      monsters,
      now,
      lastDamageTime: lastDamageTimeRef.current,
    })
    executeGameActions(collisionResult.actions)
    lastDamageTimeRef.current = collisionResult.newLastDamageTime
  })

  return null
}
