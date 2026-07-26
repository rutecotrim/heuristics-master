import { AnimatePresence, motion } from 'framer-motion'
import { DesktopBanner } from './components/DesktopBanner'
import { DiceOff } from './components/DiceOff'
import { GameScreen } from './components/GameScreen'
import { HomeScreen } from './components/HomeScreen'
import { HowToPlay } from './components/HowToPlay'
import { WinScreen } from './components/WinScreen'
import { useGameState } from './hooks/useGameState'

function App() {
  const game = useGameState()
  const { state } = game

  const inGamePhases = [
    'playing',
    'question',
    'dice_roll',
    'moving',
    'tile_effect',
  ].includes(state.phase)

  return (
    <div className="game-bg relative min-h-dvh">
      <DesktopBanner visible={!state.bannerDismissed} onDismiss={game.dismissBanner} />

      <AnimatePresence mode="wait">
        {state.phase === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-dvh"
          >
            <HomeScreen onPlay={game.startDiceOff} onHowToPlay={game.showHowToPlay} />
          </motion.div>
        )}

        {state.phase === 'how_to_play' && (
          <motion.div
            key="howto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-dvh"
          >
            <HowToPlay onBack={game.goHome} onPlay={game.startDiceOff} />
          </motion.div>
        )}

        {state.phase === 'dice_off' && (
          <motion.div
            key="diceoff"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-dvh"
          >
            <DiceOff
              state={state}
              onRoll={game.rollDiceOff}
              onResolve={game.resolveDiceOff}
            />
          </motion.div>
        )}

        {inGamePhases && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-dvh"
          >
            <GameScreen game={game} />
          </motion.div>
        )}

        {state.phase === 'win' && state.winnerId !== null && (
          <motion.div
            key="win"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-dvh"
          >
            <WinScreen
              winner={state.players[state.winnerId]}
              loser={state.players[state.winnerId === 0 ? 1 : 0]}
              totalTurns={state.totalTurns}
              onPlayAgain={game.playAgain}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
