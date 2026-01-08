import { useBulletStore } from '@/entities/bullet'
import { BulletMesh } from './BulletMesh'

export const BulletList = () => {
  // Use selector to only subscribe to bullets array
  const bullets = useBulletStore((state) => state.bullets)

  return (
    <>
      {bullets.map((bullet) => (
        <BulletMesh key={bullet.id} bullet={bullet} />
      ))}
    </>
  )
}
