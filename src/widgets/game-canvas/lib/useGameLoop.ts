import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { usePlayerStore } from '@/entities/player'
import { useMonsterStore } from '@/entities/monster'
import { useBulletStore } from '@/entities/bullet'
import { useGameStore } from '@/entities/game'
import { moveTowardsPlayer } from '@/entities/monster'
import { updateBulletPosition } from '@/entities/bullet'
import { findNearestTarget, createBullet } from '@/features/shooting'
import { getSpawnPosition } from '@/features/monster-spawning'
import { createMonster } from '@/entities/monster'
import { checkBulletCollision, checkPlayerCollision } from '@/features/collision-detection'
import { calculateKillScore } from '@/features/scoring'
import { GAME_CONFIG, COLORS } from '@/shared/config/constants'

export const useGameLoop = (
  containerRef: React.RefObject<HTMLDivElement | null>
) => {
  const sceneRef = useRef<THREE.Scene | undefined>(undefined)
  const cameraRef = useRef<THREE.PerspectiveCamera | undefined>(undefined)
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined)
  const playerMeshRef = useRef<THREE.Mesh | undefined>(undefined)
  const mousePositionRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 })
  const lastShootTimeRef = useRef<number>(0)
  const lastSpawnTimeRef = useRef<number>(0)
  const keysRef = useRef<{ [key: string]: boolean }>({})

  const { setPlayer, updateRotation, updatePosition } = usePlayerStore()
  const { addMonster, updateMonsterPosition, damageMonster } = useMonsterStore()
  const { addBullet, removeBullet, updateBulletPosition: updateStoreBulletPosition } = useBulletStore()
  const { state, addScore, setState } = useGameStore()

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!cameraRef.current || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current)

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersectPoint = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersectPoint)

    mousePositionRef.current = { x: intersectPoint.x, z: intersectPoint.z }

    if (playerMeshRef.current) {
      const playerPos = playerMeshRef.current.position
      const dx = intersectPoint.x - playerPos.x
      const dz = intersectPoint.z - playerPos.z
      const rotation = Math.atan2(dx, dz)
      updateRotation(rotation)
      playerMeshRef.current.rotation.y = rotation
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 15, 15)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer
    containerRef.current.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 7.5)
    scene.add(directionalLight)

    const groundGeometry = new THREE.PlaneGeometry(100, 100)
    const groundMaterial = new THREE.MeshStandardMaterial({ color: COLORS.GROUND, side: THREE.DoubleSide })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.5
    scene.add(ground)

    const playerGeometry = new THREE.ConeGeometry(0.5, 1, 3)
    const playerMaterial = new THREE.MeshStandardMaterial({ color: COLORS.PLAYER })
    const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial)
    playerMesh.position.set(0, 0, 0)
    scene.add(playerMesh)
    playerMeshRef.current = playerMesh

    setPlayer({
      id: 'player',
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      mesh: playerMesh,
    })

    const container = containerRef.current

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (['w', 'a', 's', 'd'].includes(key)) {
        keysRef.current[key] = true
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (['w', 'a', 's', 'd'].includes(key)) {
        keysRef.current[key] = false
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !keysRef.current || state !== 'playing') return

    let animationFrameId: number

    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = 16

      // Get current state from stores
      const currentPlayer = usePlayerStore.getState().player
      const currentMonsters = useMonsterStore.getState().monsters
      const currentBullets = useBulletStore.getState().bullets

      // Handle player movement
      if (currentPlayer && playerMeshRef.current) {
        let moveX = 0
        let moveZ = 0

        if (keysRef.current['w']) moveZ -= 1
        if (keysRef.current['s']) moveZ += 1
        if (keysRef.current['a']) moveX -= 1
        if (keysRef.current['d']) moveX += 1

        // Normalize diagonal movement
        if (moveX !== 0 && moveZ !== 0) {
          const length = Math.sqrt(moveX * moveX + moveZ * moveZ)
          moveX /= length
          moveZ /= length
        }

        if (moveX !== 0 || moveZ !== 0) {
          const speed = GAME_CONFIG.PLAYER_MOVE_SPEED * (deltaTime / 16)
          const newPosition = {
            x: currentPlayer.position.x + moveX * speed,
            y: currentPlayer.position.y,
            z: currentPlayer.position.z + moveZ * speed,
          }

          updatePosition(newPosition)
          playerMeshRef.current.position.set(newPosition.x, newPosition.y, newPosition.z)
        }
      }

      if (now - lastSpawnTimeRef.current > GAME_CONFIG.SPAWN_INTERVAL) {
        const position = getSpawnPosition()

        const monster = createMonster(position)

        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshStandardMaterial({ color: COLORS.MONSTER })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(position.x, position.y, position.z)
        sceneRef.current!.add(mesh)

        addMonster({ ...monster, mesh })
        lastSpawnTimeRef.current = now
      }

      currentMonsters.forEach((monster) => {
        if (!currentPlayer) return

        const newPosition = moveTowardsPlayer(monster, currentPlayer.position, deltaTime)
        updateMonsterPosition(monster.id, newPosition)

        if (monster.mesh) {
          monster.mesh.position.set(newPosition.x, newPosition.y, newPosition.z)
        }
      })

      if (currentPlayer && now - lastShootTimeRef.current > GAME_CONFIG.AUTO_SHOOT_INTERVAL) {
        const direction = {
          x: Math.sin(currentPlayer.rotation),
          y: 0,
          z: Math.cos(currentPlayer.rotation),
        }

          const targetPosition = {
              x: currentPlayer.position.x + direction.x * 100,
              y: currentPlayer.position.y,
              z: currentPlayer.position.z + direction.z * 100,
          }

          const bullet = createBullet(currentPlayer.position, targetPosition)

          const geometry = new THREE.SphereGeometry(0.2)
          const material = new THREE.MeshStandardMaterial({ color: COLORS.BULLET })
          const mesh = new THREE.Mesh(geometry, material)
          mesh.position.set(bullet.position.x, bullet.position.y, bullet.position.z)
          sceneRef.current!.add(mesh)

          addBullet({ ...bullet, mesh })
          lastShootTimeRef.current = now
      }

      currentBullets.forEach((bullet) => {
        const newPosition = updateBulletPosition(bullet, deltaTime)
        updateStoreBulletPosition(bullet.id, newPosition)

        if (bullet.mesh) {
          bullet.mesh.position.set(newPosition.x, newPosition.y, newPosition.z)
        }

        const hitMonster = checkBulletCollision(bullet, currentMonsters)
        if (hitMonster) {
          damageMonster(hitMonster.id, 1)
          removeBullet(bullet.id)

          if (bullet.mesh && sceneRef.current) {
            sceneRef.current.remove(bullet.mesh)
          }

          if (hitMonster.health <= 1) {
            addScore(calculateKillScore())
            if (hitMonster.mesh && sceneRef.current) {
              sceneRef.current.remove(hitMonster.mesh)
            }
          }
        }

        if (now - bullet.createdAt > GAME_CONFIG.BULLET_LIFETIME) {
          removeBullet(bullet.id)
          if (bullet.mesh && sceneRef.current) {
            sceneRef.current.remove(bullet.mesh)
          }
        }
      })

      if (currentPlayer && checkPlayerCollision(currentMonsters,currentPlayer.mesh)) {
        setState('gameOver')
      }

      // Update camera to follow player
      if (currentPlayer && cameraRef.current) {
        cameraRef.current.position.set(
          currentPlayer.position.x,
          currentPlayer.position.y + 15,
          currentPlayer.position.z + 15
        )
        cameraRef.current.lookAt(
          currentPlayer.position.x,
          currentPlayer.position.y,
          currentPlayer.position.z
        )
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])
}
