import {
  AudioSource,
  engine,
  Material,
  MeshRenderer,
  TextShape,
  Transform,
  type Entity
} from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import ReactEcs, { Label, UiEntity, type JSX } from '@dcl/sdk/react-ecs'

// Primary asset = ogg (more reliable for loop tests).
// The wav is kept as a secondary case so we can still verify it once the
// ogg-based behaviour is right.
const CLIP_OGG = 'assets/audio_test_clip.ogg'
const CLIP_WAV = 'assets/audio_test_clip.wav'

const SOURCE_POSITION = Vector3.create(8, 1.5, 4)

type State = {
  global: boolean
  loop: boolean
  clip: 'ogg' | 'wav'
  playing: boolean
}

const state: State = {
  global: true,
  loop: true,
  clip: 'wav',
  playing: false
}

let sourceEntity: Entity
let stateLabelEntity: Entity

function clipUrl(): string {
  return state.clip === 'ogg' ? CLIP_OGG : CLIP_WAV
}

function describe(): string {
  return `global=${state.global} loop=${state.loop} clip=${state.clip} playing=${state.playing}`
}

function log(tag: string): void {
  console.log(`[AudioTest] ${tag} → ${describe()}`)
}

function refreshComponent(): void {
  // We replace the component rather than mutate it so the engine reliably
  // picks up changes to `global` / `loop` / `audioClipUrl`. (Mutating in place
  // works for `playing` but the bug we're chasing is about `global`/`loop`.)
  AudioSource.deleteFrom(sourceEntity)
  AudioSource.create(sourceEntity, {
    audioClipUrl: clipUrl(),
    playing: state.playing,
    loop: state.loop,
    volume: 1.0,
    global: state.global
  })
  TextShape.getMutable(stateLabelEntity).text = describe()
}

function toggleGlobal(): void {
  state.global = !state.global
  log('toggle global')
  refreshComponent()
}

function toggleLoop(): void {
  state.loop = !state.loop
  log('toggle loop')
  refreshComponent()
}

function switchClip(): void {
  state.clip = state.clip === 'ogg' ? 'wav' : 'ogg'
  log('switch clip')
  refreshComponent()
}

function applyPreset(global: boolean, loop: boolean): void {
  state.global = global
  state.loop = loop
  state.playing = true
  log(`preset global=${global} loop=${loop}`)
  refreshComponent()
}

function doPlay(): void {
  state.playing = true
  log('play')
  refreshComponent()
}

function doPause(): void {
  // Pause = set playing=false but keep the component (so the engine could
  // resume from the current cursor on the next playing=true).
  state.playing = false
  log('pause')
  const mut = AudioSource.getMutable(sourceEntity)
  mut.playing = false
  TextShape.getMutable(stateLabelEntity).text = describe()
}

function doStop(): void {
  // Stop = remove the component entirely.
  state.playing = false
  log('stop')
  AudioSource.deleteFrom(sourceEntity)
  TextShape.getMutable(stateLabelEntity).text = describe() + ' (component removed)'
}

export function main(): void {
  console.log('[AudioTest] Initializing AudioSource test for issue #1761')

  // Floor reference
  const floor = engine.addEntity()
  Transform.create(floor, {
    position: Vector3.create(8, 0, 8),
    scale: Vector3.create(16, 0.1, 16)
  })
  MeshRenderer.setBox(floor)
  Material.setPbrMaterial(floor, {
    albedoColor: Color4.create(0.1, 0.1, 0.13, 1),
    roughness: 1
  })

  // The audio source entity (visualized as a glowing cube)
  sourceEntity = engine.addEntity()
  Transform.create(sourceEntity, {
    position: SOURCE_POSITION,
    scale: Vector3.create(0.8, 0.8, 0.8)
  })
  MeshRenderer.setBox(sourceEntity)
  Material.setPbrMaterial(sourceEntity, {
    albedoColor: Color4.create(1.0, 0.4, 0.4, 1),
    emissiveColor: Color4.create(1.0, 0.4, 0.4, 1),
    emissiveIntensity: 1.5
  })

  // World-space label so you can locate the entity while walking around
  stateLabelEntity = engine.addEntity()
  Transform.create(stateLabelEntity, {
    position: Vector3.create(
      SOURCE_POSITION.x,
      SOURCE_POSITION.y + 1.5,
      SOURCE_POSITION.z
    ),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(stateLabelEntity, {
    text: describe() + ' (idle — press Play)',
    fontSize: 1.2,
    textColor: Color4.White(),
    outlineColor: Color4.Black(),
    outlineWidth: 0.2
  })

  console.log('[AudioTest] Ready — no audio playing until you click Play.')
}

function Btn({
  label,
  color,
  onClick,
  width
}: {
  label: string
  color: Color4
  onClick: () => void
  width?: number
}): JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        width: width ?? 110,
        height: 34,
        margin: { right: 6, bottom: 6 },
        justifyContent: 'center',
        alignItems: 'center'
      }}
      uiBackground={{ color }}
      onMouseDown={onClick}
    >
      <Label value={label} fontSize={13} color={Color4.White()} />
    </UiEntity>
  )
}

