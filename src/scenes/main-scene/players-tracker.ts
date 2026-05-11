import { engine } from '@dcl/sdk/ecs'
import { getPlayer, onEnterScene, onLeaveScene } from '@dcl/sdk/players'

export type TrackedPlayer = {
  userId: string
  name: string
  isLocal: boolean
  isGuest: boolean
  enteredAt: number
}

export type TrackerEvent = {
  kind: 'enter' | 'leave' | 'local-init'
  userId: string
  name: string
  at: number
}

const players = new Map<string, TrackedPlayer>()
const events: TrackerEvent[] = []
const MAX_EVENTS = 100
let localPlayerId = ''
let started = false

function nowMs(): number {
  return Math.floor(Date.now())
}

function pushEvent(ev: TrackerEvent): void {
  events.unshift(ev)
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS
  console.log('[players-tracker]', ev.kind, ev.userId, ev.name)
}

function upsert(
  userId: string,
  name: string,
  isLocal: boolean,
  isGuest: boolean
): void {
  if (userId === '') return
  const existing = players.get(userId)
  players.set(userId, {
    userId,
    name,
    isLocal: isLocal || userId === localPlayerId,
    isGuest,
    enteredAt: existing?.enteredAt ?? nowMs()
  })
}

export function startPlayersTracker(): void {
  if (started) return
  started = true

  const local = getPlayer()
  if (local?.userId !== undefined && local.userId !== '') {
    localPlayerId = local.userId
    upsert(local.userId, local.name ?? '', true, local.isGuest)
    pushEvent({
      kind: 'local-init',
      userId: local.userId,
      name: local.name ?? '',
      at: nowMs()
    })
  }

  onEnterScene((player) => {
    if (player?.userId === undefined || player.userId === '') return
    const isLocal = player.entity === engine.PlayerEntity
    upsert(player.userId, player.name ?? '', isLocal, player.isGuest)
    pushEvent({
      kind: 'enter',
      userId: player.userId,
      name: player.name ?? '',
      at: nowMs()
    })
  })

  onLeaveScene((userId) => {
    const existing = players.get(userId)
    players.delete(userId)
    pushEvent({
      kind: 'leave',
      userId,
      name: existing?.name ?? '',
      at: nowMs()
    })
  })
}

export function getTrackedPlayers(): TrackedPlayer[] {
  return Array.from(players.values()).sort((a, b) => {
    if (a.isLocal !== b.isLocal) return a.isLocal ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export function getTrackerEvents(): TrackerEvent[] {
  return events
}

export function getLocalPlayerId(): string {
  return localPlayerId
}
