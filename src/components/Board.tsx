import {
  BOARD_HEIGHT,
  BOARD_TILES,
  BOARD_WIDTH,
  buildSmoothTrailPath,
} from '../data/board'
import type { Player } from '../types/game'
import { Tile } from './Tile'

interface BoardProps {
  players: Player[]
  highlightIndex?: number | null
}

export function Board({ players, highlightIndex }: BoardProps) {
  const trail = buildSmoothTrailPath()

  return (
    <div className="board-felt w-full overflow-hidden rounded-[1.75rem] p-2 sm:p-3 md:p-4">
      <div
        className="relative mx-auto w-full"
        style={{ aspectRatio: `${BOARD_WIDTH} / ${BOARD_HEIGHT}` }}
      >
        {/* Soft scenic blobs behind the path */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.25rem]"
        >
          <div className="absolute left-[8%] top-[12%] h-[28%] w-[28%] rounded-full bg-lime-pop/10 blur-3xl" />
          <div className="absolute bottom-[18%] right-[10%] h-[32%] w-[30%] rounded-full bg-tangerine/15 blur-3xl" />
          <div className="absolute left-[40%] top-[40%] h-[22%] w-[22%] rounded-full bg-aqua/10 blur-3xl" />
        </div>

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <linearGradient id="trailGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c6f15a" stopOpacity="0.55" />
              <stop offset="45%" stopColor="#3ecfcf" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ff7a3c" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          {/* Soft under-ribbon */}
          <path
            d={trail}
            fill="none"
            stroke="rgba(8, 30, 22, 0.45)"
            strokeWidth="28"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={trail}
            fill="none"
            stroke="url(#trailGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <path
            d={trail}
            fill="none"
            stroke="rgba(244, 239, 228, 0.22)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2 14"
          />
        </svg>

        {BOARD_TILES.map((tile) => {
          const playersHere = players.filter((p) => p.position === tile.id)
          return (
            <Tile
              key={tile.id}
              tile={tile}
              boardWidth={BOARD_WIDTH}
              boardHeight={BOARD_HEIGHT}
              playersHere={playersHere}
              isHighlighted={highlightIndex === tile.id}
            />
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-2 text-[10px] font-bold uppercase tracking-wider text-parchment/45 sm:text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#b8a992]" /> Path
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#6d4fd6]" /> Quiz
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2ea86a]" /> Boost
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c93655]" /> Penalty
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e85a1c]" /> Special
        </span>
      </div>
    </div>
  )
}
