export const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7.5]} intensity={0.8} />
    </>
  )
}
