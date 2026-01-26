import { useExplosionStore } from '@/entities/explosion'
import { ExplosionMesh } from './ExplosionMesh'

export const ExplosionList = () => {
  const explosions = useExplosionStore((state) => state.explosions)

  return (
    <>
      {explosions.map((explosion) => (
        <ExplosionMesh key={explosion.id} explosion={explosion} />
      ))}
    </>
  )
}