/**
 * 최적화된 서부 사막 분위기 조명
 * - 그림자 제거 (성능 향상)
 * - 조명 수 최소화
 */
export const Lights = () => {
  return (
    <>
      {/* 환경광 - 따뜻한 사막 톤 */}
      <ambientLight intensity={0.7} color="#ffecd2" />

      {/* 태양광 - 주광 (그림자 비활성화) */}
      <directionalLight
        position={[20, 30, 10]}
        intensity={1.0}
        color="#fff5e6"
      />

      {/* 지면 반사광 */}
      <hemisphereLight args={['#87ceeb', '#d4a574', 0.3]} />
    </>
  )
}
