/** Sound-ready hooks — wire Web Audio / Howler later without changing callers. */

type SoundName =
  | 'click'
  | 'dice'
  | 'correct'
  | 'wrong'
  | 'move'
  | 'special'
  | 'win'
  | 'whoosh'

const ENABLED = false

export function playSound(_name: SoundName): void {
  if (!ENABLED) return
  // Placeholder for future audio assets
}

export function useSound() {
  return { playSound }
}
