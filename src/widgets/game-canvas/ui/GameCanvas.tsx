import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGameStore } from '@/entities/game'
import { CAMERA_CONFIG } from '@/shared/config/constants'
import { PlayerMesh } from './components/PlayerMesh'
import { MonsterList } from './components/MonsterList'
import { BulletList } from './components/BulletList'
import { ExplosionList } from './components/ExplosionList'
import { DesertGround } from './components/DesertGround'
import { Lights } from './components/Lights'
import { GameLogic } from './components/GameLogic'
import { PlayerControls } from './components/PlayerControls'
import { CameraController } from './components/CameraController'
import { SandstormEffect, GroundDust } from './components/SandstormEffect'
import { CactusField, DesertRocks, DesertBones } from './components/VoxelCactus'

export const GameCanvas = () => {
  const keysRef = useRef<{ [key: string]: boolean }>({})
  const [playerRotation, setPlayerRotation] = useState(0)
  const { state } = useGameStore()

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          fov: CAMERA_CONFIG.FOV,
          near: CAMERA_CONFIG.NEAR,
          far: CAMERA_CONFIG.FAR,
          position: [
            CAMERA_CONFIG.POSITION.x,
            CAMERA_CONFIG.POSITION.y,
            CAMERA_CONFIG.POSITION.z,
          ],
        }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        {/* 환경 */}
        <Lights />
        <DesertGround />
        <fog attach="fog" args={['#d4a574', 30, 80]} />

        {/* 장식물 */}
        <CactusField />
        <DesertRocks />
        <DesertBones />

        {/* 파티클 효과 */}
        {/*<SandstormEffect />*/}
        <GroundDust />

        {/* 게임 오브젝트 */}
        <PlayerMesh />
        <MonsterList />
        <BulletList />
        <ExplosionList />

        {state === 'playing' && (
          <>
            <GameLogic keysRef={keysRef} playerRotation={playerRotation} />
            <PlayerControls
              keysRef={keysRef}
              onRotationChange={setPlayerRotation}
            />
            <CameraController />
          </>
        )}
      </Canvas>
    </div>
  )
}
