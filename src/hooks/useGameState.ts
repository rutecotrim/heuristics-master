import { useCallback, useReducer } from 'react'
import { FINISH_INDEX } from '../data/board'
import {
  createPlayer,
  createPlayers,
  defaultNameFor,
  type PlayerCount,
  resetPlayerForMatch,
} from '../data/players'
import { isCorrectAnswer, pickQuestion } from '../engine/questionEngine'
import {
  applyMove,
  applyTileEffectResult,
  buildTileEffect,
  hasReachedFinish,
  rollDice,
} from '../engine/tileEngine'
import type {
  GamePhase,
  GameState,
  Player,
  PlayerId,
  StatusEffect,
} from '../types/game'
import { playSound } from '../utils/sound'

const STORAGE_KEY = 'heuristics-master-banner'

function loadBannerDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function emptyRolls(count: number): (number | null)[] {
  return Array.from({ length: count }, () => null)
}

function createInitialState(): GameState {
  const players = createPlayers(2)
  return {
    phase: 'home',
    players,
    currentPlayerIndex: 0,
    diceValue: null,
    diceOff: { rolls: emptyRolls(players.length), rollingIndex: null },
    currentQuestion: null,
    lastAnswerCorrect: null,
    showExplanation: false,
    pendingEffect: null,
    usedQuestionIds: [],
    bannerDismissed: loadBannerDismissed(),
    totalTurns: 0,
    winnerId: null,
    isAnimating: false,
    playAgainPending: false,
    isBonusQuestion: false,
  }
}

type Action =
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'DISMISS_BANNER' }
  | { type: 'SETUP_PLAYERS'; players: Player[] }
  | { type: 'ADD_PLAYER'; player: Player }
  | { type: 'REMOVE_PLAYER'; index: PlayerId }
  | { type: 'START_DICE_OFF' }
  | { type: 'SET_DICE_OFF_ROLL'; playerIndex: PlayerId; value: number }
  | { type: 'SET_DICE_OFF_ROLLING'; playerIndex: PlayerId }
  | { type: 'BEGIN_GAME'; starter: PlayerId }
  | { type: 'RESET_DICE_OFF' }
  | { type: 'START_QUESTION'; isBonus?: boolean }
  | { type: 'ANSWER'; answerIndex: number }
  | { type: 'CONTINUE_AFTER_EXPLANATION' }
  | { type: 'SET_DICE'; value: number }
  | { type: 'START_MOVING' }
  | { type: 'FINISH_MOVE'; position: number }
  | { type: 'SHOW_EFFECT' }
  | { type: 'RESOLVE_EFFECT' }
  | { type: 'PASS_TURN' }
  | { type: 'SET_ANIMATING'; value: boolean }
  | { type: 'WIN'; winnerId: PlayerId }
  | { type: 'PLAY_AGAIN' }
  | { type: 'UPDATE_PLAYER'; index: PlayerId; patch: Partial<Player> }
  | { type: 'SET_PENDING_NULL' }
  | { type: 'AFTER_BONUS_QUESTION'; correct: boolean }
  | { type: 'HYDRATE'; state: Omit<GameState, 'bannerDismissed'> }
  | { type: 'OPEN_ONLINE_LOBBY' }

export type GameAction = Action

function stripSkip(effects: StatusEffect[]): StatusEffect[] {
  return effects.filter((e) => e !== 'skip_turn')
}

function nextPlayerIndex(from: PlayerId, count: number): PlayerId {
  return ((from + 1) % count) as PlayerId
}

