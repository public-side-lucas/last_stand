import { useFrame, useThree } from '@react-three/fiber'
import { usePlayerStore } from '@/entities/player'

export const CameraController = () => {
  const { camera } = useThree()
  const { player } = usePlayerStore()

  useFrame(() => {
    if (!player) return

    camera.position.set(
      player.position.x,
      player.position.y + 15,
      player.position.z + 15
    )
    camera.lookAt(
      player.position.x,
      player.position.y,
      player.position.z
    )
  })

  return null
}
