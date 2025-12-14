import { useRef } from 'react'
import { useGameLoop } from '../lib/useGameLoop'

export const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useGameLoop(containerRef)

  return <div ref={containerRef} className="w-full h-full" />
}