function reindexPlayers(players: Player[]): Player[] {
  return players.map((p, i) => ({ ...p, id: i as PlayerId }))
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.phase }

    case 'DISMISS_BANNER':
      try {
        localStorage.setItem(STORAGE_KEY, '1')
      } catch {
        /* ignore */
      }
      return { ...state, bannerDismissed: true }

    case 'SETUP_PLAYERS':
      return {
        ...state,
        players: reindexPlayers(action.players),
        diceOff: { rolls: emptyRolls(action.players.length), rollingIndex: null },
        currentPlayerIndex: 0,
        winnerId: null,
      }

    case 'ADD_PLAYER': {
      if (state.players.length >= 4) return state
      const players = reindexPlayers([...state.players, action.player])
      return {
        ...state,
        players,
        diceOff: { rolls: emptyRolls(players.length), rollingIndex: null },
      }
    }

    case 'REMOVE_PLAYER': {
      if (state.players.length <= 1) return state
      const players = reindexPlayers(
        state.players.filter((_, i) => i !== action.index),
      )
      return {
        ...state,
        players,
        diceOff: { rolls: emptyRolls(players.length), rollingIndex: null },
        currentPlayerIndex: 0,
      }
    }

    case 'START_DICE_OFF': {
      const players = state.players.map(resetPlayerForMatch)
      return {
        ...state,
        players,
        phase: 'dice_off',
        currentPlayerIndex: 0,
        diceValue: null,
        diceOff: { rolls: emptyRolls(players.length), rollingIndex: null },
        currentQuestion: null,
        lastAnswerCorrect: null,
        showExplanation: false,
        pendingEffect: null,
        usedQuestionIds: [],
        totalTurns: 0,
        winnerId: null,
        isAnimating: false,
        playAgainPending: false,
        isBonusQuestion: false,
      }
    }

    case 'RESET_DICE_OFF':
      return {
        ...state,
        diceOff: { rolls: emptyRolls(state.players.length), rollingIndex: null },
      }

    case 'SET_DICE_OFF_ROLLING':
      return { ...state, diceOff: { ...state.diceOff, rollingIndex: action.playerIndex } }

    case 'SET_DICE_OFF_ROLL': {
      const rolls = [...state.diceOff.rolls]
      rolls[action.playerIndex] = action.value
      return { ...state, diceOff: { ...state.diceOff, rolls, rollingIndex: null } }
    }

    case 'BEGIN_GAME':
      return {
        ...state,
        phase: 'playing',
        currentPlayerIndex: action.starter,
        diceOff: { rolls: emptyRolls(state.players.length), rollingIndex: null },
      }

    case 'START_QUESTION': {
      const { question, usedIds } = pickQuestion(state.usedQuestionIds)
      return {
        ...state,
        phase: 'question',
        currentQuestion: question,
        usedQuestionIds: usedIds,
        lastAnswerCorrect: null,
        showExplanation: false,
        isBonusQuestion: !!action.isBonus,
        playAgainPending: false,
      }
    }

    case 'ANSWER': {
      if (!state.currentQuestion) return state
      const correct = isCorrectAnswer(state.currentQuestion, action.answerIndex)
      const players = [...state.players]
      const p = { ...players[state.currentPlayerIndex] }
      p.totalAnswers += 1
      if (correct) p.correctAnswers += 1
      players[state.currentPlayerIndex] = p
      return {
        ...state,
        players,
        lastAnswerCorrect: correct,
        showExplanation: true,
      }
    }

    case 'CONTINUE_AFTER_EXPLANATION': {
      if (state.lastAnswerCorrect) {
        return { ...state, phase: 'dice_roll', showExplanation: false }
      }
      return passTurnState(state)
    }

    case 'SET_DICE':
      return { ...state, diceValue: action.value, phase: 'moving', isAnimating: true }

    case 'START_MOVING':
      return { ...state, phase: 'moving', isAnimating: true }

    case 'FINISH_MOVE': {
      const players = [...state.players]
      const p = { ...players[state.currentPlayerIndex], position: action.position }
      p.turnsPlayed += 1
      players[state.currentPlayerIndex] = p

      if (hasReachedFinish(action.position)) {
        return {
          ...state,
          players,
          phase: 'win',
          winnerId: state.currentPlayerIndex,
          isAnimating: false,
          totalTurns: state.totalTurns + 1,
        }
      }

      const effect = buildTileEffect(action.position, p)
      if (effect) {
        return {
          ...state,
          players,
          pendingEffect: effect,
          phase: 'tile_effect',
          isAnimating: false,
          totalTurns: state.totalTurns + 1,
        }
      }

      if (state.playAgainPending) {
        return {
          ...state,
          players,
          playAgainPending: false,
          phase: 'playing',
          isAnimating: false,
          diceValue: null,
          totalTurns: state.totalTurns + 1,
        }
      }

      return passTurnState({
        ...state,
        players,
        isAnimating: false,
        diceValue: null,
        totalTurns: state.totalTurns + 1,
      })
    }

    case 'RESOLVE_EFFECT': {
      if (!state.pendingEffect) return state
      const players = [...state.players]
      const current = players[state.currentPlayerIndex]
      const result = applyTileEffectResult(current, state.pendingEffect.effect)

      const updated: Player = {
        ...current,
        position: result.position,
        statusEffects: result.statusEffects,
      }
      players[state.currentPlayerIndex] = updated

      if (hasReachedFinish(updated.position)) {
        return {
          ...state,
          players,
          pendingEffect: null,
          phase: 'win',
          winnerId: state.currentPlayerIndex,
        }
      }

      if (result.needsBonusQuestion) {
        const { question, usedIds } = pickQuestion(state.usedQuestionIds)
        return {
          ...state,
          players,
          pendingEffect: null,
          phase: 'question',
          currentQuestion: question,
          usedQuestionIds: usedIds,
          lastAnswerCorrect: null,
          showExplanation: false,
          isBonusQuestion: true,
          playAgainPending: false,
        }
      }

      if (result.playAgain) {
        return {
          ...state,
          players,
          pendingEffect: null,
          playAgainPending: false,
          phase: 'playing',
          diceValue: null,
        }
      }

      if (!result.passTurn) {
        return {
          ...state,
          players,
          pendingEffect: null,
          phase: 'playing',
          diceValue: null,
        }
      }

      return passTurnState({
        ...state,
        players,
        pendingEffect: null,
        diceValue: null,
      })
    }

    case 'AFTER_BONUS_QUESTION': {
      const players = [...state.players]
      const p = { ...players[state.currentPlayerIndex] }
      if (action.correct) {
        p.position = Math.min(p.position + 2, FINISH_INDEX)
      }
      players[state.currentPlayerIndex] = p

      if (hasReachedFinish(p.position)) {
        return {
          ...state,
          players,
          phase: 'win',
          winnerId: state.currentPlayerIndex,
          playAgainPending: false,
          isBonusQuestion: false,
          showExplanation: false,
        }
      }

      return passTurnState({
        ...state,
        players,
        playAgainPending: false,
        isBonusQuestion: false,
        showExplanation: false,
      })
    }

    case 'PASS_TURN':
      return passTurnState(state)

    case 'SET_ANIMATING':
      return { ...state, isAnimating: action.value }

    case 'WIN':
      return { ...state, phase: 'win', winnerId: action.winnerId }

    case 'PLAY_AGAIN':
      return {
        ...createInitialState(),
        bannerDismissed: state.bannerDismissed,
        phase: 'home',
      }

    case 'UPDATE_PLAYER': {
      if (!state.players[action.index]) return state
      const players = [...state.players]
      players[action.index] = { ...players[action.index], ...action.patch }
      return { ...state, players }
    }

    case 'SET_PENDING_NULL':
      return { ...state, pendingEffect: null }

    case 'HYDRATE':
      return {
        ...action.state,
        bannerDismissed: state.bannerDismissed,
      }

    case 'OPEN_ONLINE_LOBBY':
      return {
        ...createInitialState(),
        bannerDismissed: state.bannerDismissed,
        phase: 'online_lobby',
        players: [createPlayer(0)],
        diceOff: { rolls: [null], rollingIndex: null },
      }

    default:
      return state
  }
}

