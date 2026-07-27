import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import type { GameController } from '../hooks/useGameState'
import { applyMove, rollDice } from '../engine/tileEngine'
import type { PlayerId } from '../types/game'
import { playSound } from '../utils/sound'
import { Board } from './Board'
import { Dice } from './Dice'
import { PlayerPanel } from './PlayerPanel'
import { QuestionModal } from './QuestionModal'
import { ScreenShell } from './ScreenShell'
import { SpecialTilePopup } from './SpecialTilePopup'

interface GameScreenProps {
  game: GameController
  onRequestLeave: () => void
  myPlayerIndex?: PlayerId | null
  isAuthority?: boolean
  roomCode?: string | null
}

export function GameScreen({
  game,
  onRequestLeave,
  myPlayerIndex = null,
  isAuthority = true,
  roomCode = null,
}: GameScreenProps) {
  const {
    state,
    beginTurn,
    answerQuestion,
    continueAfterExplanation,
    commitDiceRoll,
    completeMove,
    acknowledgeEffect,
    setPlayerName,
  } = game

  const isOnline = myPlayerIndex !== null
  const isMyTurn = !isOnline || state.currentPlayerIndex === myPlayerIndex
  const canEditName = (index: PlayerId) => !isOnline || myPlayerIndex === index
  const canAnswer =
    isMyTurn && state.phase === 'question' && !state.showExplanation
  const canContinueExplanation =
    isMyTurn && state.phase === 'question' && state.showExplanation
  const canAckEffect = isMyTurn && state.phase === 'tile_effect'

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const [displayDice, setDisplayDice] = useState<number | null>(null)
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null)
  const [localPositions, setLocalPositions] = useState<number[]>(() =>
    state.players.map((p) => p.position),
  )
  const rollGeneration = useRef(0)
  const moveGeneration = useRef(0)

  useEffect(() => {
    if (state.phase !== 'moving') {
      setLocalPositions(state.players.map((p) => p.position))
    }
  }, [state.players, state.phase])

  useEffect(() => {
    if (state.phase === 'question' && !state.showExplanation) {
      setSelectedIndex(null)
    }
  }, [state.phase, state.currentQuestion?.id, state.showExplanation])

  useEffect(() => {
    if (isAuthority) {
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
    }

    if (state.phase === 'dice_roll') {
      setRolling(true)
      setDisplayDice(null)
      return
    }

    if (state.phase === 'moving' && state.diceValue !== null) {
      setRolling(false)
      setDisplayDice(state.diceValue)
    }
  }, [state.phase, state.diceValue, commitDiceRoll, isAuthority])

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
      if (isAuthority) completeMove(newPosition)
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
          if (isAuthority) completeMove(newPosition)
        }, 280)
        return
      }
      const pos = steps[i]
      setLocalPositions((prev) => {
        const next = [...prev]
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
  }, [state.phase, state.diceValue, isAuthority])

  const displayPlayers = state.players.map((p, i) => ({
    ...p,
    position: localPositions[i] ?? p.position,
  }))

  const currentPlayer = state.players[state.currentPlayerIndex]
  const playerCount = state.players.length

  return (
    <ScreenShell wide>
      <div className="flex w-full flex-col gap-5 lg:gap-6">
        <header className="flex w-full items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-extrabold text-parchment sm:text-2xl">
              Heuristics Master
            </h1>
            <p className="text-xs font-semibold text-parchment/50 sm:text-sm">
              Race · Learn · Win · {playerCount} players
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {roomCode && (
              <div className="hidden rounded-full border border-aqua/30 bg-aqua/10 px-3 py-1.5 text-xs font-bold text-aqua sm:block">
                Room {roomCode}
              </div>
            )}
            <div className="rounded-full border border-lime-pop/25 bg-lime-pop/10 px-3 py-1.5 text-xs font-bold text-lime-pop sm:px-4 sm:text-sm">
              Turn {state.totalTurns + 1}
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onRequestLeave}
              className="font-display inline-flex items-center gap-1.5 rounded-full border border-parchment/25 bg-parchment/10 px-3 py-1.5 text-xs font-extrabold text-parchment transition hover:bg-berry/20 hover:border-berry/40 sm:px-4 sm:text-sm"
            >
              <LogOut className="h-3.5 w-3.5" />
              End game
            </motion.button>
          </div>
        </header>

        <div
          className={`grid gap-3 ${
            playerCount <= 2
              ? 'grid-cols-2'
              : playerCount === 3
                ? 'grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-4'
          }`}
        >
          {state.players.map((player, i) => (
            <PlayerPanel
              key={player.id}
              player={player}
              isActive={state.currentPlayerIndex === i}
              side={i % 2 === 0 ? 'left' : 'right'}
              compact
              canEditName={canEditName(i as PlayerId)}
              onNameChange={(name) => setPlayerName(i as PlayerId, name)}
            />
          ))}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
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
                        {isOnline && isMyTurn ? ' (you)' : ''}
                      </p>
                    </div>
                  </div>
                  {isMyTurn ? (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={beginTurn}
                      className="btn-primary font-display w-full rounded-xl px-5 py-3 text-sm font-extrabold sm:w-auto sm:text-base"
                    >
                      Ready for question
                    </motion.button>
                  ) : (
                    <p className="font-display text-sm font-bold text-ink-muted">
                      Waiting for {currentPlayer.name}…
                    </p>
                  )}
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
      </div>

      {state.phase === 'question' && state.currentQuestion && (
        <QuestionModal
          question={state.currentQuestion}
          player={currentPlayer}
          showExplanation={state.showExplanation}
          lastAnswerCorrect={state.lastAnswerCorrect}
          selectedIndex={selectedIndex}
          onAnswer={(index) => {
            if (!canAnswer) return
            setSelectedIndex(index)
            answerQuestion(index)
          }}
          onContinue={() => {
            if (!canContinueExplanation) return
            continueAfterExplanation()
          }}
          isBonus={state.isBonusQuestion}
          inputEnabled={canAnswer || canContinueExplanation}
          isYourTurn={isMyTurn}
        />
      )}

      {state.phase === 'tile_effect' && state.pendingEffect && (
        <SpecialTilePopup
          effect={state.pendingEffect}
          onContinue={() => {
            if (!canAckEffect) return
            acknowledgeEffect()
          }}
          inputEnabled={canAckEffect}
        />
      )}
    </ScreenShell>
  )
}
