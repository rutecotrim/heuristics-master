import { createUISFX, type CueName } from 'uisfx'

/**
 * Game actions → UI SFX cues (arcade pack).
 * Chosen for a board race + quiz: clear outcomes, light movement, big win.
 */
type SoundName =
  | 'start'
  | 'dice'
  | 'question'
  | 'select'
  | 'correct'
  | 'wrong'
  | 'move'
  | 'reward'
  | 'warn'
  | 'info'
  | 'win'
  | 'leave'
  | 'ui'
  | 'connect'
  | 'disconnect'
  | 'retry'

const SOUND_TO_CUE: Record<SoundName, CueName> = {
  start: 'start',
  dice: 'drop',
  question: 'open',
  select: 'select',
  correct: 'success',
  wrong: 'error',
  move: 'forward',
  reward: 'bonus',
  warn: 'warning',
  info: 'notification',
  win: 'achievement',
  leave: 'stop',
  ui: 'press',
  connect: 'connect',
  disconnect: 'disconnect',
  retry: 'retry',
}

let player: ReturnType<typeof createUISFX> | null = null
let unlocked = false

function getPlayer() {
  if (typeof window === 'undefined') return null
  if (!player) {
    player = createUISFX({
      pack: 'arcade',
      volume: 0.72,
      preferences: { key: 'heuristics-master:sound' },
    })
  }
  return player
}

/** Call from a genuine pointer/keyboard gesture so Web Audio can start. */
export async function unlockSound(): Promise<void> {
  const ui = getPlayer()
  if (!ui || unlocked) return
  try {
    await ui.unlock()
    unlocked = true
  } catch {
    /* Autoplay may still be blocked until another gesture. */
  }
}

export function playSound(name: SoundName): void {
  const ui = getPlayer()
  if (!ui || !ui.isEnabled()) return
  const cue = SOUND_TO_CUE[name]
  if (!unlocked) {
    void ui.unlock().then(() => {
      unlocked = true
    })
  }
  ui.play(cue)
}

export function isSoundEnabled(): boolean {
  return getPlayer()?.isEnabled() ?? true
}

export function setSoundEnabled(enabled: boolean): void {
  const ui = getPlayer()
  if (!ui) return
  if (!enabled) ui.stopAll()
  ui.setEnabled(enabled)
}

export function useSound() {
  return {
    playSound,
    unlockSound,
    isSoundEnabled,
    setSoundEnabled,
  }
}
