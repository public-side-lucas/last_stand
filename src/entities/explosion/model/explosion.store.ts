import { create } from 'zustand'
import type { Explosion } from './types'

interface ExplosionStore {
  explosions: Explosion[]
  addExplosion: (explosion: Explosion) => void
  removeExplosion: (id: string) => void
  clearExplosions: () => void
}

export const useExplosionStore = create<ExplosionStore>((set) => ({
  explosions: [],
  addExplosion: (explosion) =>
    set((state) => ({ explosions: [...state.explosions, explosion] })),
  removeExplosion: (id) =>
    set((state) => ({
      explosions: state.explosions.filter((e) => e.id !== id),
    })),
  clearExplosions: () => set({ explosions: [] }),
}))