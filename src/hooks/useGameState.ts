import { useCallback, useReducer } from 'react'
import { FINISH_INDEX } from '../data/board'
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
  StatusEffect,
} from '../types/game'
import { playSound } from '../utils/sound'

const STORAGE_KEY = 'heuristics-master-banner'

function createPlayer(id: 0 | 1, name: string, avatar: string, color: string): Player {
  return {
    id,
    name,
    avatar,
    color,
    position: 0,
    statusEffects: [],
    correctAnswers: 0,
    totalAnswers: 0,
    turnsPlayed: 0,
  }
}

function loadBannerDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function createInitialState(): GameState {
  return {
    phase: 'home',
    players: [
      createPlayer(0, 'Player 1', '🦊', '#3ecfcf'),
      createPlayer(1, 'Player 2', '🦉', '#ff7a3c'),
    ],
    currentPlayerIndex: 0,
    diceValue: null,
    diceOff: { rolls: [null, null], rolling: false },
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
  | { type: 'START_DICE_OFF' }
  | { type: 'SET_DICE_OFF_ROLL'; playerIndex: 0 | 1; value: number }
  | { type: 'SET_DICE_OFF_ROLLING'; rolling: boolean }
  | { type: 'BEGIN_GAME'; starter: 0 | 1 }
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
  | { type: 'WIN'; winnerId: 0 | 1 }
  | { type: 'PLAY_AGAIN' }
  | { type: 'UPDATE_PLAYER'; index: 0 | 1; patch: Partial<Player> }
  | { type: 'SET_PENDING_NULL' }
  | { type: 'AFTER_BONUS_QUESTION'; correct: boolean }

function otherPlayer(i: 0 | 1): 0 | 1 {
  return i === 0 ? 1 : 0
}

function stripSkip(effects: StatusEffect[]): StatusEffect[] {
  return effects.filter((e) => e !== 'skip_turn')
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

    case 'START_DICE_OFF':
      return {
        ...createInitialState(),
        bannerDismissed: state.bannerDismissed,
        phase: 'dice_off',
        diceOff: { rolls: [null, null], rolling: false },
      }

    case 'RESET_DICE_OFF':
      return {
        ...state,
        diceOff: { rolls: [null, null], rolling: false },
      }

    case 'SET_DICE_OFF_ROLLING':
      return { ...state, diceOff: { ...state.diceOff, rolling: action.rolling } }

    case 'SET_DICE_OFF_ROLL': {
      const rolls: [number | null, number | null] = [...state.diceOff.rolls]
      rolls[action.playerIndex] = action.value
      return { ...state, diceOff: { ...state.diceOff, rolls, rolling: false } }
    }

    case 'BEGIN_GAME':
      return {
        ...state,
        phase: 'playing',
        currentPlayerIndex: action.starter,
        diceOff: { rolls: [null, null], rolling: false },
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
      const players = [...state.players] as [Player, Player]
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
      // Wrong answer — pass turn
      return passTurnState(state)
    }

    case 'SET_DICE':
      return { ...state, diceValue: action.value, phase: 'moving', isAnimating: true }

    case 'START_MOVING':
      return { ...state, phase: 'moving', isAnimating: true }

    case 'FINISH_MOVE': {
      const players = [...state.players] as [Player, Player]
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

      // No effect — check play again, else pass
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
      const players = [...state.players] as [Player, Player]
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
      // Called when bonus quiz from question tile is answered
      const players = [...state.players] as [Player, Player]
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
      const players = [...state.players] as [Player, Player]
      players[action.index] = { ...players[action.index], ...action.patch }
      return { ...state, players }
    }

    case 'SET_PENDING_NULL':
      return { ...state, pendingEffect: null }

    default:
      return state
  }
}

function passTurnState(state: GameState): GameState {
  let next = otherPlayer(state.currentPlayerIndex)
  const players = [...state.players] as [Player, Player]

  // Skip turn if cognitive overload
  if (players[next].statusEffects.includes('skip_turn')) {
    players[next] = {
      ...players[next],
      statusEffects: stripSkip(players[next].statusEffects),
    }
    // They skip — stay with... actually next player's skip means we skip them and go back?
    // "Lose one turn" means when it would be their turn, they skip.
    // So after current passes, next has skip → clear skip and go to the other (current again)?
    // No: if P0 finishes and P1 has skip, P1 loses turn, so P0 plays again.
    next = otherPlayer(next)
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

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)

  const dismissBanner = useCallback(() => dispatch({ type: 'DISMISS_BANNER' }), [])

  const goHome = useCallback(() => dispatch({ type: 'SET_PHASE', phase: 'home' }), [])
  const showHowToPlay = useCallback(
    () => dispatch({ type: 'SET_PHASE', phase: 'how_to_play' }),
    [],
  )

  const startDiceOff = useCallback(() => {
    playSound('click')
    dispatch({ type: 'START_DICE_OFF' })
  }, [])

  const rollDiceOff = useCallback(
    async (playerIndex: 0 | 1) => {
      if (state.diceOff.rolling) return
      if (state.diceOff.rolls[playerIndex] !== null) return
      dispatch({ type: 'SET_DICE_OFF_ROLLING', rolling: true })
      playSound('dice')
      await delay(900)
      const value = rollDice()
      dispatch({ type: 'SET_DICE_OFF_ROLL', playerIndex, value })
    },
    [state.diceOff],
  )

  const resolveDiceOff = useCallback(() => {
    const [a, b] = state.diceOff.rolls
    if (a === null || b === null) return
    if (a === b) {
      dispatch({ type: 'RESET_DICE_OFF' })
      return
    }
    const starter: 0 | 1 = a > b ? 0 : 1
    dispatch({ type: 'BEGIN_GAME', starter })
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

  const completeMove = useCallback(
    (finalPosition: number) => {
      playSound('move')
      dispatch({ type: 'FINISH_MOVE', position: finalPosition })
    },
    [],
  )

  const acknowledgeEffect = useCallback(() => {
    playSound('special')
    dispatch({ type: 'RESOLVE_EFFECT' })
  }, [])

  const playAgain = useCallback(() => {
    dispatch({ type: 'PLAY_AGAIN' })
  }, [])

  const setPlayerName = useCallback((index: 0 | 1, name: string) => {
    dispatch({ type: 'UPDATE_PLAYER', index, patch: { name } })
  }, [])

  return {
    state,
    dismissBanner,
    goHome,
    showHowToPlay,
    startDiceOff,
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
    setPlayerName,
    applyMove,
  }
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export type GameController = ReturnType<typeof useGameState>
