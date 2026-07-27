import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, RotateCcw } from 'lucide-react'
import type { Player } from '../types/game'
import { ScreenShell } from './ScreenShell'

interface WinScreenProps {
  winner: Player
  others: Player[]
  totalTurns: number
  onPlayAgain: () => void
}

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 48 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2.5 + Math.random() * 2,
      color: ['#ff7a3c', '#c6f15a', '#3ecfcf', '#e8476b', '#ffb347', '#5eb8e8'][i % 6],
      size: 6 + Math.random() * 10,
      rotate: Math.random() * 360,
    })),
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: '110vh',
            opacity: [1, 1, 0],
            rotate: p.rotate + 720,
            x: [0, (Math.random() - 0.5) * 80],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeIn',
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
      ))}
    </div>
  )
}

export function WinScreen({ winner, others, totalTurns, onPlayAgain }: WinScreenProps) {
  const answered = winner.totalAnswers
  const accuracy =
    answered === 0 ? 0 : Math.round((winner.correctAnswers / answered) * 100)

  const [show, setShow] = useState(false)
  useEffect(() => {
    setShow(true)
  }, [])

  if (!show) return null

  return (
    <ScreenShell className="relative overflow-hidden">
      <Confetti />

      <motion.div
        initial={{ scale: 0.75, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 16 }}
        className="panel relative z-10 w-full max-w-lg rounded-[1.75rem] p-8 text-center shadow-2xl"
      >
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-lime-pop to-tangerine shadow-[0_16px_50px_rgba(255,122,60,0.4)]"
        >
          <Trophy className="h-12 w-12 text-ink" strokeWidth={2.5} />
        </motion.div>

        <h1 className="font-display text-4xl font-extrabold text-ink md:text-5xl">
          Heuristics Master
        </h1>
        <p className="mt-3 text-lg font-semibold text-ink-muted">
          <span className="font-display text-2xl font-extrabold text-tangerine-deep">
            {winner.avatar} {winner.name}
          </span>{' '}
          conquers the board!
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="Your moves" value={String(winner.turnsPlayed)} />
          <Stat
            label="Answers"
            value={answered === 0 ? '0' : `${winner.correctAnswers}/${answered}`}
          />
          <Stat label="Accuracy" value={`${accuracy}%`} />
        </div>

        <div className="mt-4 space-y-1.5 text-sm font-semibold text-ink-muted">
          {others.map((p) => (
            <p key={p.id}>
              {p.avatar} {p.name} answered {p.correctAnswers}/{p.totalAnswers} correctly
            </p>
          ))}
          {totalTurns > 0 && <p>{totalTurns} moves this game</p>}
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onPlayAgain}
          className="btn-primary font-display mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-xl font-extrabold"
        >
          <RotateCcw className="h-5 w-5" />
          Play Again
        </motion.button>
      </motion.div>
    </ScreenShell>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-felt/8 px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="font-display text-2xl font-extrabold text-ink">{value}</p>
    </div>
  )
}
