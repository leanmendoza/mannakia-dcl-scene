import {
  engine,
  InputAction,
  Material,
  MeshCollider,
  MeshRenderer,
  pointerEventsSystem,
  TextShape,
  Transform,
  VideoEvent,
  VideoPlayer,
  VideoState,
  type Entity
} from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { signedFetch } from '~system/SignedFetch'
import { getRealm } from '~system/Runtime'
import { sceneSystems } from '../../utils/system'

type RealmInfo = {
  networkId?: number
  [key: string]: unknown
}

let cachedRealm: RealmInfo | undefined

async function ensureRealm(): Promise<RealmInfo | undefined> {
  if (cachedRealm !== undefined) return cachedRealm
  try {
    cachedRealm = (await getRealm({})).realmInfo as RealmInfo | undefined
    return cachedRealm
  } catch {
    return undefined
  }
}

function currentTld(): 'org' | 'zone' {
  return !cachedRealm || cachedRealm.networkId === 1 ? 'org' : 'zone'
}

function snakeToCamel<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {}
  for (const key in obj) {
    const camel = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
    out[camel] = obj[key]
  }
  return out as T
}

type StreamKeyResponse = {
  streamingUrl?: string
  streamingKey?: string
}

async function signedFetchJson(
  url: string,
  method?: 'GET' | 'POST' | 'PUT'
): Promise<[string | null, StreamKeyResponse | null]> {
  await ensureRealm()
  try {
    console.log(`[VideoTest] signedFetch ${method || 'GET'} ${url}`)
    const res = await signedFetch({
      url,
      init: { method: method || 'GET', headers: {} }
    })
    console.log(`[VideoTest] response ok=${res.ok} body=${res.body?.substring(0, 200)}`)
    if (!res.ok) return [res.body || 'Request failed', null]
    const parsed = JSON.parse(res.body || '{}')
    return [null, snakeToCamel(parsed) as StreamKeyResponse]
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.log(`[VideoTest] signedFetch exception: ${msg}`)
    return [msg, null]
  }
}

function streamAccessUrl(): string {
  return `https://comms-gatekeeper.decentraland.${currentTld()}/scene-stream-access`
}

async function getStreamKey(): Promise<[string | null, StreamKeyResponse | null]> {
  await ensureRealm()
  return await signedFetchJson(streamAccessUrl())
}

async function generateStreamKey(): Promise<[string | null, StreamKeyResponse | null]> {
  await ensureRealm()
  return await signedFetchJson(streamAccessUrl(), 'POST')
}

async function resetStreamKey(): Promise<[string | null, StreamKeyResponse | null]> {
  await ensureRealm()
  return await signedFetchJson(streamAccessUrl(), 'PUT')
}

type StreamKeyInfo = { url: string; key: string; error?: string }

async function fetchStreamKeyInfo(): Promise<StreamKeyInfo> {
  console.log(`[VideoTest] fetchStreamKeyInfo - realm: ${JSON.stringify(cachedRealm)}`)
  const [getErr, getData] = await getStreamKey()
  if (getErr) {
    console.log(`[VideoTest] getStreamKey failed: ${getErr}, trying generate...`)
    const [postErr, postData] = await generateStreamKey()
    if (postErr || !postData) {
      console.log(`[VideoTest] generateStreamKey failed: ${postErr}`)
      return { url: '', key: '', error: `GET: ${getErr} | POST: ${postErr}` }
    }
    return {
      url: postData.streamingUrl ?? '',
      key: postData.streamingKey ?? ''
    }
  }
  if (getData) {
    return {
      url: getData.streamingUrl ?? '',
      key: getData.streamingKey ?? ''
    }
  }
  return { url: '', key: '', error: 'No data returned' }
}

const videoStateName: Record<number, string> = {
  [VideoState.VS_NONE]: 'NONE',
  [VideoState.VS_ERROR]: 'ERROR',
  [VideoState.VS_LOADING]: 'LOADING',
  [VideoState.VS_READY]: 'READY',
  [VideoState.VS_PLAYING]: 'PLAYING',
  [VideoState.VS_BUFFERING]: 'BUFFERING',
  [VideoState.VS_SEEKING]: 'SEEKING',
  [VideoState.VS_PAUSED]: 'PAUSED'
}

const HLS_URL = 'https://player.vimeo.com/external/552481870.m3u8?s=c312c8533f97e808fccc92b0510571571571c02'
const LIVEKIT_SRC = 'livekit-video://current-stream'

