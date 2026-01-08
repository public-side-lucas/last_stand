import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { usePlayerStore } from '@/entities/player'
import { useMonsterStore } from '@/entities/monster'
import { useBulletStore } from '@/entities/bullet'
import { useGameStore } from '@/entities/game'
import { checkPlayerCollision } from '@/features/collision-detection'
import { checkBulletCollision } from '@/features/collision-detection'
import { updateBulletPosition } from '@/entities/bullet'
import { moveTowardsPlayer } from '@/entities/monster'
import { createBullet } from '@/features/shooting'
import { createMonster } from '@/entities/monster'
import { getSpawnPosition } from '@/features/monster-spawning'
import { calculateKillScore } from '@/features/scoring'
import { GAME_CONFIG } from '@/shared/config/constants'

interface GameLogicProps {
  keysRef: React.MutableRefObject<{ [key: string]: boolean }>
  playerRotation: number
}

export const GameLogic = ({ keysRef, playerRotation }: GameLogicProps) => {
  const lastShootTimeRef = useRef(0)
  const lastSpawnTimeRef = useRef(0)
  const lastDamageTimeRef = useRef(0)

  useFrame((_, delta) => {
    // Get latest state from stores on each frame
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

    // === PLAYER MOVEMENT ===
    let moveX = 0
    let moveZ = 0

    if (keysRef.current[GAME_CONFIG.MOVE_KEYS[0]]) moveZ -= 1
    if (keysRef.current[GAME_CONFIG.MOVE_KEYS[1]]) moveX -= 1
    if (keysRef.current[GAME_CONFIG.MOVE_KEYS[2]]) moveZ += 1
    if (keysRef.current[GAME_CONFIG.MOVE_KEYS[3]]) moveX += 1

    // Normalize diagonal movement
    if (moveX !== 0 && moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ)
      moveX /= length
      moveZ /= length
    }

    if (moveX !== 0 || moveZ !== 0) {
      const speed = GAME_CONFIG.PLAYER_MOVE_SPEED * (deltaTime / 16)
      const newPosition = {
        x: player.position.x + moveX * speed,
        y: player.position.y,
        z: player.position.z + moveZ * speed,
      }
      playerStore.updatePosition(newPosition)
    }

    // === MONSTER SPAWNING ===
    if (now - lastSpawnTimeRef.current > GAME_CONFIG.SPAWN_INTERVAL) {
      const position = getSpawnPosition()
      const monster = createMonster(position)
      monsterStore.addMonster(monster)
      lastSpawnTimeRef.current = now
    }

    // === MONSTER MOVEMENT ===
    monsters.forEach((monster) => {
      const newPosition = moveTowardsPlayer(monster, player.position, deltaTime)
      monsterStore.updateMonsterPosition(monster.id, newPosition)
    })

    // === AUTO SHOOTING ===
    if (now - lastShootTimeRef.current > GAME_CONFIG.AUTO_SHOOT_INTERVAL) {
      const direction = {
        x: Math.sin(playerRotation),
        y: 0,
        z: Math.cos(playerRotation),
      }

      const targetPosition = {
        x: player.position.x + direction.x * 100,
        y: player.position.y,
        z: player.position.z + direction.z * 100,
      }

      const bullet = createBullet(player.position, targetPosition)
      bulletStore.addBullet(bullet)
      lastShootTimeRef.current = now
    }

    // === BULLET UPDATES ===
    bullets.forEach((bullet) => {
      // Update position
      const newPosition = updateBulletPosition(bullet, deltaTime)
      bulletStore.updateBulletPosition(bullet.id, newPosition)

      // Check collision
      const hitMonster = checkBulletCollision(bullet, monsters)
      if (hitMonster) {
        const newHealth = hitMonster.health - bullet.damage
        bulletStore.removeBullet(bullet.id)
        monsterStore.damageMonster(hitMonster.id, bullet.damage)

        if (newHealth <= 0) {
          gameStore.addScore(calculateKillScore())
          monsterStore.removeMonster(hitMonster.id)
        }
        return
      }

      // Remove old bullets
      if (now - bullet.createdAt > GAME_CONFIG.BULLET_LIFETIME) {
        bulletStore.removeBullet(bullet.id)
      }
    })

    // === PLAYER COLLISION ===
    const hitMonster = checkPlayerCollision(monsters, player)
    const INVINCIBILITY_TIME = 400

    if (hitMonster && now - lastDamageTimeRef.current >= INVINCIBILITY_TIME) {
      playerStore.damagePlayer(hitMonster.damage)
      lastDamageTimeRef.current = now

      if (player.health - hitMonster.damage <= 0) {
        gameStore.setState('gameOver')
      }
    }
  })

  return null
}
