import type { BoardTile, SpecialEffect, TileType } from '../types/game'

/** Logical board canvas size — tiles use absolute (x, y) in this space. */
export const BOARD_WIDTH = 1000
export const BOARD_HEIGHT = 640

type PathPoint = {
  x: number
  y: number
  type: TileType
  special?: SpecialEffect
  label: string
  icon: string
  description?: string
}

/**
 * Handcrafted winding path — classic board-game journey, not a grid.
 * Distribution (40 tiles):
 * - 1 Start + 1 Finish + 22 Normal = 24 no-effect pacing tiles
 * - 6 Question · 4 Bonus · 4 Penalty · 2 Special
 */
const PATH: PathPoint[] = [
  // START — bottom-left trailhead
  { x: 72, y: 560, type: 'start', label: 'START', icon: 'flag' },
  { x: 128, y: 575, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 185, y: 555, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 245, y: 570, type: 'question', label: 'Quiz', icon: 'help-circle' },
  { x: 305, y: 545, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 365, y: 560, type: 'bonus', label: 'Boost', icon: 'sparkles', description: 'Move forward 1!' },
  { x: 425, y: 540, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 485, y: 555, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 545, y: 535, type: 'penalty', label: 'Bug', icon: 'bug', description: 'Go back 2!' },
  { x: 605, y: 550, type: 'normal', label: 'Path', icon: 'circle' },
  // Curve up the right side
  { x: 660, y: 520, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 705, y: 475, type: 'question', label: 'Quiz', icon: 'brain' },
  { x: 735, y: 420, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 755, y: 360, type: 'special', label: 'Lucky UX', icon: 'gift', special: 'lucky_ux', description: 'Play again!' },
  { x: 740, y: 300, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 700, y: 255, type: 'bonus', label: 'Boost', icon: 'zap', description: 'Move forward 1!' },
  // Sweep left across the middle
  { x: 640, y: 230, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 575, y: 245, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 515, y: 225, type: 'question', label: 'Quiz', icon: 'lightbulb' },
  { x: 455, y: 245, type: 'penalty', label: 'Lag', icon: 'wifi-off', description: 'Go back 2!' },
  { x: 395, y: 220, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 335, y: 240, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 275, y: 215, type: 'bonus', label: 'Boost', icon: 'flame', description: 'Move forward 1!' },
  { x: 215, y: 235, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 160, y: 210, type: 'question', label: 'Quiz', icon: 'search' },
  // Loop up left, then toward finish
  { x: 120, y: 165, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 105, y: 110, type: 'penalty', label: 'Crash', icon: 'alert-triangle', description: 'Go back 2!' },
  { x: 145, y: 70, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 205, y: 55, type: 'special', label: 'UX Disaster', icon: 'bomb', special: 'ux_disaster', description: 'Back to Start!' },
  { x: 270, y: 70, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 335, y: 50, type: 'question', label: 'Quiz', icon: 'eye' },
  { x: 400, y: 68, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 465, y: 48, type: 'bonus', label: 'Boost', icon: 'party-popper', description: 'Move forward 1!' },
  { x: 530, y: 65, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 595, y: 45, type: 'penalty', label: '404', icon: 'file-x', description: 'Go back 2!' },
  { x: 660, y: 62, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 725, y: 50, type: 'question', label: 'Quiz', icon: 'puzzle' },
  { x: 790, y: 70, type: 'normal', label: 'Path', icon: 'circle' },
  { x: 850, y: 95, type: 'normal', label: 'Path', icon: 'circle' },
  // FINISH — top-right peak
  { x: 915, y: 130, type: 'finish', label: 'FINISH', icon: 'crown' },
]

export const BOARD_PATH = PATH

export const FINISH_INDEX = PATH.length - 1

export const BOARD_TILES: BoardTile[] = PATH.map((point, id) => ({
  id,
  x: point.x,
  y: point.y,
  type: point.type,
  special: point.special ?? 'none',
  label: point.label,
  icon: point.icon,
  description: point.description,
}))

export function getTile(index: number): BoardTile {
  return BOARD_TILES[Math.max(0, Math.min(index, BOARD_TILES.length - 1))]
}

/** Smooth Catmull-Rom trail through every stepping stone. */
export function buildSmoothTrailPath(): string {
  const pts = BOARD_TILES
  if (pts.length < 2) return ''

  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}
