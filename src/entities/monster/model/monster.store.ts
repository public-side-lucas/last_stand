import { create } from 'zustand'
import type { Monster } from './types'

interface MonsterStore {
  monsters: Monster[]
  addMonster: (monster: Monster) => void
  removeMonster: (id: string) => void
  updateMonsterPosition: (
    id: string,
    position: { x: number; y: number; z: number }
  ) => void
  updateMonsterVelocity: (
    id: string,
    velocity: { x: number; y: number; z: number }
  ) => void
  damageMonster: (id: string, damage: number) => void
  applyKnockback: (
    id: string,
    force: { x: number; y: number; z: number }
  ) => void
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
  updateMonsterVelocity: (id, velocity) =>
    set((state) => ({
      monsters: state.monsters.map((m) =>
        m.id === id ? { ...m, velocity } : m
      ),
    })),
  damageMonster: (id, damage) =>
    set((state) => ({
      monsters: state.monsters
        .map((m) => (m.id === id ? { ...m, health: m.health - damage } : m))
        .filter((m) => m.health > 0),
    })),
  applyKnockback: (id, force) =>
    set((state) => ({
      monsters: state.monsters.map((m) => {
        if (m.id !== id) return m

        // 기존 속도에 넉백 힘을 더함 (또는 위치를 직접 밀어내기)
        // 여기서는 속도를 변경하여 움직임 로직에서 처리되도록 함
        const newVelocity = {
          x: m.velocity.x + force.x,
          y: m.velocity.y + force.y, // 공중으로 띄울 수도 있음
          z: m.velocity.z + force.z,
        }
        return { ...m, velocity: newVelocity }
      }),
    })),
  clearMonsters: () => set({ monsters: [] }),
}))
