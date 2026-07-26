import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import type { Question } from '../types/game'

interface QuestionModalProps {
  question: Question
  showExplanation: boolean
  lastAnswerCorrect: boolean | null
  selectedIndex: number | null
  onAnswer: (index: number) => void
  onContinue: () => void
  isBonus?: boolean
}

export function QuestionModal({
  question,
  showExplanation,
  lastAnswerCorrect,
  selectedIndex,
  onAnswer,
  onContinue,
  isBonus,
}: QuestionModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.88, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="glass-strong relative w-full max-w-2xl overflow-hidden rounded-3xl p-6 shadow-2xl md:p-8"
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="font-display rounded-full bg-violet-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-200">
              {isBonus ? 'Bonus Quiz' : 'Heuristic Challenge'}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                question.difficulty === 'easy'
                  ? 'bg-emerald-500/20 text-emerald-200'
                  : question.difficulty === 'medium'
                    ? 'bg-amber-500/20 text-amber-200'
                    : 'bg-rose-500/20 text-rose-200'
              }`}
            >
              {question.difficulty}
            </span>
          </div>

          <h2 className="font-display text-xl font-bold leading-snug text-white md:text-2xl">
            {question.question}
          </h2>

          <div className="mt-6 flex flex-col gap-3">
            {question.answers.map((answer, i) => {
              const isSelected = selectedIndex === i
              const isCorrect = question.correctIndex === i
              let styles =
                'border-white/15 bg-white/5 hover:border-sky-400/50 hover:bg-sky-500/15'

              if (showExplanation) {
                if (isCorrect) {
                  styles = 'border-emerald-400/60 bg-emerald-500/25'
                } else if (isSelected && !isCorrect) {
                  styles = 'border-rose-400/60 bg-rose-500/25'
                } else {
                  styles = 'border-white/10 bg-white/[0.03] opacity-60'
                }
              }

              return (
                <motion.button
                  key={answer}
                  type="button"
                  disabled={showExplanation}
                  whileHover={!showExplanation ? { scale: 1.02, x: 4 } : undefined}
                  whileTap={!showExplanation ? { scale: 0.98 } : undefined}
                  onClick={() => onAnswer(i)}
                  className={`flex items-start gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition ${styles}`}
                >
                  <span className="font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-sky-100">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 pt-1 text-sm font-semibold text-white md:text-base">
                    {answer}
                  </span>
                  {showExplanation && isCorrect && (
                    <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <X className="mt-1 h-5 w-5 shrink-0 text-rose-300" />
                  )}
                </motion.button>
              )
            })}
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <div
                  className={`mt-5 rounded-2xl p-4 ${
                    lastAnswerCorrect
                      ? 'bg-emerald-500/15 ring-1 ring-emerald-400/40'
                      : 'bg-rose-500/15 ring-1 ring-rose-400/40'
                  }`}
                >
                  <p className="font-display text-sm font-bold text-white">
                    {lastAnswerCorrect ? '✓ Correct!' : '✗ Not quite'}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-sky-100/85">
                    {question.explanation}
                  </p>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onContinue}
                  className="font-display mt-5 w-full rounded-2xl bg-gradient-to-r from-sky-400 to-blue-600 py-3.5 text-lg font-bold text-white shadow-lg"
                >
                  {lastAnswerCorrect
                    ? isBonus
                      ? 'Claim Boost!'
                      : 'Roll the Dice!'
                    : 'End Turn'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
