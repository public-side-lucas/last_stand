import { useEffect, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import { Raycaster, Vector2, Vector3, Plane } from 'three'
import { usePlayerStore } from '@/entities/player'
import { GAME_CONFIG } from '@/shared/config/constants'

interface PlayerControlsProps {
  keysRef: React.MutableRefObject<{ [key: string]: boolean }>
  onRotationChange: (rotation: number) => void
}

export const PlayerControls = ({ keysRef, onRotationChange }: PlayerControlsProps) => {
  const { camera, gl } = useThree()
  const { player, updateRotation } = usePlayerStore()

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!player) return

      const rect = gl.domElement.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      const raycaster = new Raycaster()
      raycaster.setFromCamera(new Vector2(x, y), camera)

      const plane = new Plane(new Vector3(0, 1, 0), 0)
      const intersectPoint = new Vector3()
      raycaster.ray.intersectPlane(plane, intersectPoint)

      const dx = intersectPoint.x - player.position.x
      const dz = intersectPoint.z - player.position.z
      const rotation = Math.atan2(dx, dz)

      updateRotation(rotation)
      onRotationChange(rotation)
    },
    [camera, gl, player, updateRotation, onRotationChange]
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((GAME_CONFIG.MOVE_KEYS as readonly string[]).includes(event.code)) {
        keysRef.current[event.code] = true
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if ((GAME_CONFIG.MOVE_KEYS as readonly string[]).includes(event.code)) {
        keysRef.current[event.code] = false
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
  }, [handleMouseMove, keysRef])

  return null
}
