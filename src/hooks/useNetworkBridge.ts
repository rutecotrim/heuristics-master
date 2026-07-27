import { useCallback, useEffect, useRef, useState } from 'react'
import { createPlayer, defaultNameFor, MAX_PLAYERS, MIN_PLAYERS } from '../data/players'
import { isCorrectAnswer } from '../engine/questionEngine'
import { rollDice } from '../engine/tileEngine'
import { PeerRoomSession, type SessionStatus } from '../net/peerSession'
import {
  toSyncState,
  type GuestIntent,
  type NetMessage,
} from '../net/protocol'
import type { PlayMode, PlayerId } from '../types/game'
import { playSound } from '../utils/sound'
import type { GameController } from './useGameState'

export function useNetworkBridge(game: GameController) {
  const [playMode, setPlayMode] = useState<PlayMode>('local')
  const [myPlayerIndex, setMyPlayerIndex] = useState<PlayerId>(0)
  const [sessionRole, setSessionRole] = useState<'host' | 'guest' | null>(null)
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle')
  const [statusDetail, setStatusDetail] = useState<string | undefined>()
  const [roomCode, setRoomCode] = useState<string | null>(null)

  const sessionRef = useRef<PeerRoomSession | null>(null)
  /** Host: peerId → seat index */
  const seatByPeerRef = useRef<Map<string, PlayerId>>(new Map())
  const gameRef = useRef(game)
  gameRef.current = game

  const isOnline = playMode === 'online'
  const isHost = !isOnline || sessionRole === 'host'
  const isAuthority = !isOnline || isHost

  const destroySession = useCallback(() => {
    sessionRef.current?.destroy()
    sessionRef.current = null
    seatByPeerRef.current.clear()
    setSessionStatus('idle')
    setStatusDetail(undefined)
    setRoomCode(null)
    setSessionRole(null)
  }, [])

  const applyGuestIntent = useCallback(
    (intent: GuestIntent, fromPeerId: string) => {
      const g = gameRef.current
      const seat = seatByPeerRef.current.get(fromPeerId)
      if (seat === undefined) return

      switch (intent.type) {
        case 'dice_off_roll':
          playSound('dice')
          g.dispatchAction({
            type: 'SET_DICE_OFF_ROLL',
            playerIndex: seat,
            value: intent.value,
          })
          break
        case 'ready':
          if (g.state.currentPlayerIndex !== seat) return
          playSound('question')
          g.dispatchAction({ type: 'START_QUESTION' })
          break
        case 'answer':
          if (g.state.currentPlayerIndex !== seat) return
          if (g.state.currentQuestion) {
            playSound(
              isCorrectAnswer(g.state.currentQuestion, intent.answerIndex)
                ? 'correct'
                : 'wrong',
            )
          }
          g.dispatchAction({ type: 'ANSWER', answerIndex: intent.answerIndex })
          break
        case 'continue': {
          if (g.state.currentPlayerIndex !== seat) return
          const s = g.state
          if (s.isBonusQuestion) {
            g.dispatchAction({
              type: 'AFTER_BONUS_QUESTION',
              correct: !!s.lastAnswerCorrect,
            })
          } else {
            g.dispatchAction({ type: 'CONTINUE_AFTER_EXPLANATION' })
          }
          break
        }
        case 'ack_effect': {
          if (g.state.currentPlayerIndex !== seat) return
          const effect = g.state.pendingEffect?.effect
          const rewardEffects = new Set([
            'bonus',
            'lucky_ux',
            'fast_track',
            'auto_save',
            'question_bonus',
          ])
          const warnEffects = new Set([
            'penalty',
            'go_back_3',
            'go_back_5',
            'ux_disaster',
            'cognitive_overload',
          ])
          if (effect && rewardEffects.has(effect)) playSound('reward')
          else if (effect && warnEffects.has(effect)) playSound('warn')
          else playSound('info')
          g.dispatchAction({ type: 'RESOLVE_EFFECT' })
          break
        }        case 'set_name': {
          const trimmed = intent.name.trim().slice(0, 16) || defaultNameFor(seat)
          g.setPlayerName(seat, trimmed)
          break
        }
        default:
          break
      }
      queueMicrotask(() => {
        sessionRef.current?.broadcastState(toSyncState(gameRef.current.state))
      })
    },
    [],
  )

  const handleMessage = useCallback(
    (message: NetMessage, fromPeerId: string) => {
      const g = gameRef.current
      const session = sessionRef.current

      if (message.type === 'room_full' && session?.role === 'guest') {
        setSessionStatus('error')
        setStatusDetail('Room is full (max 4 players)')
        destroySession()
        setPlayMode('local')
        return
      }

      if (message.type === 'hello' && session?.role === 'host') {
        if (g.state.players.length >= MAX_PLAYERS) {
          session.sendTo(fromPeerId, { type: 'room_full' })
          return
        }
        if (g.state.phase !== 'online_lobby') {
          session.sendTo(fromPeerId, { type: 'room_full' })
          return
        }

        const seat = g.state.players.length as PlayerId
        const name = message.name?.trim() || defaultNameFor(seat)
        seatByPeerRef.current.set(fromPeerId, seat)
        g.addPlayer(createPlayer(seat, name))

        queueMicrotask(() => {
          const sync = toSyncState(gameRef.current.state)
          session.sendTo(fromPeerId, { type: 'welcome', seat, state: sync })
          session.broadcastState(sync)
        })
        return
      }

      if (message.type === 'welcome' && session?.role === 'guest') {
        setMyPlayerIndex(message.seat)
        g.hydrate(message.state)
        setSessionStatus('connected')
        return
      }

      if (message.type === 'state' && session?.role === 'guest') {
        g.hydrate(message.state)
        return
      }

      if (message.type === 'intent' && session?.role === 'host') {
        applyGuestIntent(message.intent, fromPeerId)
      }

      if (message.type === 'peer_left' && session?.role === 'host') {
        // handled via connection close
      }
    },
    [applyGuestIntent, destroySession],
  )

  const handleMessageRef = useRef(handleMessage)
  handleMessageRef.current = handleMessage

  const endOnlineMatch = useCallback(
    (detail?: string) => {
      setSessionStatus('disconnected')
      if (detail) setStatusDetail(detail)
      gameRef.current.playAgain()
      setPlayMode('local')
      setMyPlayerIndex(0)
      destroySession()
    },
    [destroySession],
  )

  const createRoom = useCallback(
    async (code: string) => {
      destroySession()
      setPlayMode('online')
      setSessionRole('host')
      setMyPlayerIndex(0)
      setRoomCode(code)
      seatByPeerRef.current.clear()

      gameRef.current.openOnlineLobby()

      const session = new PeerRoomSession({
        onStatus: (status, detail) => {
          setSessionStatus(status)
          setStatusDetail(detail)
        },
        onConnected: () => {
          /* guest connected — hello will assign seat */
        },
        onMessage: (msg, from) => handleMessageRef.current(msg, from),
        onPeerDisconnected: (peerId) => {
          const seat = seatByPeerRef.current.get(peerId)
          seatByPeerRef.current.delete(peerId)
          const g = gameRef.current
          if (seat === undefined) return

          if (g.state.phase === 'online_lobby') {
            g.removePlayer(seat)
            const remaining = [...seatByPeerRef.current.entries()].sort(
              (a, b) => a[1] - b[1],
            )
            seatByPeerRef.current.clear()
            queueMicrotask(() => {
              const sync = toSyncState(gameRef.current.state)
              const sess = sessionRef.current
              remaining.forEach(([pid], i) => {
                const newSeat = (i + 1) as PlayerId
                seatByPeerRef.current.set(pid, newSeat)
                sess?.sendTo(pid, { type: 'welcome', seat: newSeat, state: sync })
              })
              sess?.broadcastState(sync)
            })
            return
          }

          endOnlineMatch('A player left the match')
        },
        onDisconnected: () => {
          endOnlineMatch('Connection lost')
        },
      })
      sessionRef.current = session
      try {
        await session.createRoom(code)
      } catch {
        setPlayMode('local')
        setSessionRole(null)
      }
    },
    [destroySession, endOnlineMatch],
  )

  const joinRoom = useCallback(
    async (code: string) => {
      destroySession()
      setPlayMode('online')
      setSessionRole('guest')
      setRoomCode(code)

      const session = new PeerRoomSession({
        onStatus: (status, detail) => {
          setSessionStatus(status)
          setStatusDetail(detail)
        },
        onConnected: () => setSessionStatus('connected'),
        onMessage: (msg, from) => handleMessageRef.current(msg, from),
        onPeerDisconnected: () => {
          endOnlineMatch('Host disconnected')
        },
        onDisconnected: () => {
          endOnlineMatch('Host disconnected')
        },
      })
      sessionRef.current = session
      try {
        await session.joinRoom(code)
      } catch {
        setPlayMode('local')
        setSessionRole(null)
        setMyPlayerIndex(0)
      }
    },
    [destroySession, endOnlineMatch],
  )

  const cancelSession = useCallback(() => {
    destroySession()
    setPlayMode('local')
    setMyPlayerIndex(0)
  }, [destroySession])

  const leaveOnline = useCallback(() => {
    sessionRef.current?.send({ type: 'peer_left' })
    destroySession()
    setPlayMode('local')
    setMyPlayerIndex(0)
    game.playAgain()
  }, [destroySession, game])

  const startOnlineMatch = useCallback(() => {
    if (!isHost || !isOnline) return
    if (game.state.players.length < MIN_PLAYERS) return
    game.startDiceOff()
    queueMicrotask(() => {
      sessionRef.current?.broadcastState(toSyncState(gameRef.current.state))
    })
  }, [game, isHost, isOnline])

  // Host broadcasts after local state changes during online play
  useEffect(() => {
    if (playMode !== 'online') return
    if (sessionRef.current?.role !== 'host') return
    if (game.state.phase === 'home') return
    sessionRef.current.broadcastState(toSyncState(game.state))
  }, [game.state, playMode])

  const sendIntent = useCallback((intent: GuestIntent) => {
    sessionRef.current?.sendIntent(intent)
  }, [])

  const networked = {
    playMode,
    myPlayerIndex,
    isOnline,
    isHost,
    isAuthority,
    sessionStatus,
    statusDetail,
    roomCode,
    createRoom,
    joinRoom,
    cancelSession,
    leaveOnline,
    startOnlineMatch,
    setPlayModeLocal: () => {
      setPlayMode('local')
      setMyPlayerIndex(0)
    },

    beginTurn: () => {
      if (isOnline && !isHost) {
        sendIntent({ type: 'ready' })
        return
      }
      game.beginTurn()
    },

    answerQuestion: (answerIndex: number) => {
      if (isOnline && !isHost) {
        sendIntent({ type: 'answer', answerIndex })
        return
      }
      game.answerQuestion(answerIndex)
    },

    continueAfterExplanation: () => {
      if (isOnline && !isHost) {
        sendIntent({ type: 'continue' })
        return
      }
      game.continueAfterExplanation()
    },

    acknowledgeEffect: () => {
      if (isOnline && !isHost) {
        sendIntent({ type: 'ack_effect' })
        return
      }
      game.acknowledgeEffect()
    },

    rollDiceOff: async (playerIndex: PlayerId) => {
      if (isOnline) {
        if (playerIndex !== myPlayerIndex) return
        if (game.state.diceOff.rolls[playerIndex] !== null) return
        if (!isHost) {
          const value = rollDice()
          playSound('dice')
          sendIntent({ type: 'dice_off_roll', value })
          return
        }
      }
      await game.rollDiceOff(playerIndex)
    },

    commitDiceRoll: (value: number) => {
      if (!isAuthority) return
      game.commitDiceRoll(value)
    },

    completeMove: (finalPosition: number) => {
      if (!isAuthority) return
      game.completeMove(finalPosition)
    },

    setPlayerName: (index: PlayerId, name: string) => {
      const trimmed = name.trim().slice(0, 16)
      const next = trimmed || defaultNameFor(index)
      if (isOnline) {
        if (index !== myPlayerIndex) return
        if (!isHost) {
          sendIntent({ type: 'set_name', name: next })
          return
        }
      }
      game.setPlayerName(index, next)
    },
  }

  return networked
}

export type NetworkBridge = ReturnType<typeof useNetworkBridge>
