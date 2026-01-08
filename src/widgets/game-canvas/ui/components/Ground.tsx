import { COLORS } from '@/shared/config/constants'

export const Ground = () => {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.5}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color={COLORS.GROUND} side={2} />
    </mesh>
  )
}
