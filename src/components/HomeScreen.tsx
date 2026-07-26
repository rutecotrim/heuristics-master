import { motion } from 'framer-motion'
import { BookOpen, Gamepad2, Trophy } from 'lucide-react'
import { ScreenShell } from './ScreenShell'

interface HomeScreenProps {
  onPlay: () => void
  onHowToPlay: () => void
}

export function HomeScreen({ onPlay, onHowToPlay }: HomeScreenProps) {
  return (
    <ScreenShell>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 28 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative w-full max-w-xl text-center"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-x-16 -top-20 -z-10 h-64 rounded-full bg-tangerine/20 blur-3xl"
          animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, -4, 4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-lime-pop to-aqua shadow-[0_16px_40px_rgba(198,241,90,0.35)]"
        >
          <Trophy className="h-11 w-11 text-ink" strokeWidth={2.4} />
        </motion.div>

        <p className="font-display mb-3 text-xs font-bold uppercase tracking-[0.22em] text-lime-pop">
          Local multiplayer · UX race
        </p>

        <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-parchment sm:text-6xl md:text-7xl">
          Heuristics
          <span className="block bg-gradient-to-r from-tangerine via-lime-pop to-aqua bg-clip-text text-transparent">
            Master
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base font-semibold text-parchment/75 sm:text-lg">
          Master Nielsen&apos;s Heuristics before your opponent.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:gap-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onPlay}
            className="btn-primary font-display flex items-center justify-center gap-3 rounded-2xl px-8 py-4 text-lg font-extrabold sm:text-xl"
          >
            <Gamepad2 className="h-6 w-6" />
            Play Local Multiplayer
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onHowToPlay}
            className="btn-secondary font-display flex items-center justify-center gap-3 rounded-2xl px-8 py-3.5 text-base font-bold sm:text-lg"
          >
            <BookOpen className="h-5 w-5" />
            How to Play
          </motion.button>
        </div>

        <p className="mt-8 text-sm font-medium text-parchment/45">
          2 players · Same computer · No signup
        </p>
      </motion.div>
    </ScreenShell>
  )
}
