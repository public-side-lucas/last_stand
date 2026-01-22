export type CharacterAnimationType = 'idle' | 'walk' | 'run' | 'shoot' | 'death'

export interface AnimationState {
  current: CharacterAnimationType
  time: number
  shootCooldown: number
  deathProgress: number
}

export const ANIMATION_NAMES: Record<CharacterAnimationType, string> = {
  idle: '대기',
  walk: '걷기',
  run: '달리기',
  shoot: '총 쏘기',
  death: '사망',
}
