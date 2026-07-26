import {
  AlertTriangle,
  Bomb,
  BookOpen,
  Brain,
  Bug,
  ChevronsLeft,
  Circle,
  ClipboardCheck,
  Compass,
  Crown,
  BrainCircuit,
  Eye,
  FileX,
  Flag,
  Flame,
  Footprints,
  Gem,
  Gift,
  GraduationCap,
  HelpCircle,
  Hexagon,
  Layers,
  Lightbulb,
  Map,
  MessageCircle,
  PartyPopper,
  Puzzle,
  Rocket,
  Route,
  Save,
  Search,
  Shuffle,
  Sparkles,
  Star,
  Target,
  Trophy,
  Undo2,
  WifiOff,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { BoardTile } from '../types/game'
import type { Player } from '../types/game'

const ICONS: Record<string, LucideIcon> = {
  flag: Flag,
  footprints: Footprints,
  'help-circle': HelpCircle,
  circle: Circle,
  sparkles: Sparkles,
  rocket: Rocket,
  brain: Brain,
  bug: Bug,
  hexagon: Hexagon,
  gift: Gift,
  'message-circle': MessageCircle,
  star: Star,
  'undo-2': Undo2,
  zap: Zap,
  lightbulb: Lightbulb,
  compass: Compass,
  save: Save,
  'wifi-off': WifiOff,
  search: Search,
  target: Target,
  shuffle: Shuffle,
  'party-popper': PartyPopper,
  'book-open': BookOpen,
  dizzy: BrainCircuit,
  map: Map,
  'alert-triangle': AlertTriangle,
  puzzle: Puzzle,
  'chevrons-left': ChevronsLeft,
  layers: Layers,
  flame: Flame,
  eye: Eye,
  bomb: Bomb,
  route: Route,
  'clipboard-check': ClipboardCheck,
  'file-x': FileX,
  trophy: Trophy,
  'graduation-cap': GraduationCap,
  gem: Gem,
  crown: Crown,
}

const TYPE_STYLES: Record<
  BoardTile['type'],
  { bg: string; ring: string; icon: string }
> = {
  start: {
    bg: 'from-[#c6f15a] to-[#3ecfcf]',
    ring: 'ring-white/50',
    icon: 'text-ink',
  },
  finish: {
    bg: 'from-[#ffb347] to-[#ff7a3c]',
    ring: 'ring-white/50',
    icon: 'text-ink',
  },
  normal: {
    bg: 'from-[#5eb8e8] to-[#2f7fb8]',
    ring: 'ring-white/30',
    icon: 'text-white',
  },
  question: {
    bg: 'from-[#a78bfa] to-[#6d4fd6]',
    ring: 'ring-white/30',
    icon: 'text-white',
  },
  bonus: {
    bg: 'from-[#7ddf9a] to-[#2ea86a]',
    ring: 'ring-white/30',
    icon: 'text-white',
  },
  penalty: {
    bg: 'from-[#f0718a] to-[#c93655]',
    ring: 'ring-white/30',
    icon: 'text-white',
  },
  special: {
    bg: 'from-[#ff9a5c] to-[#e85a1c]',
    ring: 'ring-white/30',
    icon: 'text-white',
  },
}

interface TileProps {
  tile: BoardTile
  playersHere: Player[]
  isHighlighted?: boolean
}

export function Tile({ tile, playersHere, isHighlighted }: TileProps) {
  const style = TYPE_STYLES[tile.type]
  const Icon = ICONS[tile.icon] ?? Circle

  return (
    <motion.div
      layout
      animate={
        isHighlighted
          ? {
              scale: [1, 1.08, 1],
              boxShadow: [
                '0 0 0 rgba(255,201,60,0)',
                '0 0 24px rgba(255,201,60,0.85)',
                '0 0 0 rgba(255,201,60,0)',
              ],
            }
          : { scale: 1 }
      }
      transition={{ duration: 0.45 }}
      className={`relative flex aspect-square flex-col items-center justify-center rounded-[0.7rem] bg-gradient-to-br ${style.bg} ring-2 ${style.ring} shadow-[0_4px_0_rgba(0,0,0,0.2)] sm:rounded-xl`}
      title={tile.description ? `${tile.label}: ${tile.description}` : tile.label}
    >
      <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 ${style.icon}`} strokeWidth={2.5} />
      {(tile.type === 'start' || tile.type === 'finish') && (
        <span className={`font-display mt-0.5 hidden text-[8px] font-extrabold uppercase tracking-wide sm:block md:text-[10px] ${style.icon}`}>
          {tile.label}
        </span>
      )}

      {playersHere.length > 0 && (
        <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
          {playersHere.map((p) => (
            <motion.span
              key={p.id}
              layoutId={`token-${p.id}`}
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] shadow-lg ring-2 ring-parchment sm:h-6 sm:w-6 sm:text-xs"
              style={{ backgroundColor: p.color }}
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
