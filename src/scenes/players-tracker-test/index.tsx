import {
  AvatarBase,
  AvatarEquippedData,
  PlayerIdentityData,
  Transform,
  engine,
  type Entity
} from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, UiEntity, type JSX } from '@dcl/sdk/react-ecs'
import {
  getTrackedPlayers,
  getTrackerEvents,
  type TrackerEvent
} from '../main-scene/players-tracker'

export function main(): void {
  // tracker is started in main-scene, nothing to do here
}

function fmtTime(ms: number): string {
  const d = new Date(ms)
  const pad = (n: number): string => (n < 10 ? '0' + n.toString() : n.toString())
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function shortId(id: string): string {
  if (id === '') return '----'
  return id.slice(-4).toUpperCase()
}

function eventColor(kind: TrackerEvent['kind']): Color4 {
  if (kind === 'enter') return Color4.create(0.4, 0.95, 0.55, 1)
  if (kind === 'leave') return Color4.create(1, 0.45, 0.45, 1)
  return Color4.create(0.6, 0.8, 1, 1)
}

type AvatarRow = {
  entity: Entity
  address: string
  isGuest: boolean
  name: string
  bodyShape: string
  wearables: readonly string[]
  emotes: readonly string[]
  hasPosition: boolean
}

function getAvatarRows(): AvatarRow[] {
  const rows: AvatarRow[] = []
  for (const [entity, identity] of engine.getEntitiesWith(PlayerIdentityData)) {
    const base = AvatarBase.getOrNull(entity)
    const equipped = AvatarEquippedData.getOrNull(entity)
    const transform = Transform.getOrNull(entity)
    rows.push({
      entity,
      address: identity.address,
      isGuest: identity.isGuest,
      name: base?.name ?? '',
      bodyShape: base?.bodyShapeUrn ?? '',
      wearables: equipped?.wearableUrns ?? [],
      emotes: equipped?.emoteUrns ?? [],
      hasPosition: transform !== null
    })
  }
  rows.sort((a, b) => a.address.localeCompare(b.address))
  return rows
}

function ConnectedPlayersPanel(): JSX.Element {
  const players = getTrackedPlayers()
  const countLabel = `${players.length} ${
    players.length === 1 ? 'player online' : 'players online'
  }`

  return (
    <UiEntity
      uiTransform={{
        width: 380,
        padding: { top: 14, right: 14, bottom: 14, left: 14 },
        flexDirection: 'column',
        margin: { bottom: 12 }
      }}
      uiBackground={{ color: Color4.create(0.05, 0.08, 0.12, 0.92) }}
    >
      <Label
        value="Connected Players"
        fontSize={20}
        color={Color4.White()}
        textAlign="middle-left"
        uiTransform={{ width: '100%', height: 26, margin: { bottom: 4 } }}
      />
      <Label
        value={countLabel}
        fontSize={13}
        color={Color4.create(0.56, 0.79, 1, 0.95)}
        textAlign="middle-left"
        uiTransform={{ width: '100%', height: 18, margin: { bottom: 10 } }}
      />

      {players.length === 0 ? (
        <Label
          value="Waiting for players..."
          fontSize={14}
          color={Color4.create(1, 1, 1, 0.7)}
          textAlign="middle-left"
          uiTransform={{ width: '100%', height: 28 }}
        />
      ) : (
        players.map((p) => (
          <UiEntity
            key={p.userId}
            uiTransform={{
              width: '100%',
              height: 50,
              padding: { top: 8, bottom: 8, left: 12, right: 12 },
              margin: { bottom: 6 },
              flexDirection: 'column',
              justifyContent: 'center'
            }}
            uiBackground={{
              color: p.isLocal
                ? Color4.create(0.11, 0.2, 0.29, 0.88)
                : Color4.create(1, 1, 1, 0.05)
            }}
          >
            <Label
              value={`${p.name} #${shortId(p.userId)}`}
              fontSize={15}
              color={Color4.White()}
              textAlign="middle-left"
              uiTransform={{ width: '100%', height: 18 }}
            />
            <Label
              value={p.isLocal ? 'You' : p.isGuest ? 'Guest · In scene' : 'In scene'}
              fontSize={11}
              color={
                p.isLocal
                  ? Color4.create(0.48, 0.86, 1, 0.98)
                  : Color4.create(0.75, 0.81, 0.9, 0.84)
              }
              textAlign="middle-left"
              uiTransform={{ width: '100%', height: 14 }}
            />
          </UiEntity>
        ))
      )}
    </UiEntity>
  )
}

function EventsPanel(): JSX.Element {
  const events = getTrackerEvents().slice(0, 12)
  return (
    <UiEntity
      uiTransform={{
        width: 380,
        padding: { top: 14, right: 14, bottom: 14, left: 14 },
        flexDirection: 'column'
      }}
      uiBackground={{ color: Color4.create(0.05, 0.08, 0.12, 0.92) }}
    >
      <Label
        value="Tracker Events"
        fontSize={20}
        color={Color4.White()}
        textAlign="middle-left"
        uiTransform={{ width: '100%', height: 26, margin: { bottom: 4 } }}
      />
      <Label
        value={`last ${events.length} of ${getTrackerEvents().length}`}
        fontSize={13}
        color={Color4.create(0.56, 0.79, 1, 0.95)}
        textAlign="middle-left"
        uiTransform={{ width: '100%', height: 18, margin: { bottom: 10 } }}
      />

      {events.length === 0 ? (
        <Label
          value="No events yet"
          fontSize={14}
          color={Color4.create(1, 1, 1, 0.7)}
          textAlign="middle-left"
          uiTransform={{ width: '100%', height: 28 }}
        />
      ) : (
        events.map((ev, i) => (
          <UiEntity
            key={`${ev.at.toString()}-${i.toString()}-${ev.userId}`}
            uiTransform={{
              width: '100%',
              height: 22,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Label
              value={fmtTime(ev.at)}
              fontSize={12}
              color={Color4.create(0.7, 0.7, 0.7, 1)}
              textAlign="middle-left"
              uiTransform={{ width: 70, height: 18 }}
            />
            <Label
              value={ev.kind.toUpperCase()}
              fontSize={12}
              color={eventColor(ev.kind)}
              textAlign="middle-left"
              uiTransform={{ width: 80, height: 18 }}
            />
            <Label
              value={`${ev.name === '' ? 'Player' : ev.name} #${shortId(ev.userId)}`}
              fontSize={12}
              color={Color4.White()}
              textAlign="middle-left"
              uiTransform={{ width: 200, height: 18 }}
            />
          </UiEntity>
        ))
      )}
    </UiEntity>
  )
}

function AvatarsPanel(): JSX.Element {
  const rows = getAvatarRows()
  return (
    <UiEntity
      uiTransform={{
        width: 460,
        padding: { top: 14, right: 14, bottom: 14, left: 14 },
        flexDirection: 'column'
      }}
      uiBackground={{ color: Color4.create(0.08, 0.05, 0.12, 0.92) }}
    >
      <Label
        value="Avatars (PlayerIdentityData)"
        fontSize={20}
        color={Color4.White()}
        textAlign="middle-left"
        uiTransform={{ width: '100%', height: 26, margin: { bottom: 4 } }}
      />
      <Label
        value={`${rows.length} ${rows.length === 1 ? 'entity' : 'entities'} with PlayerIdentityData`}
        fontSize={13}
        color={Color4.create(0.85, 0.7, 1, 0.95)}
        textAlign="middle-left"
        uiTransform={{ width: '100%', height: 18, margin: { bottom: 10 } }}
      />

      {rows.length === 0 ? (
        <Label
          value="No avatar entities"
          fontSize={14}
          color={Color4.create(1, 1, 1, 0.7)}
          textAlign="middle-left"
          uiTransform={{ width: '100%', height: 28 }}
        />
      ) : (
        rows.map((r) => {
          const isMale = r.bodyShape.includes('BaseMale')
          const isFemale = r.bodyShape.includes('BaseFemale')
          const bodyTag = isMale ? 'Male' : isFemale ? 'Female' : '?'
          return (
            <UiEntity
              key={r.entity.toString()}
              uiTransform={{
                width: '100%',
                padding: { top: 8, bottom: 8, left: 12, right: 12 },
                margin: { bottom: 6 },
                flexDirection: 'column'
              }}
              uiBackground={{ color: Color4.create(1, 1, 1, 0.05) }}
            >
              <Label
                value={`${r.name === '' ? 'Player' : r.name} #${shortId(r.address)}  ·  entity ${r.entity.toString()}`}
                fontSize={14}
                color={Color4.White()}
                textAlign="middle-left"
                uiTransform={{ width: '100%', height: 18 }}
              />
              <Label
                value={`addr ${r.address.slice(0, 10)}…${r.address.slice(-6)}  ·  ${
                  r.isGuest ? 'Guest' : 'Web3'
                }  ·  body ${bodyTag}  ·  ${r.hasPosition ? 'has pos' : 'no pos'}`}
                fontSize={11}
                color={Color4.create(0.75, 0.81, 0.9, 0.84)}
                textAlign="middle-left"
                uiTransform={{ width: '100%', height: 14 }}
              />
              <Label
                value={`wearables: ${r.wearables.length}  ·  emotes: ${r.emotes.length}`}
                fontSize={11}
                color={Color4.create(0.56, 0.79, 1, 0.95)}
                textAlign="middle-left"
                uiTransform={{ width: '100%', height: 14 }}
              />
            </UiEntity>
          )
        })
      )}
    </UiEntity>
  )
}

export function UI(): JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { left: 12, top: 96, bottom: 12 },
        width: 880,
        flexDirection: 'row',
        alignItems: 'flex-start'
      }}
    >
      <UiEntity
        uiTransform={{
          width: 380,
          flexDirection: 'column',
          margin: { right: 12 }
        }}
      >
        <ConnectedPlayersPanel />
        <EventsPanel />
      </UiEntity>
      <AvatarsPanel />
    </UiEntity>
  )
}