let rtmpUrl = 'Loading...'
let streamKey = 'Loading...'
let leftState = 'NONE'
let rightState = 'NONE'
let leftPlaying = true
let rightPlaying = true

let infoTextEntity: Entity
let leftStateTextEntity: Entity
let rightStateTextEntity: Entity
let leftScreen: Entity
let rightScreen: Entity

function createScreenTriad(position: Vector3, label: string): { screen: Entity; stateText: Entity; labelText: Entity } {
  const screen = engine.addEntity()
  Transform.create(screen, {
    position,
    scale: Vector3.create(3.5, 2, 1),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  MeshRenderer.setPlane(screen)
  MeshCollider.setPlane(screen)

  const labelText = engine.addEntity()
  Transform.create(labelText, {
    position: Vector3.create(position.x, position.y + 1.3, position.z),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(labelText, {
    text: label,
    fontSize: 2,
    textColor: Color4.White()
  })

  const stateText = engine.addEntity()
  Transform.create(stateText, {
    position: Vector3.create(position.x, position.y - 1.3, position.z),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(stateText, {
    text: 'State: NONE',
    fontSize: 1.5,
    textColor: Color4.Yellow()
  })

  return { screen, stateText, labelText }
}

function updateInfoText(): void {
  TextShape.getMutable(infoTextEntity).text = `RTMP Server: ${rtmpUrl}
Stream Key: ${streamKey}`
}

async function refreshStreamKey(): Promise<void> {
  const info = await fetchStreamKeyInfo()
  if (info) {
    if (info.error) {
      rtmpUrl = 'Error'
      streamKey = info.error
    } else {
      rtmpUrl = info.url || 'empty'
      streamKey = info.key || 'empty'
    }
  } else {
    rtmpUrl = 'null response'
    streamKey = 'N/A'
  }
  updateInfoText()
}

export function main(): void {
  console.log('[VideoTest] Creating video screen test scene')

  infoTextEntity = engine.addEntity()
  Transform.create(infoTextEntity, {
    position: Vector3.create(8, 4.5, 10),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(infoTextEntity, {
    text: 'Fetching stream key...',
    fontSize: 1.2,
    textColor: Color4.create(0.5, 1, 0.5, 1)
  })

  const left = createScreenTriad(Vector3.create(5.5, 2.5, 10), 'LiveKit Stream')
  leftScreen = left.screen
  leftStateTextEntity = left.stateText
  VideoPlayer.create(leftScreen, {
    src: LIVEKIT_SRC,
    playing: true,
    loop: false,
    volume: 0.5
  })
  Material.setBasicMaterial(leftScreen, {
    texture: Material.Texture.Video({ videoPlayerEntity: leftScreen })
  })
  pointerEventsSystem.onPointerDown(
    {
      entity: leftScreen,
      opts: { button: InputAction.IA_POINTER, hoverText: 'Toggle Play/Pause' }
    },
    () => {
      leftPlaying = !leftPlaying
      VideoPlayer.getMutable(leftScreen).playing = leftPlaying
      console.log(`[VideoTest] Left screen: ${leftPlaying ? 'PLAY' : 'PAUSE'}`)
    }
  )

  const right = createScreenTriad(Vector3.create(10.5, 2.5, 10), 'URL Video (HLS)')
  rightScreen = right.screen
  rightStateTextEntity = right.stateText
  VideoPlayer.create(rightScreen, {
    src: HLS_URL,
    playing: true,
    loop: true,
    volume: 0.5
  })
  Material.setBasicMaterial(rightScreen, {
    texture: Material.Texture.Video({ videoPlayerEntity: rightScreen })
  })
  pointerEventsSystem.onPointerDown(
    {
      entity: rightScreen,
      opts: { button: InputAction.IA_POINTER, hoverText: 'Toggle Play/Pause' }
    },
    () => {
      rightPlaying = !rightPlaying
      VideoPlayer.getMutable(rightScreen).playing = rightPlaying
      console.log(`[VideoTest] Right screen: ${rightPlaying ? 'PLAY' : 'PAUSE'}`)
    }
  )

  const refreshBtn = engine.addEntity()
  Transform.create(refreshBtn, {
    position: Vector3.create(8, 0.5, 10),
    scale: Vector3.create(0.8, 0.8, 0.8)
  })
  MeshRenderer.setBox(refreshBtn)
  MeshCollider.setBox(refreshBtn)
  Material.setPbrMaterial(refreshBtn, {
    albedoColor: Color4.create(0.2, 0.6, 1, 1),
    emissiveColor: Color4.create(0.2, 0.6, 1, 1),
    emissiveIntensity: 2
  })
  const refreshLabel = engine.addEntity()
  Transform.create(refreshLabel, {
    position: Vector3.create(8, 1.2, 10),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(refreshLabel, {
    text: 'Click: Refresh Key',
    fontSize: 1,
    textColor: Color4.White()
  })
  pointerEventsSystem.onPointerDown(
    {
      entity: refreshBtn,
      opts: { button: InputAction.IA_POINTER, hoverText: 'Refresh Stream Key' }
    },
    () => {
      console.log('[VideoTest] Refreshing stream key...')
      rtmpUrl = 'Refreshing...'
      streamKey = 'Refreshing...'
      updateInfoText()
      refreshStreamKey().catch(console.error)
    }
  )

  const resetBtn = engine.addEntity()
  Transform.create(resetBtn, {
    position: Vector3.create(9, 0.5, 10),
    scale: Vector3.create(0.8, 0.8, 0.8)
  })
  MeshRenderer.setBox(resetBtn)
  MeshCollider.setBox(resetBtn)
  Material.setPbrMaterial(resetBtn, {
    albedoColor: Color4.create(1, 0.3, 0.3, 1),
    emissiveColor: Color4.create(1, 0.3, 0.3, 1),
    emissiveIntensity: 2
  })
  const resetLabel = engine.addEntity()
  Transform.create(resetLabel, {
    position: Vector3.create(9, 1.2, 10),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(resetLabel, {
    text: 'Click: Reset Key',
    fontSize: 1,
    textColor: Color4.White()
  })
  pointerEventsSystem.onPointerDown(
    {
      entity: resetBtn,
      opts: { button: InputAction.IA_POINTER, hoverText: 'Reset Stream Key' }
    },
    () => {
      void (async () => {
        console.log('[VideoTest] Resetting stream key...')
        rtmpUrl = 'Resetting...'
        streamKey = 'Resetting...'
        updateInfoText()
        const [err, data] = await resetStreamKey()
        if (err || !data) {
          rtmpUrl = 'Error'
          streamKey = err || 'Unknown error'
        } else {
          rtmpUrl = data.streamingUrl ?? ''
          streamKey = data.streamingKey ?? ''
        }
        updateInfoText()
      })()
    }
  )

  const noSourceLabel = engine.addEntity()
  Transform.create(noSourceLabel, {
    position: Vector3.create(8, 2.5 + 1.3, 12),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(noSourceLabel, {
    text: 'No Source (should be black)',
    fontSize: 2,
    textColor: Color4.White()
  })

  const noSourceScreen = engine.addEntity()
  Transform.create(noSourceScreen, {
    position: Vector3.create(8, 2.5, 12),
    scale: Vector3.create(3, 1.7, 1),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  MeshRenderer.setPlane(noSourceScreen)
  VideoPlayer.create(noSourceScreen, {
    src: '',
    playing: false,
    loop: false,
    volume: 0
  })
  Material.setBasicMaterial(noSourceScreen, {
    texture: Material.Texture.Video({ videoPlayerEntity: noSourceScreen })
  })

  const lastTimestampByEntity = new Map<Entity, number>()

  sceneSystems.addSystem(
    (_dt) => {
      for (const [entity, events] of engine.getEntitiesWith(VideoEvent)) {
        const last = lastTimestampByEntity.get(entity) ?? 0
        for (const event of events) {
          if (event.timestamp > last) {
            lastTimestampByEntity.set(entity, event.timestamp)
            const stateName = videoStateName[event.state] ?? `UNKNOWN(${event.state})`
            if (entity === leftScreen) {
              leftState = stateName
              TextShape.getMutable(leftStateTextEntity).text = `State: ${leftState}
Pos: ${(event.currentOffset ?? 0).toFixed(1)}s`
            } else if (entity === rightScreen) {
              rightState = stateName
              TextShape.getMutable(rightStateTextEntity).text = `State: ${rightState}
Pos: ${(event.currentOffset ?? 0).toFixed(1)}s`
            }
            console.log(
              `[VideoTest] Entity ${entity} -> ${stateName} | ${(event.currentOffset ?? 0).toFixed(1)}s / ${(
                event.videoLength ?? -1
              ).toFixed(1)}s`
            )
          }
        }
      }
    },
    undefined,
    'video-screen-test-events'
  )

  refreshStreamKey().catch(console.error)
  console.log('[VideoTest] Scene ready. Left=LiveKit, Right=HLS, Center-back=NoSource')
}
