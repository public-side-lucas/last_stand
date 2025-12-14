import { create } from 'zustand'
import type { GameState } from './types'

interface GameStore {
  state: GameState
  score: number
  setState: (state: GameState) => void
  addScore: (points: number) => void
  resetGame: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  state: 'menu',
  score: 0,
  setState: (state) => set({ state }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  resetGame: () => set({ state: 'playing', score: 0 }),
}))
