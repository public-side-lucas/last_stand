import { useRef, useCallback } from 'react'
import type { CharacterAnimationType } from '../model/animation-types'

interface AnimationState {
  isMoving: boolean
  isShooting: boolean
  animation: CharacterAnimationType
}

export const useCharacterAnimation = () => {
  const stateRef = useRef<AnimationState>({
    isMoving: false,
    isShooting: false,
    animation: 'idle',
  })

  const setMoving = useCallback((moving: boolean) => {
    stateRef.current.isMoving = moving
  }, [])

  const setShooting = useCallback((shooting: boolean) => {
    stateRef.current.isShooting = shooting
  }, [])

  const setAnimation = useCallback((animation: CharacterAnimationType) => {
    stateRef.current.animation = animation
  }, [])

  return {
    stateRef,
    setMoving,
    setShooting,
    setAnimation,
  }
}
