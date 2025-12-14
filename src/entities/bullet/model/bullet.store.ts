import { create } from 'zustand'
import type { Bullet } from './types'

interface BulletStore {
  bullets: Bullet[]
  addBullet: (bullet: Bullet) => void
  removeBullet: (id: string) => void
  updateBulletPosition: (id: string, position: { x: number; y: number; z: number }) => void
  clearBullets: () => void
}

export const useBulletStore = create<BulletStore>((set) => ({
  bullets: [],
  addBullet: (bullet) =>
    set((state) => ({ bullets: [...state.bullets, bullet] })),
  removeBullet: (id) =>
    set((state) => ({ bullets: state.bullets.filter((b) => b.id !== id) })),
  updateBulletPosition: (id, position) =>
    set((state) => ({
      bullets: state.bullets.map((b) =>
        b.id === id ? { ...b, position } : b
      ),
    })),
  clearBullets: () => set({ bullets: [] }),
}))
