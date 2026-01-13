import { Instances } from '@react-three/drei'
import { useMonsterStore } from '@/entities/monster'
import { MonsterMesh } from './MonsterMesh'
import { COLORS } from '@/shared/config/constants'

export const MonsterList = () => {
  // Use selector to only subscribe to monsters array
  const monsters = useMonsterStore((state) => state.monsters)

  return (
    <Instances limit={1000}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={COLORS.MONSTER} />
      {monsters.map((monster) => (
        <MonsterMesh key={monster.id} monster={monster} />
      ))}
    </Instances>
  )
}
