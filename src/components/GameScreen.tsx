import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { GameController } from '../hooks/useGameState'
import { applyMove, rollDice } from '../engine/tileEngine'
import { playSound } from '../utils/sound'
import { Board } from './Board'
import { Dice } from './Dice'
import { PlayerPanel } from './PlayerPanel'
import { QuestionModal } from './QuestionModal'
import { ScreenShell } from './ScreenShell'
import { SpecialTilePopup } from './SpecialTilePopup'

interface GameScreenProps {
  game: GameController
}

export function GameScreen({ game }: GameScreenProps) {
  const {
    state,
    beginTurn,
    answerQuestion,
    continueAfterExplanation,
    commitDiceRoll,
    completeMove,
    acknowledgeEffect,
  } = game

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const [displayDice, setDisplayDice] = useState<number | null>(null)
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null)
  const [localPositions, setLocalPositions] = useState<[number, number]>([
    state.players[0].position,
    state.players[1].position,
  ])
  const rollGeneration = useRef(0)
  const moveGeneration = useRef(0)

  useEffect(() => {
    if (state.phase !== 'moving') {
      setLocalPositions([state.players[0].position, state.players[1].position])
    }
  }, [state.players, state.phase])

  useEffect(() => {
    if (state.phase === 'question' && !state.showExplanation) {
      setSelectedIndex(null)
    }
  }, [state.phase, state.currentQuestion?.id, state.showExplanation])

  useEffect(() => {
    if (state.phase !== 'dice_roll') return

    const generation = ++rollGeneration.current
    let cancelled = false

    ;(async () => {
      setRolling(true)
      setDisplayDice(null)
      playSound('dice')
      await new Promise((r) => setTimeout(r, 1000))
      if (cancelled || generation !== rollGeneration.current) return
      const value = rollDice()
      setDisplayDice(value)
      setRolling(false)
      commitDiceRoll(value)
    })()

    return () => {
      cancelled = true
    }
  }, [state.phase, commitDiceRoll])

  useEffect(() => {
    if (state.phase !== 'moving' || state.diceValue === null) return

    const generation = ++moveGeneration.current
    const playerIdx = state.currentPlayerIndex
    const start = state.players[playerIdx].position
    const diceValue = state.diceValue
    const { newPosition } = applyMove(start, diceValue)
    const steps: number[] = []
    for (let p = start + 1; p <= newPosition; p++) steps.push(p)

    if (steps.length === 0) {
      completeMove(newPosition)
      return
    }

    let i = 0
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      if (generation !== moveGeneration.current) return
      if (i >= steps.length) {
        setHighlightIndex(newPosition)
        timer = setTimeout(() => {
          if (generation !== moveGeneration.current) return
          setHighlightIndex(null)
          completeMove(newPosition)
        }, 280)
        return
      }
      const pos = steps[i]
      setLocalPositions((prev) => {
        const next: [number, number] = [...prev]
        next[playerIdx] = pos
        return next
      })
      setHighlightIndex(pos)
      i += 1
      timer = setTimeout(tick, 220)
    }

    timer = setTimeout(tick, 200)

    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.diceValue])

  const displayPlayers: typeof state.players = [
    { ...state.players[0], position: localPositions[0] },
    { ...state.players[1], position: localPositions[1] },
  ]

  const currentPlayer = state.players[state.currentPlayerIndex]

  const handleAnswer = (index: number) => {
    if (state.showExplanation) return
    setSelectedIndex(index)
    answerQuestion(index)
  }

  return (
    <ScreenShell wide>
      <div className="flex w-full flex-col gap-5 lg:gap-6">
        <header className="flex w-full items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-extrabold text-parchment sm:text-2xl">
              Heuristics Master
            </h1>
            <p className="text-xs font-semibold text-parchment/50 sm:text-sm">
              Race · Learn · Win
            </p>
          </div>
          <div className="rounded-full border border-lime-pop/25 bg-lime-pop/10 px-3 py-1.5 text-xs font-bold text-lime-pop sm:px-4 sm:text-sm">
            Turn {state.totalTurns + 1}
          </div>
        </header>

        <div className="flex w-full flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:gap-5">
          <div className="hidden shrink-0 lg:block lg:w-44 xl:w-48">
            <PlayerPanel
              player={state.players[0]}
              isActive={state.currentPlayerIndex === 0}
              side="left"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 lg:hidden">
              <PlayerPanel
                player={state.players[0]}
                isActive={state.currentPlayerIndex === 0}
                side="left"
                compact
              />
              <PlayerPanel
                player={state.players[1]}
                isActive={state.currentPlayerIndex === 1}
                side="right"
                compact
              />
            </div>

            <Board players={displayPlayers} highlightIndex={highlightIndex} />

            <AnimatePresence mode="wait">
              {state.phase === 'playing' && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex justify-center"
                >
                  <div className="panel flex w-full max-w-xl flex-col items-center gap-4 rounded-[1.5rem] px-5 py-4 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                        style={{
                          backgroundColor: `${currentPlayer.color}44`,
                          border: `2px solid ${currentPlayer.color}`,
                        }}
                      >
                        {currentPlayer.avatar}
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                          Up next
                        </p>
                        <p className="font-display text-lg font-extrabold text-ink">
                          {currentPlayer.name}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={beginTurn}
                      className="btn-primary font-display w-full rounded-xl px-5 py-3 text-sm font-extrabold sm:w-auto sm:text-base"
                    >
                      Ready for next question
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {(state.phase === 'dice_roll' || state.phase === 'moving') && (
                <motion.div
                  key="dice"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex justify-center"
                >
                  <div className="panel-dark flex items-center gap-4 rounded-2xl px-5 py-3">
                    <span className="font-display text-sm font-bold text-parchment">
                      {rolling ? 'Rolling…' : displayDice ? `Moving ${displayDice}!` : 'Dice'}
                    </span>
                    <Dice value={displayDice} rolling={rolling} size="md" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden shrink-0 lg:block lg:w-44 xl:w-48">
            <PlayerPanel
              player={state.players[1]}
              isActive={state.currentPlayerIndex === 1}
              side="right"
            />
          </div>
        </div>
      </div>

      {state.phase === 'question' && state.currentQuestion && (
        <QuestionModal
          question={state.currentQuestion}
          player={currentPlayer}
          showExplanation={state.showExplanation}
          lastAnswerCorrect={state.lastAnswerCorrect}
          selectedIndex={selectedIndex}
          onAnswer={handleAnswer}
          onContinue={continueAfterExplanation}
          isBonus={state.isBonusQuestion}
        />
      )}

      {state.phase === 'tile_effect' && state.pendingEffect && (
        <SpecialTilePopup effect={state.pendingEffect} onContinue={acknowledgeEffect} />
      )}
    </ScreenShell>
  )
}
