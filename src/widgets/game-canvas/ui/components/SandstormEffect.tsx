import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 공유 머티리얼 (싱글톤)
const dustMaterial = new THREE.PointsMaterial({
  color: '#c4956a',
  size: 0.15,
  transparent: true,
  opacity: 0.4,
  depthWrite: false,
  sizeAttenuation: true,
})

/**
 * 최적화된 바닥 먼지 효과
 * - 파티클 수 감소 (200 → 80)
 * - Date.now() 제거
 * - 공유 머티리얼 사용
 */
export const GroundDust = () => {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 80 // 200 → 80
  const timeRef = useRef(0)

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 2) // x, z만 저장

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = Math.random() * 0.5 + 0.1
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50

      velocities[i * 2] = 0.3 + Math.random() * 0.2 // x velocity
      velocities[i * 2 + 1] = 0.2 + Math.random() * 0.1 // z velocity
    }

    return { positions, velocities }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  useFrame((_, delta) => {
    if (!particlesRef.current) return

    const posArray = particlesRef.current.geometry.attributes.position
      .array as Float32Array

    timeRef.current += delta

    for (let i = 0; i < particleCount; i++) {
      const vx = velocities[i * 2]
      const vz = velocities[i * 2 + 1]

      posArray[i * 3] += vx * delta * 6
      posArray[i * 3 + 1] = Math.abs(Math.sin(timeRef.current * 2 + i * 0.5)) * 0.3 + 0.1
      posArray[i * 3 + 2] += vz * delta * 6

      // 범위 벗어나면 리셋
      if (posArray[i * 3] > 25) {
        posArray[i * 3] = -25
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 50
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={particlesRef} geometry={geometry} material={dustMaterial} />
  )
}

/**
 * 모래바람 효과 (선택적 - 성능 여유 있을 때만 사용)
 */
export const SandstormEffect = () => {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 150 // 500 → 150

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60
      positions[i * 3 + 1] = Math.random() * 6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60

      velocities[i * 3] = 0.4 + Math.random() * 0.2
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.05
      velocities[i * 3 + 2] = 0.2 + Math.random() * 0.1
    }

    return { positions, velocities }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: '#d4a574',
        size: 0.18,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    []
  )

  useFrame((_, delta) => {
    if (!particlesRef.current) return

    const posArray = particlesRef.current.geometry.attributes.position
      .array as Float32Array

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3
      posArray[idx] += velocities[idx] * delta * 8
      posArray[idx + 1] += velocities[idx + 1] * delta * 8
      posArray[idx + 2] += velocities[idx + 2] * delta * 8

      if (posArray[idx] > 30) {
        posArray[idx] = -30
        posArray[idx + 1] = Math.random() * 6
        posArray[idx + 2] = (Math.random() - 0.5) * 60
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return <points ref={particlesRef} geometry={geometry} material={material} />
}