const BLUE = Color4.create(0.25, 0.45, 0.75, 1)
const GREEN = Color4.create(0.25, 0.6, 0.3, 1)
const RED = Color4.create(0.7, 0.25, 0.3, 1)
const GREY = Color4.create(0.35, 0.35, 0.4, 1)
const ORANGE = Color4.create(0.85, 0.5, 0.2, 1)

export function UI(): JSX.Element {
  const summary = describe()

  // Center the panel using percentage-positioned absolute placement plus a
  // negative margin equal to half the width/height.
  const PANEL_W = 460
  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { left: '50%', top: '12%' },
        width: PANEL_W,
        margin: { left: -PANEL_W / 2 },
        padding: 14,
        flexDirection: 'column'
      }}
      uiBackground={{ color: Color4.create(0, 0, 0, 0.7) }}
    >
      <Label
        value="AudioSource Test — issue #1761"
        fontSize={18}
        color={Color4.White()}
        uiTransform={{ height: 26 }}
      />
      <Label
        value={summary}
        fontSize={13}
        color={Color4.create(0.85, 0.95, 1, 1)}
        uiTransform={{ height: 22, margin: { bottom: 8 } }}
      />

      <Label
        value="Configure"
        fontSize={13}
        color={Color4.Yellow()}
        uiTransform={{ height: 20 }}
      />
      <UiEntity uiTransform={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Btn
          label={`global: ${state.global ? 'ON' : 'off'}`}
          color={state.global ? GREEN : GREY}
          onClick={toggleGlobal}
        />
        <Btn
          label={`loop: ${state.loop ? 'ON' : 'off'}`}
          color={state.loop ? GREEN : GREY}
          onClick={toggleLoop}
        />
        <Btn
          label={`clip: ${state.clip.toUpperCase()}`}
          color={state.clip === 'ogg' ? BLUE : ORANGE}
          onClick={switchClip}
          width={130}
        />
      </UiEntity>

      <Label
        value="Presets (set + play)"
        fontSize={13}
        color={Color4.Yellow()}
        uiTransform={{ height: 20, margin: { top: 6 } }}
      />
      <UiEntity uiTransform={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Btn
          label="G=ON  L=ON"
          color={RED}
          onClick={() => { applyPreset(true, true) }}
        />
        <Btn
          label="G=ON  L=off"
          color={BLUE}
          onClick={() => { applyPreset(true, false) }}
        />
        <Btn
          label="G=off L=ON"
          color={BLUE}
          onClick={() => { applyPreset(false, true) }}
        />
        <Btn
          label="G=off L=off"
          color={BLUE}
          onClick={() => { applyPreset(false, false) }}
        />
      </UiEntity>

      <Label
        value="Playback"
        fontSize={13}
        color={Color4.Yellow()}
        uiTransform={{ height: 20, margin: { top: 6 } }}
      />
      <UiEntity uiTransform={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Btn label="Play" color={GREEN} onClick={doPlay} />
        <Btn label="Pause" color={ORANGE} onClick={doPause} />
        <Btn label="Stop" color={RED} onClick={doStop} />
      </UiEntity>
    </UiEntity>
  )
}
