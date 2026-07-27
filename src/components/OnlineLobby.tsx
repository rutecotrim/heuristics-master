import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, DoorOpen, Loader2, Radio, Check, Play } from 'lucide-react'
import { MAX_PLAYERS, MIN_PLAYERS } from '../data/players'
import {
  generateRoomCode,
  isValidRoomCode,
  normalizeRoomCode,
  ROOM_CODE_LENGTH,
} from '../net/roomCode'
import type { SessionStatus } from '../net/peerSession'
import type { Player, PlayerId } from '../types/game'
import { ScreenShell } from './ScreenShell'

interface OnlineLobbyProps {
  status: SessionStatus
  statusDetail?: string
  roomCode: string | null
  players: Player[]
  isHost: boolean
  myPlayerIndex: number
  onBack: () => void
  onCreate: (code: string) => void
  onJoin: (code: string) => void
  onCancelSession: () => void
  onStartMatch: () => void
  onNameChange: (index: PlayerId, name: string) => void
}

export function OnlineLobby({
  status,
  statusDetail,
  roomCode,
  players,
  isHost,
  myPlayerIndex,
  onBack,
  onCreate,
  onJoin,
  onCancelSession,
  onStartMatch,
  onNameChange,
}: OnlineLobbyProps) {
  const [joinCode, setJoinCode] = useState('')
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const busy = status === 'creating' || status === 'joining'
  const showRoom = status === 'waiting' || status === 'connected'
  const canStart = isHost && players.length >= MIN_PLAYERS && showRoom

  const handleCreate = () => {
    const code = generateRoomCode()
    setCreatedCode(code)
    onCreate(code)
  }

  const handleJoin = () => {
    const code = normalizeRoomCode(joinCode)
    if (!isValidRoomCode(code)) return
    onJoin(code)
  }

  const copyCode = async () => {
    const code = roomCode || createdCode
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  const displayCode = roomCode || createdCode

  return (
    <ScreenShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel w-full max-w-lg rounded-[1.75rem] p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={() => {
            onCancelSession()
            onBack()
          }}
          className="mb-4 flex items-center gap-2 text-sm font-bold text-ink-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-2 flex items-center gap-2 text-felt">
          <Radio className="h-5 w-5" />
          <p className="font-display text-xs font-extrabold uppercase tracking-wider">
            Online match
          </p>
        </div>

        <h2 className="font-display text-3xl font-extrabold text-ink">Play with friends</h2>
        <p className="mt-2 text-sm font-semibold text-ink-muted">
          Up to {MAX_PLAYERS} players. Share a room code. Host starts when everyone is in.
        </p>

        {status === 'error' && (
          <div className="mt-4 rounded-2xl bg-berry/10 px-4 py-3 text-sm font-semibold text-berry">
            {statusDetail || 'Something went wrong. Try a new room code.'}
          </div>
        )}

        {showRoom && displayCode && (
          <div className="mt-6 rounded-2xl bg-felt/10 p-5">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-ink-muted">
              Room code
            </p>
            <p className="font-display mt-2 text-center text-4xl font-extrabold tracking-[0.2em] text-ink">
              {displayCode}
            </p>
            <div className="mt-4 flex justify-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={copyCode}
                className="font-display inline-flex items-center gap-2 rounded-xl bg-felt px-4 py-2 text-sm font-bold text-lime-pop"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy code'}
              </motion.button>
            </div>

            <div className="mt-5 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Players ({players.length}/{MAX_PLAYERS})
              </p>
              {players.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl bg-white/50 px-3 py-2"
                  style={{ borderLeft: `4px solid ${p.color}` }}
                >
                  <span className="text-2xl">{p.avatar}</span>
                  {i === myPlayerIndex ? (
                    <input
                      value={p.name}
                      maxLength={16}
                      onChange={(e) => onNameChange(i as PlayerId, e.target.value)}
                      className="font-display min-w-0 flex-1 rounded-lg border border-felt/20 bg-white/80 px-2 py-1 text-sm font-extrabold text-ink outline-none focus:border-tangerine"
                      aria-label="Your name"
                    />
                  ) : (
                    <span className="font-display flex-1 truncate text-sm font-extrabold text-ink">
                      {p.name}
                    </span>
                  )}
                  {i === 0 && (
                    <span className="text-[10px] font-bold uppercase text-ink-muted">Host</span>
                  )}
                  {i === myPlayerIndex && (
                    <span className="text-[10px] font-bold uppercase text-tangerine-deep">You</span>
                  )}
                </div>
              ))}
            </div>

            {status === 'waiting' && players.length < MAX_PLAYERS && (
              <p className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-ink-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Waiting for friends…
              </p>
            )}

            {canStart && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartMatch}
                className="btn-primary font-display mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-lg font-extrabold"
              >
                <Play className="h-5 w-5" />
                Start game ({players.length} players)
              </motion.button>
            )}

            {!isHost && showRoom && (
              <p className="mt-4 text-center text-sm font-semibold text-ink-muted">
                Waiting for host to start…
              </p>
            )}

            <button
              type="button"
              onClick={onCancelSession}
              className="mt-3 w-full text-sm font-bold text-berry"
            >
              Leave room
            </button>
          </div>
        )}

        {(status === 'idle' || status === 'error' || status === 'disconnected') && !showRoom && (
          <div className="mt-6 space-y-4">
            <motion.button
              type="button"
              disabled={busy}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              className="btn-primary font-display flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-extrabold"
            >
              <DoorOpen className="h-5 w-5" />
              Create room
            </motion.button>

            <div className="rounded-2xl border border-felt/15 bg-felt/5 p-4">
              <p className="font-display text-sm font-extrabold text-ink">Join a room</p>
              <div className="mt-3 flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(normalizeRoomCode(e.target.value))}
                  placeholder="ABC123"
                  maxLength={ROOM_CODE_LENGTH}
                  className="font-display min-w-0 flex-1 rounded-xl border-2 border-felt/15 bg-white/70 px-4 py-3 text-center text-lg font-extrabold tracking-[0.25em] text-ink outline-none focus:border-tangerine"
                  aria-label="Room code"
                />
                <motion.button
                  type="button"
                  disabled={!isValidRoomCode(normalizeRoomCode(joinCode)) || busy}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleJoin}
                  className="btn-primary font-display rounded-xl px-5 py-3 text-sm font-extrabold disabled:opacity-40"
                >
                  Join
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {(status === 'creating' || status === 'joining') && (
          <p className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            {status === 'creating' ? 'Opening room…' : 'Connecting…'}
          </p>
        )}
      </motion.div>
    </ScreenShell>
  )
}
