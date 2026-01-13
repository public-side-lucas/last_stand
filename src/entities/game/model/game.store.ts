import { create } from 'zustand'
import type { GameState } from './types'
import type { PlayerClass } from '@/entities/player'

interface GameStore {
  state: GameState
  score: number
  selectedClass: PlayerClass | null
  setState: (state: GameState) => void
  addScore: (points: number) => void
  selectClass: (playerClass: PlayerClass) => void
  startGame: () => void
  resetGame: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  state: 'menu',
  score: 0,
  selectedClass: null,
  setState: (state) => set({ state }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  selectClass: (playerClass) => set({ selectedClass: playerClass }),
  startGame: () => set({ state: 'characterSelect' }),
  resetGame: () => set({ state: 'characterSelect', score: 0 }),
}))
