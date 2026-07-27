import Peer, { type DataConnection } from 'peerjs'
import { MAX_PLAYERS } from '../data/players'
import { peerIdFromRoomCode } from './roomCode'
import type { GuestIntent, NetMessage, SyncState } from './protocol'

export type SessionRole = 'host' | 'guest'

export type SessionStatus =
  | 'idle'
  | 'creating'
  | 'waiting'
  | 'joining'
  | 'connected'
  | 'error'
  | 'disconnected'

type SessionHandlers = {
  onStatus: (status: SessionStatus, detail?: string) => void
  onConnected: (peerId: string) => void
  onMessage: (message: NetMessage, fromPeerId: string) => void
  onPeerDisconnected: (peerId: string) => void
  onDisconnected: () => void
}

const MAX_GUESTS = MAX_PLAYERS - 1

export class PeerRoomSession {
  private peer: Peer | null = null
  /** Host: all guest connections. Guest: single connection to host. */
  private conns = new Map<string, DataConnection>()
  private handlers: SessionHandlers
  role: SessionRole | null = null
  roomCode: string | null = null

  constructor(handlers: SessionHandlers) {
    this.handlers = handlers
  }

  get guestCount(): number {
    return this.conns.size
  }

  async createRoom(roomCode: string): Promise<void> {
    this.destroy()
    this.role = 'host'
    this.roomCode = roomCode
    this.handlers.onStatus('creating')

    const peer = new Peer(peerIdFromRoomCode(roomCode), {
      debug: 0,
    })
    this.peer = peer

    await new Promise<void>((resolve, reject) => {
      const onOpen = () => {
        cleanup()
        resolve()
      }
      const onError = (err: Error) => {
        cleanup()
        reject(err)
      }
      const cleanup = () => {
        peer.off('open', onOpen)
        peer.off('error', onError)
      }
      peer.on('open', onOpen)
      peer.on('error', onError)
    }).catch((err: Error) => {
      this.handlers.onStatus('error', err.message || 'Could not create room')
      this.destroy()
      throw err
    })

    this.handlers.onStatus('waiting')

    peer.on('connection', (connection) => {
      if (this.conns.size >= MAX_GUESTS) {
        connection.on('open', () => {
          try {
            connection.send({ type: 'room_full' } satisfies NetMessage)
          } catch {
            /* ignore */
          }
          connection.close()
        })
        return
      }
      this.bindConnection(connection)
    })

    peer.on('disconnected', () => {
      this.handlers.onStatus('disconnected')
      this.handlers.onDisconnected()
    })

    peer.on('error', (err) => {
      this.handlers.onStatus('error', err.message)
    })
  }

  async joinRoom(roomCode: string): Promise<void> {
    this.destroy()
    this.role = 'guest'
    this.roomCode = roomCode
    this.handlers.onStatus('joining')

    const peer = new Peer({ debug: 0 })
    this.peer = peer

    await new Promise<void>((resolve, reject) => {
      const onOpen = () => {
        cleanup()
        resolve()
      }
      const onError = (err: Error) => {
        cleanup()
        reject(err)
      }
      const cleanup = () => {
        peer.off('open', onOpen)
        peer.off('error', onError)
      }
      peer.on('open', onOpen)
      peer.on('error', onError)
    }).catch((err: Error) => {
      this.handlers.onStatus('error', err.message || 'Could not join')
      this.destroy()
      throw err
    })

    const connection = peer.connect(peerIdFromRoomCode(roomCode), { reliable: true })
    this.bindConnection(connection)

    peer.on('error', (err) => {
      this.handlers.onStatus('error', err.message)
    })
  }

  send(message: NetMessage): void {
    if (this.role === 'guest') {
      const conn = [...this.conns.values()][0]
      if (conn?.open) conn.send(message)
      return
    }
    this.broadcast(message)
  }

  sendTo(peerId: string, message: NetMessage): void {
    const conn = this.conns.get(peerId)
    if (conn?.open) conn.send(message)
  }

  broadcast(message: NetMessage): void {
    for (const conn of this.conns.values()) {
      if (conn.open) conn.send(message)
    }
  }

  broadcastState(state: SyncState): void {
    this.broadcast({ type: 'state', state })
  }

  sendIntent(intent: GuestIntent): void {
    this.send({ type: 'intent', intent })
  }

  destroy(): void {
    for (const conn of this.conns.values()) {
      try {
        conn.close()
      } catch {
        /* ignore */
      }
    }
    this.conns.clear()
    try {
      this.peer?.destroy()
    } catch {
      /* ignore */
    }
    this.peer = null
    this.role = null
    this.roomCode = null
  }

  private bindConnection(connection: DataConnection): void {
    const peerId = connection.peer
    this.conns.set(peerId, connection)

    connection.on('open', () => {
      this.handlers.onStatus('connected')
      this.handlers.onConnected(peerId)
      if (this.role === 'guest') {
        this.send({ type: 'hello', name: 'Player' })
      }
    })

    connection.on('data', (data) => {
      if (!data || typeof data !== 'object') return
      this.handlers.onMessage(data as NetMessage, peerId)
    })

    connection.on('close', () => {
      this.conns.delete(peerId)
      this.handlers.onPeerDisconnected(peerId)
      if (this.role === 'guest' || this.conns.size === 0) {
        if (this.role === 'guest') {
          this.handlers.onStatus('disconnected')
          this.handlers.onDisconnected()
        } else if (this.conns.size === 0) {
          this.handlers.onStatus('waiting')
        }
      }
    })

    connection.on('error', (err) => {
      this.handlers.onStatus('error', err.message)
    })
  }
}
