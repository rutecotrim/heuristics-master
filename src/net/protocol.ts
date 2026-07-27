import type { GameState, PlayerId } from '../types/game'

/** Game snapshot shared over the wire (banner preference stays local). */
export type SyncState = Omit<GameState, 'bannerDismissed'>

export type GuestIntent =
  | { type: 'dice_off_roll'; value: number }
  | { type: 'ready' }
  | { type: 'answer'; answerIndex: number }
  | { type: 'continue' }
  | { type: 'ack_effect' }
  | { type: 'set_name'; name: string }

export type NetMessage =
  | { type: 'hello'; name: string }
  | { type: 'welcome'; seat: PlayerId; state: SyncState }
  | { type: 'state'; state: SyncState }
  | { type: 'intent'; intent: GuestIntent }
  | { type: 'peer_left' }
  | { type: 'room_full' }

export function toSyncState(state: GameState): SyncState {
  const { bannerDismissed: _, ...rest } = state
  return rest
}

export function fromSyncState(sync: SyncState, bannerDismissed: boolean): GameState {
  return { ...sync, bannerDismissed }
}
