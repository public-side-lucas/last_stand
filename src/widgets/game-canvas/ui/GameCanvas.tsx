import { useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { usePlayerStore } from '@/entities/player'
import { useGameStore } from '@/entities/game'
import { GAME_CONFIG, CAMERA_CONFIG } from '@/shared/config/constants'
import { PlayerMesh } from './components/PlayerMesh'
import { MonsterList } from './components/MonsterList'
import { BulletList } from './components/BulletList'
import { Ground } from './components/Ground'
import { Lights } from './components/Lights'
import { GameLogic } from './components/GameLogic'
import { PlayerControls } from './components/PlayerControls'
import { CameraController } from './components/CameraController'

export const GameCanvas = () => {
  const keysRef = useRef<{ [key: string]: boolean }>({})
  const [playerRotation, setPlayerRotation] = useState(0)
  const { setPlayer } = usePlayerStore()
  const { state } = useGameStore()

  useEffect(() => {
    setPlayer({
      id: 'player',
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      health: GAME_CONFIG.PLAYER_MAX_HEALTH,
      maxHealth: GAME_CONFIG.PLAYER_MAX_HEALTH,
      velocity: { x: 0, y: 0, z: 0 },
    })
  }, [setPlayer])

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          fov: CAMERA_CONFIG.FOV,
          near: CAMERA_CONFIG.NEAR,
          far: CAMERA_CONFIG.FAR,
          position: [CAMERA_CONFIG.POSITION.x, CAMERA_CONFIG.POSITION.y, CAMERA_CONFIG.POSITION.z],
        }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[0x000000]} />
        <Lights />
        <Ground />

        <Physics gravity={[0, 0, 0]}>
          <PlayerMesh />
          <MonsterList />
          <BulletList />
        </Physics>

        {state === 'playing' && (
          <>
            <GameLogic keysRef={keysRef} playerRotation={playerRotation} />
            <PlayerControls keysRef={keysRef} onRotationChange={setPlayerRotation} />
            <CameraController />
          </>
        )}
      </Canvas>
    </div>
  )
}
