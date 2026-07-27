export type TileType = 'normal' | 'question' | 'bonus' | 'penalty' | 'special' | 'start' | 'finish'

export type SpecialEffect =
  | 'go_back_3'
  | 'go_back_5'
  | 'ux_disaster'
  | 'switch_turn'
  | 'lucky_ux'
  | 'fast_track'
  | 'auto_save'
  | 'cognitive_overload'
  | 'none'

export interface BoardTile {
  id: number
  x: number
  y: number
  type: TileType
  special?: SpecialEffect
  label: string
  icon: string
  description?: string
}

export interface Question {
  id: string
  question: string
  answers: [string, string, string]
  correctIndex: 0 | 1 | 2
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
}

export type StatusEffect = 'auto_save' | 'skip_turn'

export type PlayerId = 0 | 1 | 2 | 3

export interface Player {
  id: PlayerId
  name: string
  avatar: string
  color: string
  position: number
  statusEffects: StatusEffect[]
  correctAnswers: number
  totalAnswers: number
  turnsPlayed: number
}

export type GamePhase =
  | 'home'
  | 'how_to_play'
  | 'online_lobby'
  | 'dice_off'
  | 'playing'
  | 'question'
  | 'dice_roll'
  | 'moving'
  | 'tile_effect'
  | 'win'

export type PlayMode = 'local' | 'online'

export interface GameStats {
  turnsPlayed: number
  winnerId: PlayerId | null
}

export interface PendingTileEffect {
  tileId: number
  effect: SpecialEffect | 'bonus' | 'penalty' | 'question_bonus'
  title: string
  message: string
  emoji: string
}

export interface GameState {
  phase: GamePhase
  players: Player[]
  currentPlayerIndex: PlayerId
  diceValue: number | null
  diceOff: {
    rolls: (number | null)[]
    rollingIndex: PlayerId | null
  }
  currentQuestion: Question | null
  lastAnswerCorrect: boolean | null
  showExplanation: boolean
  pendingEffect: PendingTileEffect | null
  usedQuestionIds: string[]
  bannerDismissed: boolean
  totalTurns: number
  winnerId: PlayerId | null
  isAnimating: boolean
  playAgainPending: boolean
  isBonusQuestion: boolean
}
