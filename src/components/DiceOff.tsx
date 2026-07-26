import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { GameState } from '../types/game'
import { Dice } from './Dice'
import { ScreenShell } from './ScreenShell'

interface DiceOffProps {
  state: GameState
  onRoll: (playerIndex: 0 | 1) => void
  onResolve: () => void
}

export function DiceOff({ state, onRoll, onResolve }: DiceOffProps) {
  const [roll0, roll1] = state.diceOff.rolls
  const bothRolled = roll0 !== null && roll1 !== null
  const isTie = bothRolled && roll0 === roll1

  useEffect(() => {
    if (!bothRolled) return
    const t = setTimeout(() => {
      onResolve()
    }, isTie ? 1400 : 1100)
    return () => clearTimeout(t)
  }, [bothRolled, isTie, onResolve, roll0, roll1])

  return (
    <ScreenShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl text-center"
      >
        <h2 className="font-display text-3xl font-extrabold text-parchment sm:text-5xl">
          Who goes first?
        </h2>
        <p className="mt-3 text-base font-semibold text-parchment/70">
          Highest roll starts. Tie means roll again!
        </p>

        <div className="mt-10 grid gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2">
          {state.players.map((player, i) => {
            const idx = i as 0 | 1
            const rolled = state.diceOff.rolls[idx]
            const canRoll = rolled === null && !state.diceOff.rolling
            const isRolling =
              state.diceOff.rolling &&
              rolled === null &&
              !(state.diceOff.rolls[idx === 0 ? 1 : 0] === null && idx === 1)

            return (
              <motion.div
                key={player.id}
                className="panel rounded-[1.75rem] p-6 sm:p-8"
                whileHover={{ y: -4 }}
              >
                <div className="text-5xl">{player.avatar}</div>
                <p className="font-display mt-2 text-2xl font-extrabold text-ink">{player.name}</p>
                <div className="mt-6 flex justify-center">
                  <Dice
                    value={rolled}
                    rolling={isRolling && state.diceOff.rolling && rolled === null}
                    onClick={canRoll ? () => onRoll(idx) : undefined}
                    disabled={!canRoll}
                    label={rolled === null ? 'Tap to roll' : `Rolled ${rolled}`}
                  />
                </div>
                {canRoll && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onRoll(idx)}
                    className="font-display mt-6 rounded-xl px-6 py-2.5 text-sm font-extrabold text-ink"
                    style={{ backgroundColor: player.color }}
                  >
                    Roll Dice
                  </motion.button>
                )}
              </motion.div>
            )
          })}
        </div>

        {isTie && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-display mt-8 text-xl font-extrabold text-tangerine"
          >
            Tie! Rolling again…
          </motion.p>
        )}

        {bothRolled && !isTie && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display mt-8 text-xl font-extrabold text-lime-pop"
          >
            {(roll0 ?? 0) > (roll1 ?? 0) ? state.players[0].name : state.players[1].name} starts!
          </motion.p>
        )}
      </motion.div>
    </ScreenShell>
  )
}
