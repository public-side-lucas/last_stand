import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { usePlayerStore } from '@/entities/player'
import { GAME_CONFIG } from '@/shared/config/constants'

interface UsePlayerControlsParams {
  containerRef: React.RefObject<HTMLDivElement | null>
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | undefined>
  playerMeshRef: React.MutableRefObject<THREE.Mesh | undefined>
}

export const usePlayerControls = ({
  containerRef,
  cameraRef,
  playerMeshRef,
}: UsePlayerControlsParams) => {
  const mousePositionRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 })
  const keysRef = useRef<{ [key: string]: boolean }>({})

  const { updateRotation, updatePosition } = usePlayerStore()

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
  }, [cameraRef, containerRef, playerMeshRef, updateRotation])

  useEffect(() => {
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
    }
  }, [handleMouseMove])

  const updatePlayerMovement = useCallback((deltaTime: number) => {
    const currentPlayer = usePlayerStore.getState().player
    if (!currentPlayer || !playerMeshRef.current) return

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
  }, [playerMeshRef, updatePosition])

  return {
    keysRef,
    mousePositionRef,
    updatePlayerMovement,
  }
}
