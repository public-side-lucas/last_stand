import { create } from 'zustand'
import type { Player } from './types'

interface PlayerStore {
  player: Player | null
  setPlayer: (player: Player) => void
  updateRotation: (rotation: number) => void
  updatePosition: (position: { x: number; y: number; z: number }) => void
  damagePlayer: (damage: number) => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  player: null,
  setPlayer: (player) => set({ player }),
  updateRotation: (rotation) =>
    set((state) => ({
      player: state.player ? { ...state.player, rotation } : null,
    })),
  updatePosition: (position) =>
    set((state) => ({
      player: state.player ? { ...state.player, position } : null,
    })),
  damagePlayer: (damage) =>
    set((state) => ({
      player: state.player
        ? { ...state.player, health: Math.max(0, state.player.health - damage) }
        : null,
    })),
}))
