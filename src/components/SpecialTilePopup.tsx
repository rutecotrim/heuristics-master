import { motion, AnimatePresence } from 'framer-motion'
import type { PendingTileEffect } from '../types/game'

interface SpecialTilePopupProps {
  effect: PendingTileEffect
  onContinue: () => void
}

export function SpecialTilePopup({ effect, onContinue }: SpecialTilePopupProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl p-8 text-center shadow-2xl"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.7 }}
            className="mx-auto mb-4 text-6xl"
          >
            {effect.emoji}
          </motion.div>

          <h2 className="font-display text-3xl font-bold text-white">{effect.title}</h2>
          <p className="mt-3 text-base leading-relaxed text-sky-100/85">{effect.message}</p>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className="font-display mt-8 w-full rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 py-3.5 text-lg font-bold text-slate-900 shadow-lg"
          >
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
