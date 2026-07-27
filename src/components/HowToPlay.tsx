import { motion } from 'framer-motion'
import { ArrowLeft, Dice5, HelpCircle, Sparkles, Swords } from 'lucide-react'
import { ScreenShell } from './ScreenShell'

interface HowToPlayProps {
  onBack: () => void
  onPlay: () => void
}

const STEPS = [
  {
    icon: Swords,
    title: 'Roll to start',
    text: 'Play with 2 to 4 friends on the same computer or online with a room code. Highest roll goes first!',

  },
  {
    icon: HelpCircle,
    title: 'Answer to move',
    text: 'Each turn starts with a UX heuristic question. Correct means you roll the dice!',
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
    <ScreenShell>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="panel w-full max-w-2xl rounded-[1.75rem] p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h2 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">How to Play</h2>
        <p className="mt-2 text-ink-muted">
          A fast local multiplayer race powered by Nielsen&apos;s 10 Usability Heuristics.
        </p>

        <ul className="mt-7 space-y-3">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }}
              className="flex gap-4 rounded-2xl bg-felt/8 p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-felt text-lime-pop">
                <step.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-ink">
                  {i + 1}. {step.title}
                </p>
                <p className="mt-1 text-sm text-ink-muted">{step.text}</p>
              </div>
            </motion.li>
          ))}
        </ul>

        <div className="mt-5 rounded-2xl border border-tangerine/30 bg-tangerine/10 p-4 text-sm text-ink">
          <strong className="font-display">Tile legend:</strong> Quiet stepping stones = path ·
          Purple = bonus quiz · Green = boost · Red = penalty · Orange = special chaos · Gold =
          finish!
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPlay}
          className="btn-primary font-display mt-7 w-full rounded-2xl px-6 py-4 text-lg font-extrabold"
        >
          Got it! Lets play!
        </motion.button>
      </motion.div>
    </ScreenShell>
  )
}
