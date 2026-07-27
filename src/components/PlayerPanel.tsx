import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Shield, Ban } from 'lucide-react'
import type { Player } from '../types/game'

interface PlayerPanelProps {
  player: Player
  isActive: boolean
  side: 'left' | 'right'
  compact?: boolean
  canEditName?: boolean
  onNameChange?: (name: string) => void
}

export function PlayerPanel({
  player,
  isActive,
  side,
  compact = false,
  canEditName = false,
  onNameChange,
}: PlayerPanelProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(player.name)

  useEffect(() => {
    if (!editing) setDraft(player.name)
  }, [player.name, editing])

  const commitName = () => {
    const next = draft.trim().slice(0, 16) || player.name
    setDraft(next)
    setEditing(false)
    if (next !== player.name) onNameChange?.(next)
  }

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
          {canEditName ? 'Your turn' : 'Playing'}
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
        <div className={`min-w-0 flex-1 ${side === 'right' && !compact ? 'text-right' : ''}`}>
          {canEditName && editing ? (
            <input
              autoFocus
              value={draft}
              maxLength={16}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitName()
                if (e.key === 'Escape') {
                  setDraft(player.name)
                  setEditing(false)
                }
              }}
              className={`font-display w-full rounded-lg border-2 border-tangerine/50 bg-white/80 px-2 py-0.5 text-ink outline-none ${
                compact ? 'text-sm' : 'text-lg'
              } font-extrabold`}
              aria-label="Edit player name"
            />
          ) : (
            <button
              type="button"
              disabled={!canEditName}
              onClick={() => canEditName && setEditing(true)}
              className={`font-display inline-flex max-w-full items-center gap-1 font-extrabold text-ink ${
                compact ? 'text-sm' : 'text-lg'
              } ${canEditName ? 'cursor-pointer hover:text-tangerine-deep' : 'cursor-default'} ${
                side === 'right' && !compact ? 'flex-row-reverse' : ''
              }`}
            >
              <span className="truncate">{player.name}</span>
              {canEditName && <Pencil className="h-3 w-3 shrink-0 opacity-60" />}
            </button>
          )}
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
                <Shield className="h-3 w-3" /> Auto save
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
