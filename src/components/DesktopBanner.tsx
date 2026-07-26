import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, X } from 'lucide-react'

interface DesktopBannerProps {
  visible: boolean
  onDismiss: () => void
}

export function DesktopBanner({ visible, onDismiss }: DesktopBannerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4 sm:top-5"
        >
          <div className="pointer-events-auto flex max-w-xl items-start gap-3 rounded-2xl border border-aqua/30 bg-[rgba(20,40,32,0.88)] px-4 py-3 shadow-[0_12px_40px_rgba(62,207,207,0.25)] backdrop-blur-xl">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-aqua/20 text-aqua">
              <Monitor className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-parchment">
                🎮 Best experienced on desktop browsers.
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-parchment/70">
                This game was designed for desktop devices to provide the best gameplay
                experience.
              </p>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg p-1.5 text-parchment/60 transition hover:bg-white/10 hover:text-parchment"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
