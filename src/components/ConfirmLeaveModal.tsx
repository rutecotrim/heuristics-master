import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmLeaveModalProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmLeaveModal({ open, onCancel, onConfirm }: ConfirmLeaveModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-title"
        >
          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="panel w-full max-w-md rounded-[1.75rem] p-6 shadow-2xl sm:p-8"
          >
            <p className="font-display mb-2 text-xs font-extrabold uppercase tracking-wider text-tangerine-deep">
              Error prevention
            </p>
            <h2 id="leave-title" className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              End this match?
            </h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-ink-muted sm:text-base">
              Progress will be lost and you will return to the main screen. This cannot be undone.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="font-display flex-1 rounded-2xl bg-berry px-5 py-3.5 text-base font-extrabold text-parchment shadow-lg"
              >
                End match
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="btn-secondary font-display flex-1 rounded-2xl px-5 py-3.5 text-base font-extrabold !text-ink !border-felt/25"
              >
                Keep playing
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
