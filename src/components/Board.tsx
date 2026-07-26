import { BOARD_COLS, BOARD_ROWS, BOARD_TILES, indexToGrid } from '../data/board'
import type { Player } from '../types/game'
import { Tile } from './Tile'

interface BoardProps {
  players: [Player, Player]
  highlightIndex?: number | null
}

export function Board({ players, highlightIndex }: BoardProps) {
  const grid: (typeof BOARD_TILES)[number][][] = Array.from({ length: BOARD_ROWS }, () =>
    Array(BOARD_COLS).fill(null),
  )

  BOARD_TILES.forEach((tile) => {
    const { row, col } = indexToGrid(tile.id)
    grid[row][col] = tile
  })

  return (
    <div className="board-felt w-full overflow-hidden rounded-[1.75rem] p-3 sm:p-4 md:p-5">
      <div
        className="grid gap-1.5 sm:gap-2"
        style={{
          gridTemplateColumns: `repeat(${BOARD_COLS}, minmax(0, 1fr))`,
        }}
      >
        {grid.flatMap((row, ri) =>
          row.map((tile, ci) => {
            if (!tile) return <div key={`${ri}-${ci}`} />
            const playersHere = players.filter((p) => p.position === tile.id)
            return (
              <Tile
                key={tile.id}
                tile={tile}
                playersHere={playersHere}
                isHighlighted={highlightIndex === tile.id}
              />
            )
          }),
        )}
      </div>

      <div className="mt-3 flex justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-parchment/40 sm:text-xs">
        <span>→ Start</span>
        <span>Snake path</span>
        <span>Finish 🏆 ←</span>
      </div>
    </div>
  )
}
