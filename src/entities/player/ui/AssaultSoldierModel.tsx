import { useRef, useMemo } from 'react'
import { Group, Mesh, MeshStandardMaterial } from 'three'
import { useFrame } from '@react-three/fiber'
import type { CharacterAnimationType } from '../model/animation-types'

// 색상 팔레트
const COLORS = {
  helmet: 0x3d3d3d,
  helmetVisor: 0x1a1a2e,
  face: 0xd4a574,
  armor: 0x4a5568,
  armorAccent: 0x2d3748,
  belt: 0x8b4513,
  pants: 0x2d3748,
  boots: 0x1a1a1a,
  weapon: 0x6b7280,
  weaponGlow: 0x60a5fa,
  gold: 0xffd700,
  muzzleFlash: 0xffaa00,
}

interface BoxProps {
  args: [number, number, number]
  color: number
  position?: [number, number, number]
  emissive?: number
  emissiveIntensity?: number
}

const Box = ({ args, color, position = [0, 0, 0], emissive, emissiveIntensity }: BoxProps) => (
  <mesh position={position}>
    <boxGeometry args={args} />
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  </mesh>
)

interface AssaultSoldierModelProps {
  animation?: CharacterAnimationType
  isMoving?: boolean
  isShooting?: boolean
  scale?: number
}

