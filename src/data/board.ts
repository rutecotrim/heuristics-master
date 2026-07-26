import type { BoardTile } from '../types/game'

/**
 * 40-tile snake board (10 columns × 4 rows).
 * Even rows left→right, odd rows right→left.
 */
const TILE_DEFS: Omit<BoardTile, 'id'>[] = [
  { type: 'start', label: 'START', icon: 'flag', special: 'none' },
  { type: 'normal', label: 'Path', icon: 'footprints', special: 'none' },
  { type: 'question', label: 'Quiz', icon: 'help-circle', special: 'none' },
  { type: 'normal', label: 'Path', icon: 'circle', special: 'none' },
  { type: 'bonus', label: 'Boost', icon: 'sparkles', special: 'none', description: 'Move forward 1!' },
  { type: 'special', label: 'Fast Track', icon: 'rocket', special: 'fast_track', description: 'Move forward 3!' },
  { type: 'question', label: 'Quiz', icon: 'brain', special: 'none' },
  { type: 'penalty', label: 'Bug', icon: 'bug', special: 'none', description: 'Go back 2!' },
  { type: 'normal', label: 'Path', icon: 'hexagon', special: 'none' },
  { type: 'special', label: 'Lucky UX', icon: 'gift', special: 'lucky_ux', description: 'Play again!' },

  { type: 'question', label: 'Quiz', icon: 'message-circle', special: 'none' },
  { type: 'normal', label: 'Path', icon: 'star', special: 'none' },
  { type: 'special', label: 'Go Back 3', icon: 'undo-2', special: 'go_back_3', description: 'Go back 3 spaces!' },
  { type: 'bonus', label: 'Boost', icon: 'zap', special: 'none', description: 'Move forward 1!' },
  { type: 'question', label: 'Quiz', icon: 'lightbulb', special: 'none' },
  { type: 'normal', label: 'Path', icon: 'compass', special: 'none' },
  { type: 'special', label: 'Auto Save', icon: 'save', special: 'auto_save', description: 'Ignore next penalty!' },
  { type: 'penalty', label: 'Lag', icon: 'wifi-off', special: 'none', description: 'Go back 2!' },
  { type: 'question', label: 'Quiz', icon: 'search', special: 'none' },
  { type: 'normal', label: 'Path', icon: 'target', special: 'none' },

  { type: 'special', label: 'Switch', icon: 'shuffle', special: 'switch_turn', description: 'Turn passes!' },
  { type: 'bonus', label: 'Boost', icon: 'party-popper', special: 'none', description: 'Move forward 1!' },
  { type: 'question', label: 'Quiz', icon: 'book-open', special: 'none' },
  { type: 'special', label: 'Overload', icon: 'dizzy', special: 'cognitive_overload', description: 'Lose one turn!' },
  { type: 'normal', label: 'Path', icon: 'map', special: 'none' },
  { type: 'penalty', label: 'Crash', icon: 'alert-triangle', special: 'none', description: 'Go back 2!' },
  { type: 'question', label: 'Quiz', icon: 'puzzle', special: 'none' },
  { type: 'special', label: 'Go Back 5', icon: 'chevrons-left', special: 'go_back_5', description: 'Go back 5 spaces!' },
  { type: 'normal', label: 'Path', icon: 'layers', special: 'none' },
  { type: 'bonus', label: 'Boost', icon: 'flame', special: 'none', description: 'Move forward 1!' },

  { type: 'question', label: 'Quiz', icon: 'eye', special: 'none' },
  { type: 'special', label: 'UX Disaster', icon: 'bomb', special: 'ux_disaster', description: 'Back to Start!' },
  { type: 'normal', label: 'Path', icon: 'route', special: 'none' },
  { type: 'question', label: 'Quiz', icon: 'clipboard-check', special: 'none' },
  { type: 'penalty', label: '404', icon: 'file-x', special: 'none', description: 'Go back 2!' },
  { type: 'special', label: 'Fast Track', icon: 'rocket', special: 'fast_track', description: 'Move forward 3!' },
  { type: 'bonus', label: 'Boost', icon: 'trophy', special: 'none', description: 'Move forward 1!' },
  { type: 'question', label: 'Quiz', icon: 'graduation-cap', special: 'none' },
  { type: 'normal', label: 'Path', icon: 'gem', special: 'none' },
  { type: 'finish', label: 'FINISH', icon: 'crown', special: 'none' },
]

export const BOARD_COLS = 10
export const BOARD_ROWS = 4
export const FINISH_INDEX = TILE_DEFS.length - 1

export const BOARD_TILES: BoardTile[] = TILE_DEFS.map((tile, id) => ({
  ...tile,
  id,
}))

/** Convert linear board index to grid row/col (snake layout). */
export function indexToGrid(index: number): { row: number; col: number } {
  const row = Math.floor(index / BOARD_COLS)
  const colInRow = index % BOARD_COLS
  const col = row % 2 === 0 ? colInRow : BOARD_COLS - 1 - colInRow
  return { row, col }
}

export function getTile(index: number): BoardTile {
  return BOARD_TILES[Math.max(0, Math.min(index, BOARD_TILES.length - 1))]
}
