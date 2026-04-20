import ReactEcs, { Label, UiEntity, type JSX } from '@dcl/sdk/react-ecs'
import { CameraMode, CameraType, engine, Transform } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { UiBox } from '../../utils/ui/box'

function getPlayerPosition(): { x: string; y: string; z: string } {
  const t = Transform.getOrNull(engine.PlayerEntity)
  if (t === null) return { x: '?', y: '?', z: '?' }
  return {
    x: t.position.x.toFixed(2),
    y: t.position.y.toFixed(2),
    z: t.position.z.toFixed(2)
  }
}

function getCameraPosition(): { x: string; y: string; z: string } {
  const t = Transform.getOrNull(engine.CameraEntity)
  if (t === null) return { x: '?', y: '?', z: '?' }
  return {
    x: t.position.x.toFixed(2),
    y: t.position.y.toFixed(2),
    z: t.position.z.toFixed(2)
  }
}

function getCameraRotation(): {
  x: string
  y: string
  z: string
  w: string
} {
  const t = Transform.getOrNull(engine.CameraEntity)
  if (t === null) return { x: '?', y: '?', z: '?', w: '?' }
  return {
    x: t.rotation.x.toFixed(3),
    y: t.rotation.y.toFixed(3),
    z: t.rotation.z.toFixed(3),
    w: t.rotation.w.toFixed(3)
  }
}

function getCameraModeText(): string {
  const m = CameraMode.getOrNull(engine.CameraEntity)
  if (m === null) return '?'
  switch (m.mode) {
    case CameraType.CT_FIRST_PERSON:
      return 'First Person'
    case CameraType.CT_THIRD_PERSON:
      return 'Third Person'
    default:
      return `Unknown (${m.mode})`
  }
}

export function main(): void {
  console.log('Player & Camera UI scene loaded')
}

export function UI(): JSX.Element {
  const playerPos = getPlayerPosition()
  const cameraPos = getCameraPosition()
  const cameraRot = getCameraRotation()
  const cameraMode = getCameraModeText()

  return (
    <UiBox width={320} height={280} uiTransform={{ padding: 10 }}>
      <Label value="Player Position" fontSize={16} color={Color4.Yellow()} uiTransform={{ height: 24 }} />
      <Label
        value={`  X: ${playerPos.x}  Y: ${playerPos.y}  Z: ${playerPos.z}`}
        fontSize={14}
        uiTransform={{ height: 22 }}
      />
      <UiEntity
        uiTransform={{
          height: 1,
          width: '100%',
          margin: { top: 4, bottom: 4 }
        }}
        uiBackground={{ color: Color4.create(1, 1, 1, 0.3) }}
      />
      <Label value="Camera Position" fontSize={16} color={Color4.Yellow()} uiTransform={{ height: 24 }} />
      <Label
        value={`  X: ${cameraPos.x}  Y: ${cameraPos.y}  Z: ${cameraPos.z}`}
        fontSize={14}
        uiTransform={{ height: 22 }}
      />
      <UiEntity
        uiTransform={{
          height: 1,
          width: '100%',
          margin: { top: 4, bottom: 4 }
        }}
        uiBackground={{ color: Color4.create(1, 1, 1, 0.3) }}
      />
      <Label value="Camera Rotation (Quat)" fontSize={16} color={Color4.Yellow()} uiTransform={{ height: 24 }} />
      <Label value={`  X: ${cameraRot.x}  Y: ${cameraRot.y}`} fontSize={14} uiTransform={{ height: 22 }} />
      <Label value={`  Z: ${cameraRot.z}  W: ${cameraRot.w}`} fontSize={14} uiTransform={{ height: 22 }} />
      <UiEntity
        uiTransform={{
          height: 1,
          width: '100%',
          margin: { top: 4, bottom: 4 }
        }}
        uiBackground={{ color: Color4.create(1, 1, 1, 0.3) }}
      />
      <Label value={`Camera Mode: ${cameraMode}`} fontSize={14} color={Color4.Green()} uiTransform={{ height: 22 }} />
    </UiBox>
  )
}
