import { motion, AnimatePresence } from 'framer-motion'
import type { PendingTileEffect } from '../types/game'

interface SpecialTilePopupProps {
  effect: PendingTileEffect
  onContinue: () => void
  inputEnabled?: boolean
}

export function SpecialTilePopup({
  effect,
  onContinue,
  inputEnabled = true,
}: SpecialTilePopupProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.55, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="panel relative w-full max-w-md overflow-hidden rounded-[1.75rem] p-8 text-center shadow-2xl"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.7 }}
            className="mx-auto mb-4 text-6xl"
          >
            {effect.emoji}
          </motion.div>

          <h2 className="font-display text-3xl font-extrabold text-ink">{effect.title}</h2>
          <p className="mt-3 text-base font-semibold leading-relaxed text-ink-muted">
            {effect.message}
          </p>

          <motion.button
            type="button"
            whileHover={inputEnabled ? { scale: 1.04 } : undefined}
            whileTap={inputEnabled ? { scale: 0.96 } : undefined}
            onClick={onContinue}
            disabled={!inputEnabled}
            className="btn-primary font-display mt-8 w-full rounded-2xl py-3.5 text-lg font-extrabold disabled:opacity-50"
          >
            {inputEnabled ? 'Continue' : 'Waiting for player…'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