export const AssaultSoldierModel = ({
  animation = 'idle',
  isMoving = false,
  isShooting = false,
  scale = 0.5,
}: AssaultSoldierModelProps) => {
  const groupRef = useRef<Group>(null)
  const helmetRef = useRef<Group>(null)
  const headRef = useRef<Group>(null)
  const torsoRef = useRef<Group>(null)
  const leftShoulderRef = useRef<Group>(null)
  const rightShoulderRef = useRef<Group>(null)
  const leftElbowRef = useRef<Group>(null)
  const rightElbowRef = useRef<Group>(null)
  const leftHipRef = useRef<Group>(null)
  const rightHipRef = useRef<Group>(null)
  const leftKneeRef = useRef<Group>(null)
  const rightKneeRef = useRef<Group>(null)
  const weaponRef = useRef<Group>(null)
  const muzzleFlashRef = useRef<Mesh>(null)
  const glowRef = useRef<Mesh>(null)
  const backpackRef = useRef<Group>(null)

  const animationTimeRef = useRef(0)
  const shootCooldownRef = useRef(0)

  // 글로우 머티리얼
  const glowMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: COLORS.weaponGlow,
        emissive: COLORS.weaponGlow,
        emissiveIntensity: 0.5,
      }),
    []
  )

  // 머즐 플래시 머티리얼
  const muzzleFlashMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: COLORS.muzzleFlash,
        emissive: COLORS.muzzleFlash,
        emissiveIntensity: 2,
        transparent: true,
        opacity: 0,
      }),
    []
  )

  // 총구를 전방으로 향하게 하는 함수
  const setGunForward = (shoulderRotX: number, elbowRotX: number) => {
    if (weaponRef.current) {
      const totalArmRotation = shoulderRotX + elbowRotX
      weaponRef.current.rotation.x = -totalArmRotation
    }
  }

  useFrame((_, delta) => {
    animationTimeRef.current += delta

    if (shootCooldownRef.current > 0) {
      shootCooldownRef.current -= delta * 3
    }

    // 사격 시 쿨다운 설정
    if (isShooting && shootCooldownRef.current <= 0) {
      shootCooldownRef.current = 1
    }

    const t = animationTimeRef.current

    // 글로우 펄스 효과
    if (glowRef.current) {
      const glowMat = glowRef.current.material as MeshStandardMaterial
      glowMat.emissiveIntensity = 0.5 + Math.sin(t * 3) * 0.3
    }

    if (!groupRef.current) return

    // 현재 애니메이션 결정
    let currentAnim = animation
    if (isMoving && animation !== 'death') {
      currentAnim = 'run'
    }
    if (isShooting && !isMoving && animation !== 'death') {
      currentAnim = 'shoot'
    }

    // 애니메이션 적용
    switch (currentAnim) {
      case 'idle':
        applyIdleAnimation(t)
        break
      case 'walk':
        applyWalkAnimation(t)
        break
      case 'run':
        applyRunAnimation(t)
        break
      case 'shoot':
        applyShootAnimation(t)
        break
      case 'death':
        break
    }
  })

  const applyIdleAnimation = (t: number) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 2) * 0.03
      groupRef.current.rotation.x = 0
    }

    // 왼팔 - 자연스럽게 내림
    if (leftShoulderRef.current) {
      leftShoulderRef.current.rotation.set(0.1, 0, 0.15)
    }
    if (leftElbowRef.current) {
      leftElbowRef.current.rotation.x = -0.2
    }

    // 오른팔 - 총 들고 대기
    if (rightShoulderRef.current) {
      rightShoulderRef.current.rotation.set(-0.4, -0.1, -0.15)
    }
    if (rightElbowRef.current) {
      rightElbowRef.current.rotation.x = -0.8
    }
    setGunForward(-0.4, -0.8)

    // 다리
    if (leftHipRef.current) leftHipRef.current.rotation.set(0, 0, 0)
    if (rightHipRef.current) rightHipRef.current.rotation.set(0, 0, 0)
    if (leftKneeRef.current) leftKneeRef.current.rotation.x = 0
    if (rightKneeRef.current) rightKneeRef.current.rotation.x = 0

    if (torsoRef.current) torsoRef.current.rotation.set(0, 0, 0)
    if (headRef.current) headRef.current.rotation.set(0, 0, 0)
    if (helmetRef.current) helmetRef.current.rotation.set(0, 0, 0)
  }

  const applyWalkAnimation = (t: number) => {
    const speed = 4
    const legSwing = 0.5

    if (groupRef.current) {
      groupRef.current.rotation.x = 0
      groupRef.current.position.y = Math.abs(Math.sin(t * speed * 2)) * 0.05
    }

    // 다리
    if (leftHipRef.current) {
      leftHipRef.current.rotation.x = Math.sin(t * speed) * legSwing
    }
    if (rightHipRef.current) {
      rightHipRef.current.rotation.x = Math.sin(t * speed + Math.PI) * legSwing
    }
    if (leftKneeRef.current) {
      leftKneeRef.current.rotation.x = Math.max(0, -Math.sin(t * speed)) * 0.5
    }
    if (rightKneeRef.current) {
      rightKneeRef.current.rotation.x = Math.max(0, -Math.sin(t * speed + Math.PI)) * 0.5
    }

    // 왼팔만 흔들기
    const leftArmSwing = Math.sin(t * speed + Math.PI) * 0.5
    if (leftShoulderRef.current) {
      leftShoulderRef.current.rotation.x = leftArmSwing
      leftShoulderRef.current.rotation.z = 0.15
    }
    if (leftElbowRef.current) {
      leftElbowRef.current.rotation.x = -0.3 + Math.max(0, Math.sin(t * speed + Math.PI)) * 0.4
    }

    // 오른팔 - 총 들고 전방 유지
    const rightArmBob = Math.sin(t * speed * 2) * 0.05
    if (rightShoulderRef.current) {
      rightShoulderRef.current.rotation.set(-0.5 + rightArmBob, -0.15, -0.2)
    }
    if (rightElbowRef.current) {
      rightElbowRef.current.rotation.x = -0.7
    }
    setGunForward(-0.5 + rightArmBob, -0.7)

    if (torsoRef.current) {
      torsoRef.current.rotation.z = Math.sin(t * speed) * 0.03
    }
  }

  const applyRunAnimation = (t: number) => {
    const speed = 8
    const legSwing = 1.0

    if (groupRef.current) {
      groupRef.current.rotation.x = 0.2
      groupRef.current.position.y = Math.abs(Math.sin(t * speed * 2)) * 0.12
    }

    // 다리
    const leftLegPhase = Math.sin(t * speed)
    const rightLegPhase = Math.sin(t * speed + Math.PI)

    if (leftHipRef.current) {
      leftHipRef.current.rotation.x = leftLegPhase * legSwing
    }
    if (rightHipRef.current) {
      rightHipRef.current.rotation.x = rightLegPhase * legSwing
    }
    if (leftKneeRef.current) {
      leftKneeRef.current.rotation.x = Math.max(0, -leftLegPhase) * 1.5
    }
    if (rightKneeRef.current) {
      rightKneeRef.current.rotation.x = Math.max(0, -rightLegPhase) * 1.5
    }

    // 왼팔 크게 흔들기
    const leftArmPhase = Math.sin(t * speed + Math.PI)
    if (leftShoulderRef.current) {
      leftShoulderRef.current.rotation.x = leftArmPhase * 1.0
      leftShoulderRef.current.rotation.z = 0.25
    }
    if (leftElbowRef.current) {
      leftElbowRef.current.rotation.x = -0.8 - Math.max(0, leftArmPhase) * 0.8
    }

    // 오른팔 - 총 양손으로 잡고 전방 유지
    const runBob = Math.sin(t * speed * 2) * 0.08
    const shoulderX = -0.6 + runBob
    const elbowX = -0.6
    if (rightShoulderRef.current) {
      rightShoulderRef.current.rotation.set(shoulderX, -0.2, -0.25)
    }
    if (rightElbowRef.current) {
      rightElbowRef.current.rotation.x = elbowX
    }
    setGunForward(shoulderX, elbowX)

    if (torsoRef.current) {
      torsoRef.current.rotation.z = Math.sin(t * speed) * 0.06
      torsoRef.current.rotation.y = 0.1
    }

    if (headRef.current) headRef.current.rotation.x = -0.15
    if (helmetRef.current) helmetRef.current.rotation.x = -0.15
  }

  const applyShootAnimation = (t: number) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = 0
      groupRef.current.position.y = 0
    }

    // 사격 자세
    const shoulderX = -1.5
    const elbowX = -0.1

    if (rightShoulderRef.current) {
      rightShoulderRef.current.rotation.set(shoulderX, 0, -0.1)
    }
    if (rightElbowRef.current) {
      rightElbowRef.current.rotation.x = elbowX
    }
    setGunForward(shoulderX, elbowX)

    // 왼팔 - 총 받치기
    if (leftShoulderRef.current) {
      leftShoulderRef.current.rotation.set(-1.3, 0.4, 0.3)
    }
    if (leftElbowRef.current) {
      leftElbowRef.current.rotation.x = -1.5
    }

    // 다리 벌리고 서기
    if (leftHipRef.current) leftHipRef.current.rotation.set(0.1, 0, -0.15)
    if (rightHipRef.current) rightHipRef.current.rotation.set(-0.1, 0, 0.15)
    if (leftKneeRef.current) leftKneeRef.current.rotation.x = 0.15
    if (rightKneeRef.current) rightKneeRef.current.rotation.x = 0.15

    // 반동 효과
    if (shootCooldownRef.current > 0) {
      const recoil = shootCooldownRef.current * 0.15
      if (rightShoulderRef.current) {
        rightShoulderRef.current.rotation.x += recoil
      }
      if (weaponRef.current) {
        weaponRef.current.rotation.x -= recoil
      }
      if (groupRef.current) {
        groupRef.current.position.z = -recoil * 0.08
      }
      if (muzzleFlashRef.current) {
        muzzleFlashMaterial.opacity = shootCooldownRef.current > 0.5 ? 1 : 0
      }
    } else {
      muzzleFlashMaterial.opacity = 0
    }

    // 호흡 흔들림
    if (torsoRef.current) {
      torsoRef.current.rotation.x = Math.sin(t * 4) * 0.005
    }
    if (headRef.current) headRef.current.rotation.set(0, 0, 0)
    if (helmetRef.current) helmetRef.current.rotation.set(0, 0, 0)
  }

  return (
    <group ref={groupRef} scale={scale}>
      {/* 헬멧 */}
      <group ref={helmetRef} position={[0, 2.1, 0]}>
        <Box args={[1.1, 0.9, 1.1]} color={COLORS.helmet} />
        <Box args={[0.8, 0.3, 0.05]} color={COLORS.helmetVisor} position={[0, -0.1, 0.56]} />
        <Box args={[0.3, 0.2, 0.8]} color={COLORS.armorAccent} position={[0, 0.5, 0]} />
      </group>

      {/* 머리 */}
      <group ref={headRef} position={[0, 1.5, 0]}>
        <Box args={[1, 1, 1]} color={COLORS.face} />
        <Box args={[0.15, 0.1, 0.02]} color={0x1a1a1a} position={[-0.2, 0.1, 0.51]} />
        <Box args={[0.15, 0.1, 0.02]} color={0x1a1a1a} position={[0.2, 0.1, 0.51]} />
      </group>

      {/* 몸통 */}
      <group ref={torsoRef} position={[0, 0.25, 0]}>
        <Box args={[1.2, 1.5, 0.7]} color={COLORS.armor} />
        <Box args={[0.8, 0.8, 0.1]} color={COLORS.armorAccent} position={[0, 0.2, 0.36]} />
        <Box args={[1.25, 0.2, 0.75]} color={COLORS.belt} position={[0, -0.6, 0]} />
        <Box args={[0.2, 0.15, 0.05]} color={COLORS.gold} position={[0, -0.6, 0.38]} />
      </group>

      {/* 왼팔 */}
      <group ref={leftShoulderRef} position={[-0.85, 0.65, 0]}>
        {/* 상완 */}
        <group>
          <Box args={[0.4, 0.4, 0.5]} color={COLORS.armorAccent} />
          <Box args={[0.4, 0.6, 0.4]} color={COLORS.armor} position={[0, -0.5, 0]} />

          {/* 팔꿈치 + 하완 */}
          <group ref={leftElbowRef} position={[0, -0.8, 0]}>
            <Box args={[0.35, 0.2, 0.35]} color={COLORS.armorAccent} />
            <Box args={[0.35, 0.5, 0.35]} color={COLORS.armor} position={[0, -0.35, 0]} />
            <Box args={[0.3, 0.2, 0.3]} color={COLORS.armorAccent} position={[0, -0.7, 0]} />
          </group>
        </group>
      </group>

      {/* 오른팔 */}
      <group ref={rightShoulderRef} position={[0.85, 0.65, 0]}>
        {/* 상완 */}
        <group>
          <Box args={[0.4, 0.4, 0.5]} color={COLORS.armorAccent} />
          <Box args={[0.4, 0.6, 0.4]} color={COLORS.armor} position={[0, -0.5, 0]} />

          {/* 팔꿈치 + 하완 */}
          <group ref={rightElbowRef} position={[0, -0.8, 0]}>
            <Box args={[0.35, 0.2, 0.35]} color={COLORS.armorAccent} />
            <Box args={[0.35, 0.5, 0.35]} color={COLORS.armor} position={[0, -0.35, 0]} />
            <Box args={[0.3, 0.2, 0.3]} color={COLORS.armorAccent} position={[0, -0.7, 0]} />

            {/* 무기 */}
            <group ref={weaponRef} position={[0.15, -0.5, 0.3]}>
              <Box args={[0.15, 0.2, 1.2]} color={COLORS.weapon} />
              <Box args={[0.1, 0.1, 0.6]} color={COLORS.armorAccent} position={[0, 0.05, 0.5]} />
              <Box args={[0.1, 0.25, 0.15]} color={COLORS.weapon} position={[0, -0.15, -0.2]} />
              <Box args={[0.12, 0.25, 0.3]} color={COLORS.weapon} position={[0, 0.05, -0.5]} />

              {/* 글로우 */}
              <mesh ref={glowRef} position={[0, 0.05, 0.85]} material={glowMaterial}>
                <boxGeometry args={[0.08, 0.08, 0.1]} />
              </mesh>

              {/* 머즐 플래시 */}
              <mesh ref={muzzleFlashRef} position={[0, 0.05, 1.0]} material={muzzleFlashMaterial}>
                <boxGeometry args={[0.3, 0.3, 0.2]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* 왼다리 */}
      <group ref={leftHipRef} position={[-0.3, -0.5, 0]}>
        {/* 허벅지 */}
        <group>
          <Box args={[0.45, 0.7, 0.45]} color={COLORS.pants} position={[0, -0.35, 0]} />

          {/* 무릎 + 정강이 */}
          <group ref={leftKneeRef} position={[0, -0.7, 0]}>
            <Box args={[0.35, 0.25, 0.2]} color={COLORS.armorAccent} position={[0, 0, 0.1]} />
            <Box args={[0.4, 0.6, 0.4]} color={COLORS.pants} position={[0, -0.4, 0]} />
            <Box args={[0.45, 0.35, 0.55]} color={COLORS.boots} position={[0, -0.85, 0.05]} />
          </group>
        </group>
      </group>

      {/* 오른다리 */}
      <group ref={rightHipRef} position={[0.3, -0.5, 0]}>
        {/* 허벅지 */}
        <group>
          <Box args={[0.45, 0.7, 0.45]} color={COLORS.pants} position={[0, -0.35, 0]} />

          {/* 무릎 + 정강이 */}
          <group ref={rightKneeRef} position={[0, -0.7, 0]}>
            <Box args={[0.35, 0.25, 0.2]} color={COLORS.armorAccent} position={[0, 0, 0.1]} />
            <Box args={[0.4, 0.6, 0.4]} color={COLORS.pants} position={[0, -0.4, 0]} />
            <Box args={[0.45, 0.35, 0.55]} color={COLORS.boots} position={[0, -0.85, 0.05]} />
          </group>
        </group>
      </group>

      {/* 백팩 */}
      <group ref={backpackRef} position={[0, 0.1, -0.55]}>
        <Box args={[0.8, 1, 0.4]} color={COLORS.armorAccent} />
        <Box args={[0.6, 0.25, 0.25]} color={COLORS.armor} position={[0, 0.35, 0.1]} />
        <Box args={[0.2, 0.4, 0.3]} color={COLORS.armor} position={[-0.5, -0.1, 0]} />
        <Box args={[0.2, 0.4, 0.3]} color={COLORS.armor} position={[0.5, -0.1, 0]} />
      </group>
    </group>
  )
}
