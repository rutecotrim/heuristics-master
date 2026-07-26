import { motion } from 'framer-motion'
import { Shield, Ban } from 'lucide-react'
import type { Player } from '../types/game'

interface PlayerPanelProps {
  player: Player
  isActive: boolean
  side: 'left' | 'right'
  compact?: boolean
}

export function PlayerPanel({ player, isActive, side, compact = false }: PlayerPanelProps) {
  return (
    <motion.div
      animate={
        isActive
          ? {
              boxShadow: [
                `0 0 0 0 ${player.color}00`,
                `0 0 0 3px ${player.color}`,
                `0 0 28px 2px ${player.color}88`,
                `0 0 0 3px ${player.color}`,
              ],
            }
          : { boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }
      }
      transition={isActive ? { duration: 1.6, repeat: Infinity } : { duration: 0.3 }}
      className={`panel relative w-full rounded-2xl ${compact ? 'p-3' : 'p-4'} ${
        isActive ? 'scale-[1.02]' : 'opacity-90'
      }`}
    >
      {isActive && (
        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-tangerine px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink shadow"
        >
          Your turn
        </motion.span>
      )}

      <div className={`flex items-center gap-2.5 ${side === 'right' && !compact ? 'flex-row-reverse' : ''}`}>
        <motion.div
          whileHover={{ rotate: [-5, 5, 0] }}
          className={`flex shrink-0 items-center justify-center rounded-2xl shadow-inner ${
            compact ? 'h-11 w-11 text-2xl' : 'h-14 w-14 text-3xl'
          }`}
          style={{ backgroundColor: `${player.color}55`, border: `2px solid ${player.color}` }}
        >
          {player.avatar}
        </motion.div>
        <div className={side === 'right' && !compact ? 'text-right' : ''}>
          <p className={`font-display font-extrabold text-ink ${compact ? 'text-sm' : 'text-lg'}`}>
            {player.name}
          </p>
          <p className="text-xs font-semibold text-ink-muted">Tile {player.position}</p>
        </div>
      </div>

      {!compact && (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {player.statusEffects.length === 0 && (
              <span className="rounded-lg bg-felt/10 px-2 py-1 text-[10px] font-semibold text-ink-muted">
                No effects
              </span>
            )}
            {player.statusEffects.includes('auto_save') && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-tile-green/15 px-2 py-1 text-[10px] font-bold text-felt">
                <Shield className="h-3 w-3" /> Auto Save
              </span>
            )}
            {player.statusEffects.includes('skip_turn') && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-berry/15 px-2 py-1 text-[10px] font-bold text-berry">
                <Ban className="h-3 w-3" /> Skip next
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-felt/8 px-2 py-1.5">
              <p className="text-[10px] font-semibold text-ink-muted">Correct</p>
              <p className="font-display font-extrabold text-felt">{player.correctAnswers}</p>
            </div>
            <div className="rounded-xl bg-felt/8 px-2 py-1.5">
              <p className="text-[10px] font-semibold text-ink-muted">Asked</p>
              <p className="font-display font-extrabold text-ink">{player.totalAnswers}</p>
            </div>
          </div>
        </>
      )}

      {compact && (
        <div className="mt-2 flex justify-between text-[10px] font-bold text-ink-muted">
          <span>✓ {player.correctAnswers}</span>
          <span>Q {player.totalAnswers}</span>
        </div>
      )}
    </motion.div>
  )
}
