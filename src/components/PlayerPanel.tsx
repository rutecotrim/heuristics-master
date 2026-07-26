import { motion } from 'framer-motion'
import { Shield, Ban } from 'lucide-react'
import type { Player } from '../types/game'

interface PlayerPanelProps {
  player: Player
  isActive: boolean
  side: 'left' | 'right'
}

export function PlayerPanel({ player, isActive, side }: PlayerPanelProps) {
  return (
    <motion.div
      animate={
        isActive
          ? {
              boxShadow: [
                `0 0 0 0 ${player.color}00`,
                `0 0 0 4px ${player.color}aa`,
                `0 0 24px 4px ${player.color}66`,
                `0 0 0 4px ${player.color}aa`,
              ],
            }
          : { boxShadow: '0 0 0 0 transparent' }
      }
      transition={isActive ? { duration: 1.6, repeat: Infinity } : { duration: 0.3 }}
      className={`glass-strong relative w-full max-w-[200px] rounded-2xl p-4 ${
        isActive ? 'scale-[1.02]' : 'opacity-80'
      }`}
    >
      {isActive && (
        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-900 shadow"
        >
          Your turn
        </motion.span>
      )}

      <div className={`flex items-center gap-3 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
        <motion.div
          whileHover={{ rotate: [-5, 5, 0] }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-inner"
          style={{ backgroundColor: `${player.color}33`, border: `2px solid ${player.color}` }}
        >
          {player.avatar}
        </motion.div>
        <div className={side === 'right' ? 'text-right' : ''}>
          <p className="font-display text-lg font-bold text-white">{player.name}</p>
          <p className="text-xs text-sky-200/70">Tile {player.position}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {player.statusEffects.length === 0 && (
          <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] text-sky-200/50">
            No effects
          </span>
        )}
        {player.statusEffects.includes('auto_save') && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-200">
            <Shield className="h-3 w-3" /> Auto Save
          </span>
        )}
        {player.statusEffects.includes('skip_turn') && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/20 px-2 py-1 text-[10px] font-semibold text-rose-200">
            <Ban className="h-3 w-3" /> Skip next
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-white/5 px-2 py-1.5">
          <p className="text-[10px] text-sky-200/50">Correct</p>
          <p className="font-display font-bold text-mint">{player.correctAnswers}</p>
        </div>
        <div className="rounded-xl bg-white/5 px-2 py-1.5">
          <p className="text-[10px] text-sky-200/50">Asked</p>
          <p className="font-display font-bold text-white">{player.totalAnswers}</p>
        </div>
      </div>
    </motion.div>
  )
}
