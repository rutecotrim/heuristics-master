import type { Player, PlayerId } from '../types/game'

export const MAX_PLAYERS = 4
export const MIN_PLAYERS = 2

export type PlayerCount = 2 | 3 | 4

export const PLAYER_PRESETS: ReadonlyArray<{
  avatar: string
  color: string
  defaultName: string
}> = [
  { avatar: '🦊', color: '#3ecfcf', defaultName: 'Player 1' },
  { avatar: '🦉', color: '#ff7a3c', defaultName: 'Player 2' },
  { avatar: '🐸', color: '#c6f15a', defaultName: 'Player 3' },
  { avatar: '🐙', color: '#e8476b', defaultName: 'Player 4' },
]

export function createPlayer(id: PlayerId, name?: string): Player {
  const preset = PLAYER_PRESETS[id]
  return {
    id,
    name: name?.trim() || preset.defaultName,
    avatar: preset.avatar,
    color: preset.color,
    position: 0,
    statusEffects: [],
    correctAnswers: 0,
    totalAnswers: 0,
    turnsPlayed: 0,
  }
}

export function createPlayers(count: PlayerCount): Player[] {
  return Array.from({ length: count }, (_, i) => createPlayer(i as PlayerId))
}

export function resetPlayerForMatch(player: Player): Player {
  return {
    ...player,
    position: 0,
    statusEffects: [],
    correctAnswers: 0,
    totalAnswers: 0,
    turnsPlayed: 0,
  }
}

export function defaultNameFor(id: PlayerId): string {
  return PLAYER_PRESETS[id].defaultName
}
