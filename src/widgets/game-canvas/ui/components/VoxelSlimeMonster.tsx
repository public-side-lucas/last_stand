import { useMemo } from 'react'
import * as THREE from 'three'

// 공유 지오메트리와 머티리얼 (싱글톤 패턴으로 재사용)
const sharedGeometry = new THREE.BoxGeometry(1, 1, 1)
const sharedMaterials: Record<string, THREE.MeshStandardMaterial> = {}

const getMaterial = (color: string, opacity: number) => {
  const key = `${color}-${opacity}`
  if (!sharedMaterials[key]) {
    sharedMaterials[key] = new THREE.MeshStandardMaterial({
      color,
      transparent: opacity < 1,
      opacity,
    })
  }
  return sharedMaterials[key]
}

interface VoxelSlimeMonsterProps {
  opacity?: number
}

/**
 * 최적화된 복셀 슬라임 몬스터
 * - 지오메트리/머티리얼 공유
 * - useFrame 제거 (부모에서 일괄 처리)
 */
export const VoxelSlimeMonster = ({ opacity = 1 }: VoxelSlimeMonsterProps) => {
  const slimeGreen = '#7cb342'
  const slimeDark = '#558b2f'
  const slimeLight = '#9ccc65'
  const eyeWhite = '#ffffff'
  const eyeBlack = '#1a1a1a'
  const cheekPink = '#f48fb1'

  // 머티리얼 캐싱
  const materials = useMemo(
    () => ({
      green: getMaterial(slimeGreen, opacity),
      dark: getMaterial(slimeDark, opacity),
      light: getMaterial(slimeLight, opacity),
      white: getMaterial(eyeWhite, opacity),
      black: getMaterial(eyeBlack, opacity),
      pink: getMaterial(cheekPink, opacity),
    }),
    [opacity]
  )

  return (
    <group scale={0.4}>
      {/* 몸통 - 단순화 (5개 → 3개) */}
      <mesh position={[0, 0.5, 0]} geometry={sharedGeometry} material={materials.green} scale={[1, 1, 1]} />
      <mesh position={[0, 1, 0]} geometry={sharedGeometry} material={materials.light} scale={[0.7, 0.5, 0.7]} />
      <mesh position={[0, 0.1, 0]} geometry={sharedGeometry} material={materials.dark} scale={[0.9, 0.2, 0.9]} />

      {/* 눈 (4개 → 2개로 단순화) */}
      <mesh position={[-0.2, 0.7, 0.5]} geometry={sharedGeometry} material={materials.white} scale={[0.25, 0.3, 0.1]} />
      <mesh position={[0.2, 0.7, 0.5]} geometry={sharedGeometry} material={materials.white} scale={[0.25, 0.3, 0.1]} />

      {/* 눈동자 */}
      <mesh position={[-0.2, 0.68, 0.55]} geometry={sharedGeometry} material={materials.black} scale={[0.12, 0.15, 0.05]} />
      <mesh position={[0.2, 0.68, 0.55]} geometry={sharedGeometry} material={materials.black} scale={[0.12, 0.15, 0.05]} />

      {/* 볼터치 */}
      <mesh position={[-0.4, 0.5, 0.35]} geometry={sharedGeometry} material={materials.pink} scale={[0.1, 0.1, 0.1]} />
      <mesh position={[0.4, 0.5, 0.35]} geometry={sharedGeometry} material={materials.pink} scale={[0.1, 0.1, 0.1]} />
    </group>
  )
}
