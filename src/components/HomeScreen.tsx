import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Gamepad2, Globe, Trophy, Users } from 'lucide-react'
import type { PlayerCount } from '../data/players'
import { ScreenShell } from './ScreenShell'

interface HomeScreenProps {
  onPlayLocal: (count: PlayerCount) => void
  onPlayOnline: () => void
  onHowToPlay: () => void
}

export function HomeScreen({ onPlayLocal, onPlayOnline, onHowToPlay }: HomeScreenProps) {
  const [localCount, setLocalCount] = useState<PlayerCount>(2)

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
          Local or online · UX race
        </p>

        <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-parchment sm:text-6xl md:text-7xl">
          Heuristics
          <span className="block bg-gradient-to-r from-tangerine via-lime-pop to-aqua bg-clip-text text-transparent">
            Master
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base font-semibold text-parchment/75 sm:text-lg">
          Master Nielsen&apos;s Heuristics before your friends.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:gap-4">
          <div className="rounded-2xl border border-parchment/15 bg-parchment/5 p-3">
            <p className="mb-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-parchment/60">
              <Users className="h-3.5 w-3.5" />
              Local players
            </p>
            <div className="flex justify-center gap-2">
              {([2, 3, 4] as PlayerCount[]).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setLocalCount(n)}
                  className={`font-display h-11 w-11 rounded-xl text-lg font-extrabold transition ${
                    localCount === n
                      ? 'bg-tangerine text-ink shadow-lg'
                      : 'bg-parchment/10 text-parchment/80 hover:bg-parchment/20'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPlayLocal(localCount)}
            className="btn-primary font-display flex items-center justify-center gap-3 rounded-2xl px-8 py-4 text-lg font-extrabold sm:text-xl"
          >
            <Gamepad2 className="h-6 w-6" />
            Play Local ({localCount} players)
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onPlayOnline}
            className="font-display flex items-center justify-center gap-3 rounded-2xl border-2 border-aqua/40 bg-aqua/15 px-8 py-4 text-lg font-extrabold text-parchment shadow-[0_10px_28px_rgba(62,207,207,0.25)] sm:text-xl"
          >
            <Globe className="h-6 w-6 text-aqua" />
            Play Online (up to 4)
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
          Same computer or room code · No signup
        </p>
      </motion.div>
    </ScreenShell>
  )
}
