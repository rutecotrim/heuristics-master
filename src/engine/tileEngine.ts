import { FINISH_INDEX, getTile } from '../data/board'
import type { PendingTileEffect, Player, SpecialEffect, StatusEffect } from '../types/game'

export function clampPosition(pos: number): number {
  return Math.max(0, Math.min(pos, FINISH_INDEX))
}

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1
}

export interface MoveResult {
  newPosition: number
  reachedFinish: boolean
}

export function applyMove(current: number, steps: number): MoveResult {
  const newPosition = clampPosition(current + steps)
  return {
    newPosition,
    reachedFinish: newPosition >= FINISH_INDEX,
  }
}

export function buildTileEffect(
  position: number,
  player: Player,
): PendingTileEffect | null {
  const tile = getTile(position)

  if (tile.type === 'finish' || tile.type === 'start' || tile.type === 'normal') {
    return null
  }

  if (tile.type === 'bonus') {
    return {
      tileId: tile.id,
      effect: 'bonus',
      title: '🎁 Lucky Boost!',
      message: 'Nice landing! Move forward 1 space.',
      emoji: '✨',
    }
  }

  if (tile.type === 'penalty') {
    if (player.statusEffects.includes('auto_save')) {
      return {
        tileId: tile.id,
        effect: 'penalty',
        title: '💾 Auto Save!',
        message: 'Penalty blocked! Your autosave shield absorbed the hit.',
        emoji: '🛡️',
      }
    }
    return {
      tileId: tile.id,
      effect: 'penalty',
      title: '💥 Bug Encounter!',
      message: 'A sneaky UX bug appears. Go back 2 spaces!',
      emoji: '🐛',
    }
  }

  if (tile.type === 'question') {
    return {
      tileId: tile.id,
      effect: 'question_bonus',
      title: '🧠 Bonus Quiz Tile!',
      message: 'Answer correctly for a free +2 space boost!',
      emoji: '❓',
    }
  }

  if (tile.type === 'special' && tile.special && tile.special !== 'none') {
    return specialEffectPopup(tile.id, tile.special)
  }

  return null
}

function specialEffectPopup(
  tileId: number,
  effect: Exclude<SpecialEffect, 'none'>,
): PendingTileEffect {
  const map: Record<Exclude<SpecialEffect, 'none'>, PendingTileEffect> = {
    go_back_3: {
      tileId,
      effect,
      title: '⬅ Go Back 3',
      message: 'You skipped user testing. Retreat 3 spaces!',
      emoji: '⏪',
    },
    go_back_5: {
      tileId,
      effect,
      title: '⬅ Go Back 5',
      message: 'Dark pattern detected! Fall back 5 spaces.',
      emoji: '⏪',
    },
    ux_disaster: {
      tileId,
      effect,
      title: '💥 UX Disaster',
      message: 'You forgot to implement autosave. Back to Start!',
      emoji: '💣',
    },
    switch_turn: {
      tileId,
      effect,
      title: '🔄 Switch Turn',
      message: 'Stakeholder meeting! Your turn ends immediately.',
      emoji: '🔀',
    },
    lucky_ux: {
      tileId,
      effect,
      title: '🎁 Lucky UX',
      message: 'Users love your redesign! Play again!',
      emoji: '🎉',
    },
    fast_track: {
      tileId,
      effect,
      title: '🚀 Fast Track',
      message: 'Ship it! Zoom forward 3 spaces.',
      emoji: '🚀',
    },
    auto_save: {
      tileId,
      effect,
      title: '💾 Auto Save',
      message: 'Shield activated! Ignore your next penalty.',
      emoji: '💾',
    },
    cognitive_overload: {
      tileId,
      effect,
      title: '😵 Cognitive Overload',
      message: 'Too many modals! You lose your next turn.',
      emoji: '😵',
    },
  }

  return map[effect]
}

export interface EffectApplication {
  position: number
  statusEffects: StatusEffect[]
  passTurn: boolean
  playAgain: boolean
  consumeAutoSave: boolean
  extraMove: number
  needsBonusQuestion: boolean
}

export function applyTileEffectResult(
  player: Player,
  effect: PendingTileEffect['effect'],
): EffectApplication {
  const statusEffects = [...player.statusEffects]
  let position = player.position
  let passTurn = true
  let playAgain = false
  let consumeAutoSave = false
  let extraMove = 0
  let needsBonusQuestion = false

  switch (effect) {
    case 'bonus':
      extraMove = 1
      break
    case 'penalty':
      if (statusEffects.includes('auto_save')) {
        consumeAutoSave = true
      } else {
        position = clampPosition(position - 2)
      }
      break
    case 'question_bonus':
      needsBonusQuestion = true
      passTurn = false
      break
    case 'go_back_3':
      position = clampPosition(position - 3)
      break
    case 'go_back_5':
      position = clampPosition(position - 5)
      break
    case 'ux_disaster':
      position = 0
      break
    case 'switch_turn':
      passTurn = true
      break
    case 'lucky_ux':
      playAgain = true
      passTurn = false
      break
    case 'fast_track':
      extraMove = 3
      break
    case 'auto_save':
      if (!statusEffects.includes('auto_save')) {
        statusEffects.push('auto_save')
      }
      break
    case 'cognitive_overload':
      if (!statusEffects.includes('skip_turn')) {
        statusEffects.push('skip_turn')
      }
      break
    default:
      break
  }

  if (consumeAutoSave) {
    const idx = statusEffects.indexOf('auto_save')
    if (idx >= 0) statusEffects.splice(idx, 1)
  }

  return {
    position: clampPosition(position + extraMove),
    statusEffects,
    passTurn,
    playAgain,
    consumeAutoSave,
    extraMove,
    needsBonusQuestion,
  }
}

export function hasReachedFinish(position: number): boolean {
  return position >= FINISH_INDEX
}
