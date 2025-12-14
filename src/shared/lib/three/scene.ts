import * as THREE from 'three'

export const createScene = (): THREE.Scene => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  return scene
}

export const createGround = (): THREE.Mesh => {
  const geometry = new THREE.PlaneGeometry(100, 100)
  const material = new THREE.MeshStandardMaterial({
    color: 0x808080,
    side: THREE.DoubleSide,
  })
  const ground = new THREE.Mesh(geometry, material)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.5
  return ground
}
