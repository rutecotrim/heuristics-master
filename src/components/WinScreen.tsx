import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, RotateCcw } from 'lucide-react'
import type { Player } from '../types/game'

interface WinScreenProps {
  winner: Player
  loser: Player
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
      color: ['#3b82f6', '#f97316', '#22c55e', '#eab308', '#a855f7', '#f43f5e'][
        i % 6
      ],
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

export function WinScreen({ winner, loser, totalTurns, onPlayAgain }: WinScreenProps) {
  const accuracy =
    winner.totalAnswers === 0
      ? 0
      : Math.round((winner.correctAnswers / winner.totalAnswers) * 100)

  const [show, setShow] = useState(false)
  useEffect(() => {
    setShow(true)
  }, [])

  if (!show) return null

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-6 py-12">
      <Confetti />

      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 16 }}
        className="glass-strong relative z-10 w-full max-w-lg rounded-3xl p-8 text-center shadow-2xl"
      >
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_16px_50px_rgba(251,146,60,0.55)]"
        >
          <Trophy className="h-12 w-12 text-white" strokeWidth={2.5} />
        </motion.div>

        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
          🏆 Heuristics Master
        </h1>
        <p className="mt-3 text-lg text-sky-100/80">
          <span className="font-display text-2xl font-bold text-amber-300">
            {winner.avatar} {winner.name}
          </span>{' '}
          conquers the board!
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="Turns" value={String(Math.max(totalTurns, winner.turnsPlayed))} />
          <Stat label="Correct" value={String(winner.correctAnswers)} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
        </div>

        <p className="mt-4 text-sm text-sky-200/50">
          {loser.avatar} {loser.name} answered {loser.correctAnswers}/{loser.totalAnswers} correctly
        </p>

        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onPlayAgain}
          className="font-display mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 py-4 text-xl font-bold text-white shadow-lg"
        >
          <RotateCcw className="h-5 w-5" />
          Play Again
        </motion.button>
      </motion.div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 px-3 py-3">
      <p className="text-[10px] uppercase tracking-wide text-sky-200/50">{label}</p>
      <p className="font-display text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
