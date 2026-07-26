import { motion } from 'framer-motion'
import { ArrowLeft, Dice5, HelpCircle, Sparkles, Swords } from 'lucide-react'

interface HowToPlayProps {
  onBack: () => void
  onPlay: () => void
}

const STEPS = [
  {
    icon: Swords,
    title: 'Roll to start',
    text: 'Both players roll. Highest goes first. Tie? Roll again!',
  },
  {
    icon: HelpCircle,
    title: 'Answer to move',
    text: 'Each turn starts with a UX heuristic question. Correct → roll the dice!',
  },
  {
    icon: Dice5,
    title: 'Race the board',
    text: 'Advance along ~40 tiles. Land on bonuses, penalties, and wild specials.',
  },
  {
    icon: Sparkles,
    title: 'Reach FINISH',
    text: 'First player to the trophy tile becomes the Heuristics Master!',
  },
]

export function HowToPlay({ onBack, onPlay }: HowToPlayProps) {
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-strong w-full max-w-2xl rounded-3xl p-8 shadow-2xl"
      >
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm font-semibold text-sky-200/80 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h2 className="font-display text-3xl font-bold text-white">How to Play</h2>
        <p className="mt-2 text-sky-100/75">
          A fast local multiplayer race powered by Nielsen&apos;s 10 Usability Heuristics.
        </p>

        <ul className="mt-8 space-y-4">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }}
              className="flex gap-4 rounded-2xl bg-white/5 p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/25 text-sky-200">
                <step.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-white">
                  {i + 1}. {step.title}
                </p>
                <p className="mt-1 text-sm text-sky-100/70">{step.text}</p>
              </div>
            </motion.li>
          ))}
        </ul>

        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100/90">
          <strong className="font-display">Tile legend:</strong> Blue = path · Purple = bonus
          quiz · Green = boost · Red = penalty · Orange = special chaos!
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onPlay}
          className="font-display mt-8 w-full rounded-2xl bg-gradient-to-r from-orange-400 to-coral px-6 py-4 text-lg font-bold text-white shadow-lg"
          style={{ backgroundImage: 'linear-gradient(90deg, #fb923c, #ff6b4a)' }}
        >
          Got it — Let&apos;s Play!
        </motion.button>
      </motion.div>
    </div>
  )
}
