const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const ROOM_CODE_LENGTH = 6
export const PEER_ID_PREFIX = 'hm-'

export function generateRoomCode(): string {
  let code = ''
  const values = crypto.getRandomValues(new Uint32Array(ROOM_CODE_LENGTH))
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += CODE_CHARS[values[i]! % CODE_CHARS.length]
  }
  return code
}

export function normalizeRoomCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, ROOM_CODE_LENGTH)
}

export function isValidRoomCode(code: string): boolean {
  return code.length === ROOM_CODE_LENGTH && [...code].every((c) => CODE_CHARS.includes(c))
}

export function peerIdFromRoomCode(code: string): string {
  return `${PEER_ID_PREFIX}${normalizeRoomCode(code)}`
}
