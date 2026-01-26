import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'

// 공유 지오메트리
const boxGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4)
const rockGeometry = new THREE.DodecahedronGeometry(1, 0)

// 공유 머티리얼
const cactusMaterial = new THREE.MeshStandardMaterial({
  color: '#2e7d32',
  flatShading: true,
})
const rockMaterial = new THREE.MeshStandardMaterial({
  color: '#a67c52',
  flatShading: true,
  roughness: 0.9,
})
const boneMaterial = new THREE.MeshStandardMaterial({
  color: '#f5f5dc',
  roughness: 0.8,
})

interface CactusData {
  x: number
  z: number
  scale: number
  height: number
}

/**
 * InstancedMesh를 사용한 최적화된 선인장 필드
 * 기존: ~300 draw calls → 최적화: 1 draw call
 */
export const CactusField = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const cacti = useMemo<CactusData[]>(() => {
    const positions: CactusData[] = []
    const minDistanceFromCenter = 8

    for (let i = 0; i < 15; i++) {
      let x, z
      do {
        x = (Math.random() - 0.5) * 50
        z = (Math.random() - 0.5) * 50
      } while (Math.sqrt(x * x + z * z) < minDistanceFromCenter)

      positions.push({
        x,
        z,
        scale: 0.8 + Math.random() * 0.4,
        height: 3 + Math.random() * 2,
      })
    }

    return positions
  }, [])

  // 인스턴스 매트릭스 설정
  useEffect(() => {
    if (!meshRef.current) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3()

    let instanceIndex = 0

    cacti.forEach((cactus) => {
      // 메인 몸통 (여러 블록으로 쌓기)
      const blocks = Math.floor(cactus.height / 0.4)
      for (let y = 0; y < blocks; y++) {
        position.set(cactus.x, y * 0.4 + 0.2, cactus.z)
        scale.set(cactus.scale, cactus.scale, cactus.scale)
        matrix.compose(position, quaternion, scale)
        meshRef.current!.setMatrixAt(instanceIndex++, matrix)
      }
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  }, [cacti])

  // 최대 인스턴스 수 계산
  const maxInstances = useMemo(() => {
    return cacti.reduce((sum, c) => sum + Math.floor(c.height / 0.4), 0)
  }, [cacti])

  return (
    <instancedMesh
      ref={meshRef}
      args={[boxGeometry, cactusMaterial, maxInstances]}
      castShadow
      receiveShadow
    />
  )
}

/**
 * InstancedMesh를 사용한 최적화된 바위
 * 기존: 40 draw calls → 최적화: 1 draw call
 */
export const DesertRocks = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const rockCount = 25 // 40 → 25로 감소

  const rocks = useMemo(() => {
    const positions: Array<{
      x: number
      z: number
      scale: number
      rotation: number
    }> = []

    for (let i = 0; i < rockCount; i++) {
      positions.push({
        x: (Math.random() - 0.5) * 60,
        z: (Math.random() - 0.5) * 60,
        scale: 0.15 + Math.random() * 0.25,
        rotation: Math.random() * Math.PI * 2,
      })
    }

    return positions
  }, [])

  useEffect(() => {
    if (!meshRef.current) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const euler = new THREE.Euler()
    const scale = new THREE.Vector3()

    rocks.forEach((rock, i) => {
      position.set(rock.x, rock.scale * 0.3, rock.z)
      euler.set(0, rock.rotation, 0)
      quaternion.setFromEuler(euler)
      scale.set(rock.scale, rock.scale, rock.scale)
      matrix.compose(position, quaternion, scale)
      meshRef.current!.setMatrixAt(i, matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  }, [rocks])

  return (
    <instancedMesh
      ref={meshRef}
      args={[rockGeometry, rockMaterial, rockCount]}
    />
  )
}

/**
 * 단순화된 해골 장식
 * 기존: 32 meshes → 최적화: 5개만 유지
 */
export const DesertBones = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const boneCount = 5

  const bones = useMemo(() => {
    const positions: Array<{ x: number; z: number }> = []

    for (let i = 0; i < boneCount; i++) {
      let x: number, z: number
      do {
        x = (Math.random() - 0.5) * 40
        z = (Math.random() - 0.5) * 40
      } while (Math.sqrt(x * x + z * z) < 12)

      positions.push({ x, z })
    }

    return positions
  }, [])

  useEffect(() => {
    if (!meshRef.current) return

    const matrix = new THREE.Matrix4()
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scale = new THREE.Vector3(0.25, 0.25, 0.25)

    bones.forEach((bone, i) => {
      position.set(bone.x, 0.15, bone.z)
      matrix.compose(position, quaternion, scale)
      meshRef.current!.setMatrixAt(i, matrix)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
  }, [bones])

  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(1, 6, 6), [])

  return (
    <instancedMesh
      ref={meshRef}
      args={[sphereGeometry, boneMaterial, boneCount]}
    />
  )
}
