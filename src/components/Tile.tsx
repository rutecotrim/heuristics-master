import {
  AlertTriangle,
  Bomb,
  Brain,
  Bug,
  Crown,
  Eye,
  FileX,
  Flag,
  Flame,
  Gift,
  HelpCircle,
  Lightbulb,
  PartyPopper,
  Puzzle,
  Search,
  Sparkles,
  WifiOff,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { BoardTile, Player } from '../types/game'

const ICONS: Record<string, LucideIcon> = {
  flag: Flag,
  'help-circle': HelpCircle,
  sparkles: Sparkles,
  brain: Brain,
  bug: Bug,
  gift: Gift,
  zap: Zap,
  lightbulb: Lightbulb,
  'wifi-off': WifiOff,
  search: Search,
  'party-popper': PartyPopper,
  'alert-triangle': AlertTriangle,
  bomb: Bomb,
  eye: Eye,
  'file-x': FileX,
  puzzle: Puzzle,
  flame: Flame,
  crown: Crown,
}

const EVENT_STYLES: Record<
  Exclude<BoardTile['type'], 'normal'>,
  { bg: string; ring: string; glow: string; box: string; icon: string }
> = {
  start: {
    bg: 'from-[#c6f15a] to-[#3ecfcf]',
    ring: 'ring-white/60',
    glow: 'shadow-[0_0_20px_rgba(198,241,90,0.45)]',
    box: 'h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12',
    icon: 'h-4 w-4 sm:h-5 sm:w-5 text-ink',
  },
  finish: {
    bg: 'from-[#ffb347] to-[#ff7a3c]',
    ring: 'ring-white/60',
    glow: 'shadow-[0_0_24px_rgba(255,122,60,0.55)]',
    box: 'h-10 w-10 sm:h-12 sm:w-12 md:h-[3.25rem] md:w-[3.25rem]',
    icon: 'h-4 w-4 sm:h-5 sm:w-5 text-ink',
  },
  question: {
    bg: 'from-[#b794f6] to-[#6d4fd6]',
    ring: 'ring-violet-200/40',
    glow: 'shadow-[0_6px_14px_rgba(109,79,214,0.35)]',
    box: 'h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9',
    icon: 'h-3.5 w-3.5 sm:h-4 sm:w-4 text-white',
  },
  bonus: {
    bg: 'from-[#7ddf9a] to-[#2ea86a]',
    ring: 'ring-emerald-100/40',
    glow: 'shadow-[0_6px_14px_rgba(46,168,106,0.35)]',
    box: 'h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9',
    icon: 'h-3.5 w-3.5 sm:h-4 sm:w-4 text-white',
  },
  penalty: {
    bg: 'from-[#f0718a] to-[#c93655]',
    ring: 'ring-rose-100/40',
    glow: 'shadow-[0_6px_14px_rgba(201,54,85,0.35)]',
    box: 'h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9',
    icon: 'h-3.5 w-3.5 sm:h-4 sm:w-4 text-white',
  },
  special: {
    bg: 'from-[#ff9a5c] to-[#e85a1c]',
    ring: 'ring-orange-100/50',
    glow: 'shadow-[0_8px_18px_rgba(232,90,28,0.45)]',
    box: 'h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11',
    icon: 'h-4 w-4 sm:h-5 sm:w-5 text-white',
  },
}

interface TileProps {
  tile: BoardTile
  boardWidth: number
  boardHeight: number
  playersHere: Player[]
  isHighlighted?: boolean
}

export function Tile({
  tile,
  boardWidth,
  boardHeight,
  playersHere,
  isHighlighted,
}: TileProps) {
  const left = `${(tile.x / boardWidth) * 100}%`
  const top = `${(tile.y / boardHeight) * 100}%`
  const isNormal = tile.type === 'normal'
  const pulse = tile.type === 'special' || tile.type === 'finish'
  const Icon = ICONS[tile.icon]
  const eventStyle =
    tile.type === 'normal' ? null : EVENT_STYLES[tile.type]

  return (
    <motion.div
      layout={false}
      animate={
        isHighlighted
          ? {
              scale: [1, 1.22, 1],
              filter: [
                'drop-shadow(0 0 0 rgba(255,201,60,0))',
                'drop-shadow(0 0 14px rgba(255,201,60,0.95))',
                'drop-shadow(0 0 0 rgba(255,201,60,0))',
              ],
            }
          : pulse
            ? { scale: [1, 1.05, 1] }
            : { scale: 1 }
      }
      transition={
        isHighlighted
          ? { duration: 0.45 }
          : pulse
            ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.3 }
      }
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left, top }}
      title={tile.description ? `${tile.label}: ${tile.description}` : tile.label}
    >
      {isNormal || !eventStyle ? (
        <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-[#e4d9c8] to-[#b8a992] shadow-[0_3px_0_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.55)] ring-2 ring-white/20 sm:h-4 sm:w-4 md:h-[18px] md:w-[18px]" />
      ) : (
        <div
          className={`relative flex items-center justify-center rounded-full bg-gradient-to-br ${eventStyle.bg} ${eventStyle.box} ${eventStyle.glow} ring-2 ${eventStyle.ring}`}
        >
          {Icon && <Icon className={`stroke-[2.5] ${eventStyle.icon}`} />}
          {(tile.type === 'start' || tile.type === 'finish') && (
            <span className="font-display absolute -bottom-4 left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-[8px] font-extrabold uppercase tracking-wide text-parchment/85 sm:block md:text-[10px]">
              {tile.label}
            </span>
          )}
        </div>
      )}

      {playersHere.length > 0 && (
        <div className="absolute -top-6 left-1/2 flex -translate-x-1/2 sm:-top-7">
          {playersHere.map((p, i) => (
            <motion.span
              key={p.id}
              layoutId={`token-${p.id}`}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] shadow-lg ring-2 ring-parchment sm:h-7 sm:w-7 sm:text-sm"
              style={{
                backgroundColor: p.color,
                zIndex: 20 + i,
                marginLeft: i > 0 ? -8 : 0,
              }}
              title={p.name}
            >
              {p.avatar}
            </motion.span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
