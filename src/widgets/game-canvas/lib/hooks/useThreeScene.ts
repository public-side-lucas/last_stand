import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { usePlayerStore } from '@/entities/player'
import { COLORS, GAME_CONFIG } from '@/shared/config/constants'
import { createHealthBar, HEALTH_BAR_WIDTH } from '@/shared/lib/three'

interface UseThreeSceneReturn {
  sceneRef: React.MutableRefObject<THREE.Scene | undefined>
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | undefined>
  rendererRef: React.MutableRefObject<THREE.WebGLRenderer | undefined>
  playerMeshRef: React.MutableRefObject<THREE.Mesh | undefined>
}

export const useThreeScene = (
  containerRef: React.RefObject<HTMLDivElement | null>
): UseThreeSceneReturn => {
  const sceneRef = useRef<THREE.Scene | undefined>(undefined)
  const cameraRef = useRef<THREE.PerspectiveCamera | undefined>(undefined)
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined)
  const playerMeshRef = useRef<THREE.Mesh | undefined>(undefined)

  const { setPlayer } = usePlayerStore()

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 15, 15)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer
    containerRef.current.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 7.5)
    scene.add(directionalLight)

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100)
    const groundMaterial = new THREE.MeshStandardMaterial({ color: COLORS.GROUND, side: THREE.DoubleSide })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.5
    scene.add(ground)

    // Player mesh
    const playerGeometry = new THREE.ConeGeometry(0.5, 1, 3)
    const playerMaterial = new THREE.MeshStandardMaterial({ color: COLORS.PLAYER })
    const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial)
    playerMesh.position.set(0, 0, 0)
    scene.add(playerMesh)
    playerMeshRef.current = playerMesh

    // Player health bar
    const { background: playerHealthBg, fill: playerHealthFill } = createHealthBar()
    const healthBarY = 1.5 // Above the player
    const healthBarX = 0 - HEALTH_BAR_WIDTH / 2
    playerHealthBg.position.set(healthBarX, healthBarY, 0)
    playerHealthFill.position.set(healthBarX, healthBarY, 0.02)
    scene.add(playerHealthBg)
    scene.add(playerHealthFill)

    setPlayer({
      id: 'player',
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      health: GAME_CONFIG.PLAYER_MAX_HEALTH,
      maxHealth: GAME_CONFIG.PLAYER_MAX_HEALTH,
      mesh: playerMesh,
      healthBarBackground: playerHealthBg,
      healthBarFill: playerHealthFill,
    })

    const container = containerRef.current

    return () => {
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [containerRef, setPlayer])

  return { sceneRef, cameraRef, rendererRef, playerMeshRef }
}
