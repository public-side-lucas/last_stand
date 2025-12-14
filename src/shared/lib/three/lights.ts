import * as THREE from 'three'

export const createLights = (): THREE.Light[] => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 10, 7.5)

  return [ambientLight, directionalLight]
}
