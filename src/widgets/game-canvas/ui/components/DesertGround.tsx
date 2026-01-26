import { useMemo } from 'react'
import * as THREE from 'three'

// 공유 머티리얼 (싱글톤)
const groundMaterial = new THREE.MeshStandardMaterial({
  color: '#d4a574',
  roughness: 0.9,
  metalness: 0.1,
})

const hillMaterial = new THREE.MeshStandardMaterial({
  color: '#c4956a',
  flatShading: true,
  roughness: 1,
})

/**
 * 최적화된 서부 사막 스타일 지면
 * - 절차적 텍스처 제거 (단색 사용)
 * - 언덕 수 감소
 */
export const DesertGround = () => {
  return (
    <group>
      {/* 메인 지면 */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.5} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <primitive object={groundMaterial} attach="material" />
      </mesh>

      {/* 먼 산/언덕 (배경) */}
      <DesertHills />

      {/* 하늘 그라데이션 */}
      <DesertSky />
    </group>
  )
}

/**
 * 최적화된 먼 산/언덕 배경
 * - 언덕 수 감소 (12 → 8)
 * - InstancedMesh 사용
 */
const DesertHills = () => {
  const hillCount = 8
  const meshRef = useMemo(() => {
    const hills: Array<{ x: number; z: number; scale: number; height: number }> =
      []

    for (let i = 0; i < hillCount; i++) {
      const angle = (i / hillCount) * Math.PI * 2
      const distance = 55 + Math.random() * 15
      hills.push({
        x: Math.cos(angle) * distance,
        z: Math.sin(angle) * distance,
        scale: 10 + Math.random() * 8,
        height: 4 + Math.random() * 4,
      })
    }

    return hills
  }, [])

  const coneGeometry = useMemo(() => new THREE.ConeGeometry(1, 1, 5), [])

  return (
    <>
      {meshRef.map((hill, i) => (
        <mesh
          key={i}
          position={[hill.x, hill.height / 2 - 0.5, hill.z]}
          geometry={coneGeometry}
          material={hillMaterial}
          scale={[hill.scale, hill.height, hill.scale]}
        />
      ))}
    </>
  )
}

/**
 * 최적화된 사막 하늘 (단순 그라데이션)
 */
const DesertSky = () => {
  const skyMaterial = useMemo(() => {
    // 간단한 그라데이션 텍스처 (한 번만 생성)
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 128
    const ctx = canvas.getContext('2d')!

    const gradient = ctx.createLinearGradient(0, 0, 0, 128)
    gradient.addColorStop(0, '#87ceeb')
    gradient.addColorStop(0.4, '#f4d03f')
    gradient.addColorStop(0.7, '#e59866')
    gradient.addColorStop(1, '#d4a574')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 2, 128)

    const texture = new THREE.CanvasTexture(canvas)
    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
    })
  }, [])

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[90, 16, 16]} />
      <primitive object={skyMaterial} attach="material" />
    </mesh>
  )
}
