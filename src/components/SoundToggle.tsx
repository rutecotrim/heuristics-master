import { useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { isSoundEnabled, playSound, setSoundEnabled, unlockSound } from '../utils/sound'

interface SoundToggleProps {
  className?: string
}

export function SoundToggle({ className = '' }: SoundToggleProps) {
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled())

  const toggleSound = async () => {
    await unlockSound()
    const next = !isSoundEnabled()
    setSoundEnabled(next)
    setSoundOn(next)
    if (next) playSound('ui')
  }

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => void toggleSound()}
      className={`font-display inline-flex items-center gap-2 rounded-full border border-parchment/25 bg-parchment/10 px-3 py-1.5 text-xs font-extrabold text-parchment backdrop-blur-md transition hover:bg-parchment/20 ${className}`}
      aria-pressed={soundOn}
      aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
    >
      {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      {soundOn ? 'Sound on' : 'Sound off'}
    </motion.button>
  )
}
