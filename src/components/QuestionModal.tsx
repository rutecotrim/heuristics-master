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
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-md sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 36, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="panel relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] p-5 shadow-2xl sm:p-8"
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="font-display rounded-full bg-felt px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-lime-pop">
              {isBonus ? 'Bonus Quiz' : 'Heuristic Challenge'}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${
                question.difficulty === 'easy'
                  ? 'bg-tile-green/20 text-felt'
                  : question.difficulty === 'medium'
                    ? 'bg-tangerine/20 text-tangerine-deep'
                    : 'bg-berry/15 text-berry'
              }`}
            >
              {question.difficulty}
            </span>
          </div>

          <h2 className="font-display text-xl font-extrabold leading-snug text-ink sm:text-2xl">
            {question.question}
          </h2>

          <div className="mt-6 flex flex-col gap-3">
            {question.answers.map((answer, i) => {
              const isSelected = selectedIndex === i
              const isCorrect = question.correctIndex === i
              let styles =
                'border-felt/15 bg-white/50 hover:border-tangerine/50 hover:bg-tangerine/10'

              if (showExplanation) {
                if (isCorrect) {
                  styles = 'border-tile-green/70 bg-tile-green/20'
                } else if (isSelected && !isCorrect) {
                  styles = 'border-berry/70 bg-berry/15'
                } else {
                  styles = 'border-felt/10 bg-felt/5 opacity-55'
                }
              }

              return (
                <motion.button
                  key={answer}
                  type="button"
                  disabled={showExplanation}
                  whileHover={!showExplanation ? { scale: 1.015, x: 4 } : undefined}
                  whileTap={!showExplanation ? { scale: 0.985 } : undefined}
                  onClick={() => onAnswer(i)}
                  className={`flex items-start gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition ${styles}`}
                >
                  <span className="font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-felt text-sm font-extrabold text-lime-pop">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 pt-1 text-sm font-bold text-ink sm:text-base">
                    {answer}
                  </span>
                  {showExplanation && isCorrect && (
                    <Check className="mt-1 h-5 w-5 shrink-0 text-tile-green" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <X className="mt-1 h-5 w-5 shrink-0 text-berry" />
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
                      ? 'bg-tile-green/15 ring-1 ring-tile-green/40'
                      : 'bg-berry/10 ring-1 ring-berry/35'
                  }`}
                >
                  <p className="font-display text-sm font-extrabold text-ink">
                    {lastAnswerCorrect ? '✓ Correct!' : '✗ Not quite'}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {question.explanation}
                  </p>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onContinue}
                  className="btn-primary font-display mt-5 w-full rounded-2xl py-3.5 text-lg font-extrabold"
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
