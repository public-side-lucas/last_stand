import { create } from 'zustand'
import type { Monster } from './types'

interface MonsterStore {
  monsters: Monster[]
  addMonster: (monster: Monster) => void
  removeMonster: (id: string) => void
  updateMonsterPosition: (id: string, position: { x: number; y: number; z: number }) => void
  damageMonster: (id: string, damage: number) => void
  clearMonsters: () => void
}

export const useMonsterStore = create<MonsterStore>((set) => ({
  monsters: [],
  addMonster: (monster) =>
    set((state) => ({ monsters: [...state.monsters, monster] })),
  removeMonster: (id) =>
    set((state) => ({ monsters: state.monsters.filter((m) => m.id !== id) })),
  updateMonsterPosition: (id, position) =>
    set((state) => ({
      monsters: state.monsters.map((m) =>
        m.id === id ? { ...m, position } : m
      ),
    })),
  damageMonster: (id, damage) =>
    set((state) => ({
      monsters: state.monsters
        .map((m) => (m.id === id ? { ...m, health: m.health - damage } : m))
        .filter((m) => m.health > 0),
    })),
  clearMonsters: () => set({ monsters: [] }),
}))
