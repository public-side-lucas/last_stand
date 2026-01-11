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

    // === VELOCITY APPLICATION AND DAMPING ===
    let currentVelocity = { ...player.velocity }

    // Apply damping to velocity
    currentVelocity.x *= GAME_CONFIG.PLAYER_VELOCITY_DAMPING
    currentVelocity.z *= GAME_CONFIG.PLAYER_VELOCITY_DAMPING

    // Stop very small velocities to avoid floating point drift
    if (Math.abs(currentVelocity.x) < 0.01) currentVelocity.x = 0
    if (Math.abs(currentVelocity.z) < 0.01) currentVelocity.z = 0

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

    // Add player input to velocity
    if (moveX !== 0 || moveZ !== 0) {
      const speed = GAME_CONFIG.PLAYER_MOVE_SPEED * (deltaTime / 16)
      currentVelocity.x += moveX * speed
      currentVelocity.z += moveZ * speed
    }

    // Clamp velocity to max speed
    const velocityMagnitude = Math.sqrt(
      currentVelocity.x * currentVelocity.x +
      currentVelocity.z * currentVelocity.z
    )

    if (velocityMagnitude > GAME_CONFIG.PLAYER_MAX_VELOCITY) {
      const scale = GAME_CONFIG.PLAYER_MAX_VELOCITY / velocityMagnitude
      currentVelocity.x *= scale
      currentVelocity.z *= scale
    }

    // Apply velocity to position
    const newPosition = {
      x: player.position.x + currentVelocity.x,
      y: player.position.y,
      z: player.position.z + currentVelocity.z,
    }
    playerStore.updatePosition(newPosition)
    playerStore.updateVelocity(currentVelocity)

    // === MONSTER SPAWNING ===
    if (now - lastSpawnTimeRef.current > GAME_CONFIG.SPAWN_INTERVAL) {
      const position = getSpawnPosition()
      const monster = createMonster(position)
      monsterStore.addMonster(monster)
      lastSpawnTimeRef.current = now
    }

    // === MONSTER MOVEMENT ===
    monsters.forEach((monster) => {
      // Apply velocity damping (for knockback)
      let currentVelocity = { ...monster.velocity }
      currentVelocity.x *= GAME_CONFIG.MONSTER_VELOCITY_DAMPING
      currentVelocity.z *= GAME_CONFIG.MONSTER_VELOCITY_DAMPING

      // Stop very small velocities
      if (Math.abs(currentVelocity.x) < 0.01) currentVelocity.x = 0
      if (Math.abs(currentVelocity.z) < 0.01) currentVelocity.z = 0

      // Calculate normal movement towards player
      const targetPosition = moveTowardsPlayer(monster, player.position, deltaTime)

      // Apply knockback velocity on top of normal movement
      const newPosition = {
        x: targetPosition.x + currentVelocity.x,
        y: monster.position.y,
        z: targetPosition.z + currentVelocity.z,
      }

      monsterStore.updateMonsterPosition(monster.id, newPosition)
      monsterStore.updateMonsterVelocity(monster.id, currentVelocity)
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

      // Check collision with UPDATED position
      const updatedBullet = { ...bullet, position: newPosition }
      const hitMonster = checkBulletCollision(updatedBullet, monsters)
      if (hitMonster) {
        const newHealth = hitMonster.health - bullet.damage
        bulletStore.removeBullet(bullet.id)
        monsterStore.damageMonster(hitMonster.id, bullet.damage)

        // Apply knockback to monster in bullet's direction
        // Use bullet's direction vector (already normalized)
        const knockbackVelocityX = bullet.direction.x * bullet.knockbackForce
        const knockbackVelocityZ = bullet.direction.z * bullet.knockbackForce

        // Add knockback to monster velocity
        monsterStore.updateMonsterVelocity(hitMonster.id, {
          x: hitMonster.velocity.x + knockbackVelocityX,
          y: 0,
          z: hitMonster.velocity.z + knockbackVelocityZ,
        })

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

    if (hitMonster) {
      // ALWAYS apply knockback when colliding (regardless of invincibility)
      const dx = player.position.x - hitMonster.position.x
      const dz = player.position.z - hitMonster.position.z
      const distance = Math.sqrt(dx * dx + dz * dz)

      if (distance > 0) {
        const knockbackVelocityX = (dx / distance) * GAME_CONFIG.PLAYER_KNOCKBACK_FORCE
        const knockbackVelocityZ = (dz / distance) * GAME_CONFIG.PLAYER_KNOCKBACK_FORCE

        // Set knockback velocity directly (override current velocity for immediate effect)
        playerStore.updateVelocity({
          x: knockbackVelocityX,
          y: 0,
          z: knockbackVelocityZ,
        })
      }

      // Apply damage only if not in invincibility period
      if (now - lastDamageTimeRef.current >= GAME_CONFIG.PLAYER_INVINCIBILITY_TIME) {
        playerStore.damagePlayer(hitMonster.damage)
        lastDamageTimeRef.current = now

        if (player.health - hitMonster.damage <= 0) {
          gameStore.setState('gameOver')
        }
      }
    }
  })

  return null
}
