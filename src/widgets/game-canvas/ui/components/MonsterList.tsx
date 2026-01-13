import { useMonsterStore } from '@/entities/monster'
import { MonsterMesh } from './MonsterMesh'

export const MonsterList = () => {
  // Use selector to only subscribe to monsters array
  const monsters = useMonsterStore((state) => state.monsters)

  return (
    <>
      {monsters.map((monster) => (
        <MonsterMesh key={monster.id} monster={monster} />
      ))}
    </>
  )
}
