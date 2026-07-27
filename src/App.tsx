import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ConfirmLeaveModal } from './components/ConfirmLeaveModal'
import { DesktopBanner } from './components/DesktopBanner'
import { DiceOff } from './components/DiceOff'
import { GameScreen } from './components/GameScreen'
import { HomeScreen } from './components/HomeScreen'
import { HowToPlay } from './components/HowToPlay'
import { OnlineLobby } from './components/OnlineLobby'
import { WinScreen } from './components/WinScreen'
import { useGameState } from './hooks/useGameState'
import { useNetworkBridge } from './hooks/useNetworkBridge'

function App() {
  const game = useGameState()
  const net = useNetworkBridge(game)
  const { state } = game
  const [leaveOpen, setLeaveOpen] = useState(false)

  const inGamePhases = [
    'playing',
    'question',
    'dice_roll',
    'moving',
    'tile_effect',
  ].includes(state.phase)

  const matchInProgress = !['home', 'how_to_play', 'online_lobby'].includes(state.phase)

  useEffect(() => {
    if (!matchInProgress) return

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [matchInProgress])

  const requestLeave = () => setLeaveOpen(true)

  const confirmLeave = () => {
    setLeaveOpen(false)
    if (net.isOnline) net.leaveOnline()
    else game.playAgain()
  }

  const gameForUi = {
    ...game,
    beginTurn: net.beginTurn,
    answerQuestion: net.answerQuestion,
    continueAfterExplanation: net.continueAfterExplanation,
    acknowledgeEffect: net.acknowledgeEffect,
    commitDiceRoll: net.commitDiceRoll,
    completeMove: net.completeMove,
    setPlayerName: net.setPlayerName,
  }

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
            <HomeScreen
              onPlayLocal={(count) => {
                net.setPlayModeLocal()
                game.startLocalGame(count)
              }}
              onPlayOnline={() => {
                net.cancelSession()
                game.openOnlineLobby()
              }}
              onHowToPlay={game.showHowToPlay}
            />
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
            <HowToPlay
              onBack={game.goHome}
              onPlay={() => {
                net.setPlayModeLocal()
                game.startLocalGame(2)
              }}
            />
          </motion.div>
        )}

        {state.phase === 'online_lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-dvh"
          >
            <OnlineLobby
              status={net.sessionStatus}
              statusDetail={net.statusDetail}
              roomCode={net.roomCode}
              players={state.players}
              isHost={net.isHost}
              myPlayerIndex={net.myPlayerIndex}
              onBack={game.goHome}
              onCreate={net.createRoom}
              onJoin={net.joinRoom}
              onCancelSession={() => {
                net.cancelSession()
                game.openOnlineLobby()
              }}
              onStartMatch={net.startOnlineMatch}
              onNameChange={net.setPlayerName}
            />
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
              onRoll={net.rollDiceOff}
              onResolve={game.resolveDiceOff}
              onRequestLeave={requestLeave}
              myPlayerIndex={net.isOnline ? net.myPlayerIndex : null}
              roomCode={net.isOnline ? net.roomCode : null}
              isAuthority={net.isAuthority}
              onNameChange={net.setPlayerName}
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
            <GameScreen
              game={gameForUi}
              onRequestLeave={requestLeave}
              myPlayerIndex={net.isOnline ? net.myPlayerIndex : null}
              isAuthority={net.isAuthority}
              roomCode={net.isOnline ? net.roomCode : null}
            />
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
              others={state.players.filter((p) => p.id !== state.winnerId)}
              totalTurns={state.totalTurns}
              onPlayAgain={() => {
                if (net.isOnline) net.leaveOnline()
                else game.playAgain()
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmLeaveModal
        open={leaveOpen}
        onCancel={() => setLeaveOpen(false)}
        onConfirm={confirmLeave}
      />
    </div>
  )
}

export default App