function passTurnState(state: GameState): GameState {
  const count = state.players.length
  const players = [...state.players]
  let next = nextPlayerIndex(state.currentPlayerIndex, count)
  let guarded = 0

  while (players[next]?.statusEffects.includes('skip_turn') && guarded < count) {
    players[next] = {
      ...players[next],
      statusEffects: stripSkip(players[next].statusEffects),
    }
    next = nextPlayerIndex(next, count)
    guarded += 1
  }

  return {
    ...state,
    players,
    currentPlayerIndex: next,
    phase: 'playing',
    currentQuestion: null,
    lastAnswerCorrect: null,
    showExplanation: false,
    diceValue: null,
    pendingEffect: null,
    playAgainPending: false,
    isBonusQuestion: false,
    isAnimating: false,
  }
}

function pickDiceOffWinner(rolls: (number | null)[]): PlayerId | 'tie' | null {
  if (rolls.length === 0 || rolls.some((r) => r === null)) return null
  const values = rolls as number[]
  const max = Math.max(...values)
  const winners = values
    .map((v, i) => (v === max ? i : -1))
    .filter((i) => i >= 0)
  if (winners.length !== 1) return 'tie'
  return winners[0] as PlayerId
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)

  const dismissBanner = useCallback(() => dispatch({ type: 'DISMISS_BANNER' }), [])

  const goHome = useCallback(() => dispatch({ type: 'SET_PHASE', phase: 'home' }), [])
  const showHowToPlay = useCallback(
    () => dispatch({ type: 'SET_PHASE', phase: 'how_to_play' }),
    [],
  )

  const setupPlayers = useCallback((count: PlayerCount) => {
    dispatch({ type: 'SETUP_PLAYERS', players: createPlayers(count) })
  }, [])

  const startDiceOff = useCallback(() => {
    playSound('click')
    dispatch({ type: 'START_DICE_OFF' })
  }, [])

  const startLocalGame = useCallback((count: PlayerCount) => {
    playSound('click')
    dispatch({ type: 'SETUP_PLAYERS', players: createPlayers(count) })
    dispatch({ type: 'START_DICE_OFF' })
  }, [])

  const rollDiceOff = useCallback(
    async (playerIndex: PlayerId) => {
      if (state.diceOff.rollingIndex !== null) return
      if (state.diceOff.rolls[playerIndex] !== null) return
      dispatch({ type: 'SET_DICE_OFF_ROLLING', playerIndex })
      playSound('dice')
      await delay(900)
      const value = rollDice()
      dispatch({ type: 'SET_DICE_OFF_ROLL', playerIndex, value })
    },
    [state.diceOff],
  )

  const resolveDiceOff = useCallback(() => {
    const result = pickDiceOffWinner(state.diceOff.rolls)
    if (result === null) return
    if (result === 'tie') {
      dispatch({ type: 'RESET_DICE_OFF' })
      return
    }
    dispatch({ type: 'BEGIN_GAME', starter: result })
  }, [state.diceOff.rolls])

  const beginTurn = useCallback(() => {
    playSound('whoosh')
    dispatch({ type: 'START_QUESTION' })
  }, [])

  const answerQuestion = useCallback((answerIndex: number) => {
    playSound('click')
    dispatch({ type: 'ANSWER', answerIndex })
  }, [])

  const continueAfterExplanation = useCallback(() => {
    if (state.lastAnswerCorrect) {
      playSound('correct')
    } else {
      playSound('wrong')
    }

    if (state.isBonusQuestion) {
      dispatch({
        type: 'AFTER_BONUS_QUESTION',
        correct: !!state.lastAnswerCorrect,
      })
      return
    }

    dispatch({ type: 'CONTINUE_AFTER_EXPLANATION' })
  }, [state.lastAnswerCorrect, state.isBonusQuestion])

  const rollTurnDice = useCallback(async () => {
    playSound('dice')
    dispatch({ type: 'SET_ANIMATING', value: true })
    await delay(1000)
    const value = rollDice()
    dispatch({ type: 'SET_DICE', value })
    return value
  }, [])

  const commitDiceRoll = useCallback((value: number) => {
    playSound('dice')
    dispatch({ type: 'SET_DICE', value })
  }, [])

  const completeMove = useCallback((finalPosition: number) => {
    playSound('move')
    dispatch({ type: 'FINISH_MOVE', position: finalPosition })
  }, [])

  const acknowledgeEffect = useCallback(() => {
    playSound('special')
    dispatch({ type: 'RESOLVE_EFFECT' })
  }, [])

  const playAgain = useCallback(() => {
    dispatch({ type: 'PLAY_AGAIN' })
  }, [])

  const openOnlineLobby = useCallback(() => {
    dispatch({ type: 'OPEN_ONLINE_LOBBY' })
  }, [])

  const hydrate = useCallback((sync: Omit<GameState, 'bannerDismissed'>) => {
    dispatch({ type: 'HYDRATE', state: sync })
  }, [])

  const setPlayerName = useCallback((index: PlayerId, name: string) => {
    const trimmed = name.trim().slice(0, 16) || defaultNameFor(index)
    dispatch({ type: 'UPDATE_PLAYER', index, patch: { name: trimmed } })
  }, [])

  const addPlayer = useCallback((player: Player) => {
    dispatch({ type: 'ADD_PLAYER', player })
  }, [])

  const removePlayer = useCallback((index: PlayerId) => {
    dispatch({ type: 'REMOVE_PLAYER', index })
  }, [])

  const dispatchAction = useCallback((action: Action) => {
    dispatch(action)
  }, [])

  return {
    state,
    dismissBanner,
    goHome,
    showHowToPlay,
    setupPlayers,
    startDiceOff,
    startLocalGame,
    rollDiceOff,
    resolveDiceOff,
    beginTurn,
    answerQuestion,
    continueAfterExplanation,
    rollTurnDice,
    commitDiceRoll,
    completeMove,
    acknowledgeEffect,
    playAgain,
    openOnlineLobby,
    hydrate,
    setPlayerName,
    addPlayer,
    removePlayer,
    dispatchAction,
    applyMove,
  }
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export type GameController = ReturnType<typeof useGameState>
