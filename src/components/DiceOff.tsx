import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, Pencil } from 'lucide-react'
import type { GameState, PlayerId } from '../types/game'
import { Dice } from './Dice'
import { ScreenShell } from './ScreenShell'

interface DiceOffProps {
  state: GameState
  onRoll: (playerIndex: PlayerId) => void
  onResolve: () => void
  onRequestLeave: () => void
  myPlayerIndex?: PlayerId | null
  roomCode?: string | null
  isAuthority?: boolean
  onNameChange?: (index: PlayerId, name: string) => void
}

function DiceOffName({
  name,
  canEdit,
  onCommit,
}: {
  name: string
  canEdit: boolean
  onCommit?: (name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  useEffect(() => {
    if (!editing) setDraft(name)
  }, [name, editing])

  const commit = () => {
    const next = draft.trim().slice(0, 16) || name
    setDraft(next)
    setEditing(false)
    if (next !== name) onCommit?.(next)
  }

  if (canEdit && editing) {
    return (
      <input
        autoFocus
        value={draft}
        maxLength={16}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') {
            setDraft(name)
            setEditing(false)
          }
        }}
        className="font-display mx-auto mt-2 w-full max-w-[12rem] rounded-lg border-2 border-tangerine/50 bg-white/80 px-2 py-0.5 text-center text-xl font-extrabold text-ink outline-none sm:text-2xl"
        aria-label="Edit player name"
      />
    )
  }

  return (
    <button
      type="button"
      disabled={!canEdit}
      onClick={() => canEdit && setEditing(true)}
      className={`font-display mt-2 inline-flex items-center justify-center gap-1.5 text-xl font-extrabold text-ink sm:text-2xl ${
        canEdit ? 'cursor-pointer hover:text-tangerine-deep' : 'cursor-default'
      }`}
    >
      <span>{name}</span>
      {canEdit && <Pencil className="h-4 w-4 shrink-0 opacity-60" />}
    </button>
  )
}

function allRolled(rolls: (number | null)[]): boolean {
  return rolls.length > 0 && rolls.every((r) => r !== null)
}

function isTieRoll(rolls: (number | null)[]): boolean {
  if (!allRolled(rolls)) return false
  const values = rolls as number[]
  const max = Math.max(...values)
  return values.filter((v) => v === max).length > 1
}

function winnerIndex(rolls: (number | null)[]): PlayerId | null {
  if (!allRolled(rolls) || isTieRoll(rolls)) return null
  const values = rolls as number[]
  const max = Math.max(...values)
  return values.indexOf(max) as PlayerId
}

export function DiceOff({
  state,
  onRoll,
  onResolve,
  onRequestLeave,
  myPlayerIndex = null,
  roomCode = null,
  isAuthority = true,
  onNameChange,
}: DiceOffProps) {
  const rolls = state.diceOff.rolls
  const ready = allRolled(rolls)
  const tied = isTieRoll(rolls)
  const starter = winnerIndex(rolls)
  const isOnline = myPlayerIndex !== null
  const cols =
    state.players.length <= 2
      ? 'md:grid-cols-2'
      : state.players.length === 3
        ? 'md:grid-cols-3'
        : 'md:grid-cols-2 lg:grid-cols-4'

  useEffect(() => {
    if (!ready || !isAuthority) return
    const t = setTimeout(() => {
      onResolve()
    }, tied ? 1400 : 1100)
    return () => clearTimeout(t)
  }, [ready, tied, onResolve, rolls, isAuthority])

  return (
    <ScreenShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl text-center"
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          {roomCode ? (
            <p className="font-display text-xs font-bold text-aqua sm:text-sm">Room {roomCode}</p>
          ) : (
            <span />
          )}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onRequestLeave}
            className="font-display inline-flex items-center gap-1.5 rounded-full border border-parchment/25 bg-parchment/10 px-3 py-1.5 text-xs font-extrabold text-parchment transition hover:bg-berry/20 hover:border-berry/40 sm:text-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            End game
          </motion.button>
        </div>

        <h2 className="font-display text-3xl font-extrabold text-parchment sm:text-5xl">
          Who goes first?
        </h2>
        <p className="mt-3 text-base font-semibold text-parchment/70">
          Highest roll starts. Tie for the lead means roll again!
        </p>

        <div className={`mt-10 grid gap-4 sm:mt-12 sm:gap-5 ${cols}`}>
          {state.players.map((player, i) => {
            const idx = i as PlayerId
            const rolled = rolls[idx] ?? null
            const isMine = !isOnline || myPlayerIndex === idx
            const canRoll = isMine && rolled === null && !state.diceOff.rolling
            const isRolling = state.diceOff.rolling && rolled === null && isMine

            return (
              <motion.div
                key={player.id}
                className="panel rounded-[1.75rem] p-5 sm:p-6"
                whileHover={{ y: -4 }}
              >
                <div className="text-4xl sm:text-5xl">{player.avatar}</div>
                <DiceOffName
                  name={player.name}
                  canEdit={isMine}
                  onCommit={(next) => onNameChange?.(idx, next)}
                />
                {isOnline && myPlayerIndex === idx && (
                  <p className="mt-1 text-xs font-semibold text-ink-muted">You</p>
                )}
                <div className="mt-5 flex justify-center">
                  <Dice
                    value={rolled}
                    rolling={isRolling}
                    onClick={canRoll ? () => onRoll(idx) : undefined}
                    disabled={!canRoll}
                    label={
                      rolled === null
                        ? isMine
                          ? 'Tap to roll'
                          : 'Waiting…'
                        : `Rolled ${rolled}`
                    }
                  />
                </div>
                {canRoll && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onRoll(idx)}
                    className="font-display mt-5 rounded-xl px-5 py-2.5 text-sm font-extrabold text-ink"
                    style={{ backgroundColor: player.color }}
                  >
                    Roll Dice
                  </motion.button>
                )}
              </motion.div>
            )
          })}
        </div>

        {tied && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-display mt-8 text-xl font-extrabold text-tangerine"
          >
            Tie! Rolling again…
          </motion.p>
        )}

        {starter !== null && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display mt-8 text-xl font-extrabold text-lime-pop"
          >
            {state.players[starter]?.name} starts!
          </motion.p>
        )}
      </motion.div>
    </ScreenShell>
  )
}
