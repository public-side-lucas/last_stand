import * as THREE from 'three'

export interface HealthBarMeshes {
  background: THREE.Mesh
  fill: THREE.Mesh
}

export const HEALTH_BAR_WIDTH = 1

export const createHealthBar = (): HealthBarMeshes => {
  const barWidth = HEALTH_BAR_WIDTH
  const barHeight = 0.1
  const barDepth = 0.01

  // Background (red)
  const backgroundGeometry = new THREE.BoxGeometry(barWidth, barHeight, barDepth)
  backgroundGeometry.translate(barWidth / 2, 0, 0) // Move pivot to left edge
  const backgroundMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial)

  // Fill (green)
  const fillGeometry = new THREE.BoxGeometry(barWidth, barHeight, barDepth)
  fillGeometry.translate(barWidth / 2, 0, 0) // Move pivot to left edge
  const fillMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  const fill = new THREE.Mesh(fillGeometry, fillMaterial)
  fill.position.z = 0.02 // Slightly in front of background

  return { background, fill }
}

export const updateHealthBarScale = (
  healthBarFill: THREE.Mesh | undefined,
  currentHealth: number,
  maxHealth: number
) => {
  if (!healthBarFill) return

  const healthPercentage = Math.max(0, Math.min(1, currentHealth / maxHealth))
  healthBarFill.scale.x = healthPercentage
  // No position adjustment needed - geometry pivot is at left edge
}
