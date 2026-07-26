import { motion } from 'framer-motion'

const DOT_MAP: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

interface DiceProps {
  value: number | null
  rolling?: boolean
  size?: 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  label?: string
}

export function Dice({
  value,
  rolling = false,
  size = 'lg',
  onClick,
  disabled,
  label,
}: DiceProps) {
  const dim = size === 'lg' ? 'h-24 w-24 md:h-28 md:w-28' : 'h-16 w-16'
  const display = value ?? 1
  const dots = DOT_MAP[display] ?? DOT_MAP[1]

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="font-display text-sm font-semibold text-sky-100/80">{label}</span>
      )}
      <motion.button
        type="button"
        disabled={disabled || !onClick}
        onClick={onClick}
        whileHover={onClick && !disabled ? { scale: 1.06, rotate: -3 } : undefined}
        whileTap={onClick && !disabled ? { scale: 0.94 } : undefined}
        animate={
          rolling
            ? {
                rotate: [0, 25, -20, 15, -10, 0],
                scale: [1, 1.15, 0.95, 1.1, 1],
                y: [0, -16, 0, -8, 0],
              }
            : { rotate: 0, scale: 1, y: 0 }
        }
        transition={
          rolling
            ? { duration: 0.85, ease: 'easeInOut' }
            : { type: 'spring', stiffness: 300, damping: 18 }
        }
        className={`${dim} relative rounded-2xl bg-gradient-to-br from-white to-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.35),inset_0_2px_0_rgba(255,255,255,0.9)] ${
          onClick && !disabled ? 'cursor-pointer' : 'cursor-default'
        }`}
        style={{
          transformStyle: 'preserve-3d',
          boxShadow:
            '0 12px 28px rgba(0,0,0,0.35), 0 2px 0 #cbd5e1, inset 0 2px 4px rgba(255,255,255,0.9)',
        }}
        aria-label={value ? `Dice showing ${value}` : 'Dice'}
      >
        <div className="die-face h-full w-full">
          {[...Array(9)].map((_, i) => (
            <span
              key={i}
              className={`die-dot transition-opacity ${dots.includes(i) ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
        </div>
      </motion.button>
    </div>
  )
}
