import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGameStore } from '@/entities/game'
import { CAMERA_CONFIG } from '@/shared/config/constants'
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
  const { state } = useGameStore()

  // Player is created in CharacterSelectionScreen, not here

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

        <PlayerMesh />
        <MonsterList />
        <BulletList />

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
