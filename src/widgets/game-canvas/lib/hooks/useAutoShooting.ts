import { useRef, useCallback } from 'react'
import * as THREE from 'three'
import { usePlayerStore } from '@/entities/player'
import { useBulletStore } from '@/entities/bullet'
import { createBullet } from '@/features/shooting'
import { GAME_CONFIG, COLORS } from '@/shared/config/constants'

interface UseAutoShootingParams {
  sceneRef: React.MutableRefObject<THREE.Scene | undefined>
}

export const useAutoShooting = ({ sceneRef }: UseAutoShootingParams) => {
  const lastShootTimeRef = useRef<number>(0)
  const { addBullet } = useBulletStore()

  const shoot = useCallback((now: number) => {
    if (now - lastShootTimeRef.current <= GAME_CONFIG.AUTO_SHOOT_INTERVAL) return
    if (!sceneRef.current) return

    const currentPlayer = usePlayerStore.getState().player
    if (!currentPlayer) return

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
    sceneRef.current.add(mesh)

    addBullet({ ...bullet, mesh })
    lastShootTimeRef.current = now
  }, [sceneRef, addBullet])

  return { shoot }
}
