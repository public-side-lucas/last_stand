import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Explosion } from '@/entities/explosion'
import { useExplosionStore } from '@/entities/explosion'

interface ExplosionMeshProps {
  explosion: Explosion
}

export const ExplosionMesh = ({ explosion }: ExplosionMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const removeExplosion = useExplosionStore((state) => state.removeExplosion)

  // 애니메이션 진행도 (0 ~ 1)
  const progressRef = useRef(0)

  // 머티리얼 생성
  const sphereMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      }),
    []
  )

  const ringMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xff3300,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      }),
    []
  )

  useFrame(() => {
    const now = Date.now()
    const elapsed = now - explosion.createdAt
    const progress = Math.min(elapsed / explosion.duration, 1)
    progressRef.current = progress

    if (progress >= 1) {
      removeExplosion(explosion.id)
      return
    }

    // 폭발 구체 애니메이션
    if (meshRef.current) {
      // 빠르게 확장 후 수축
      const expandProgress = Math.min(progress * 3, 1) // 처음 1/3에서 최대 크기
      const shrinkProgress = Math.max((progress - 0.3) / 0.7, 0) // 나머지에서 수축

      const scale =
        explosion.radius * expandProgress * (1 - shrinkProgress * 0.8)
      meshRef.current.scale.setScalar(Math.max(scale, 0.1))

      // 색상 변화: 주황 -> 빨강 -> 검정
      const color = new THREE.Color()
      if (progress < 0.3) {
        color.setHex(0xff6600) // 주황
      } else if (progress < 0.6) {
        color.lerpColors(
          new THREE.Color(0xff6600),
          new THREE.Color(0xff0000),
          (progress - 0.3) / 0.3
        )
      } else {
        color.lerpColors(
          new THREE.Color(0xff0000),
          new THREE.Color(0x331100),
          (progress - 0.6) / 0.4
        )
      }
      sphereMaterial.color = color
      sphereMaterial.opacity = 0.8 * (1 - progress)
    }

    // 바닥 링 애니메이션 (폭발 범위 표시)
    if (ringRef.current) {
      const ringScale = explosion.radius * Math.min(progress * 2, 1)
      ringRef.current.scale.set(ringScale, ringScale, 1)
      ringMaterial.opacity = 0.6 * (1 - progress)
    }
  })

  return (
    <group position={[explosion.position.x, 0.05, explosion.position.z]}>
      {/* 폭발 구체 */}
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <primitive object={sphereMaterial} attach="material" />
      </mesh>

      {/* 바닥 충격파 링 */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <primitive object={ringMaterial} attach="material" />
      </mesh>
    </group>
  )
}