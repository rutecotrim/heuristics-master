import { motion } from 'framer-motion'
import { BookOpen, Gamepad2, Trophy } from 'lucide-react'

interface HomeScreenProps {
  onPlay: () => void
  onHowToPlay: () => void
}

export function HomeScreen({ onPlay, onHowToPlay }: HomeScreenProps) {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-6 py-16">
      <motion.div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: 40 + (i % 5) * 28,
              height: 40 + (i % 5) * 28,
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
            animate={{ y: [0, -18, 0], opacity: [0.2, 0.45, 0.2] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="relative z-10 w-full max-w-lg text-center"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, 0], y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_12px_40px_rgba(251,146,60,0.5)]"
        >
          <Trophy className="h-10 w-10 text-white" strokeWidth={2.5} />
        </motion.div>

        <h1 className="font-display text-5xl font-bold tracking-tight text-white drop-shadow-lg md:text-6xl">
          Heuristics Master
        </h1>
        <p className="mt-4 text-lg font-semibold text-sky-100/90 md:text-xl">
          Master Nielsen&apos;s Heuristics before your opponent.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={onPlay}
            className="font-display flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 px-8 py-4 text-xl font-bold text-white shadow-[0_10px_30px_rgba(59,130,246,0.45)]"
          >
            <Gamepad2 className="h-6 w-6" />
            Play Local Multiplayer
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onHowToPlay}
            className="font-display flex items-center justify-center gap-3 rounded-2xl glass px-8 py-3.5 text-lg font-bold text-white"
          >
            <BookOpen className="h-5 w-5" />
            How to Play
          </motion.button>
        </div>

        <p className="mt-8 text-sm text-sky-200/60">2 players · Same computer · No signup</p>
      </motion.div>
    </div>
  )
}
