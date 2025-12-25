import { useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useMonsterStore } from '@/entities/monster'
import { createMonster } from '@/entities/monster'
import { getSpawnPosition } from '@/features/monster-spawning'
import { GAME_CONFIG, COLORS } from '@/shared/config/constants'
import { createHealthBar, HEALTH_BAR_WIDTH } from '@/shared/lib/three'

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

    // Create monster mesh
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ color: COLORS.MONSTER })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(position.x, position.y, position.z)
    sceneRef.current.add(mesh)

    // Create health bar (centered above monster)
    const { background, fill } = createHealthBar()
    const healthBarY = position.y + 1 // Above the monster
    const healthBarX = position.x - HEALTH_BAR_WIDTH / 2 // Center the bar
    background.position.set(healthBarX, healthBarY, position.z)
    fill.position.set(healthBarX, healthBarY, position.z + 0.02)

    sceneRef.current.add(background)
    sceneRef.current.add(fill)

    addMonster({
      ...monster,
      mesh,
      healthBarBackground: background,
      healthBarFill: fill
    })
    lastSpawnTimeRef.current = now
  }, [sceneRef, addMonster])

  return { spawnMonster }
}
