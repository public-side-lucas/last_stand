import { useCallback } from 'react'
import * as THREE from 'three'
import { usePlayerStore } from '@/entities/player'

interface UseCameraFollowParams {
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | undefined>
}

export const useCameraFollow = ({ cameraRef }: UseCameraFollowParams) => {
  const updateCamera = useCallback(() => {
    const currentPlayer = usePlayerStore.getState().player
    if (!currentPlayer || !cameraRef.current) return

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
  }, [cameraRef])

  return { updateCamera }
}
