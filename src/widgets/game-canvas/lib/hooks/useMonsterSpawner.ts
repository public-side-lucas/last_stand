import { useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useMonsterStore } from '@/entities/monster'
import { createMonster } from '@/entities/monster'
import { getSpawnPosition } from '@/features/monster-spawning'
import { GAME_CONFIG, COLORS } from '@/shared/config/constants'

interface UseMonsterSpawnerParams {
  sceneRef: React.MutableRefObject<THREE.Scene | undefined>
}

export const useMonsterSpawner = ({ sceneRef }: UseMonsterSpawnerParams) => {
  const lastSpawnTimeRef = useRef<number>(0)
  const { addMonster } = useMonsterStore()

  const spawnMonster = useCallback((now: number) => {
    if (now - lastSpawnTimeRef.current <= GAME_CONFIG.SPAWN_INTERVAL) return
    if (!sceneRef.current) return

    const position = getSpawnPosition()
    const monster = createMonster(position)

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ color: COLORS.MONSTER })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(position.x, position.y, position.z)
    sceneRef.current.add(mesh)

    addMonster({ ...monster, mesh })
    lastSpawnTimeRef.current = now
  }, [sceneRef, addMonster])

  return { spawnMonster }
}
