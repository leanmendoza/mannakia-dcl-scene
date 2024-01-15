import { type Rotate, type PBTween, type Scale, type Move } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import ReactEcs, {
  Dropdown,
  Label,
  UiEntity,
  type JSX,
  Input
} from '@dcl/sdk/react-ecs'

const TweenMode = ['move', 'rotate', 'scale']

type PbTweenUiModeProps = {
  mode: PBTween['mode']
  onChange?: (mode: PBTween['mode']) => void
}

export function Vector3Ui(props: {
  value: Vector3
  onChange: (value: Vector3) => void
}): JSX.Element {
  const { value, onChange } = props
  return (
    <UiEntity>
      <Label value="X" />
      <Input
        uiTransform={{ margin: 10, height: 20, width: 50 }}
        uiBackground={{ color: Color4.White() }}
        color={Color4.Black()}
        onChange={(newValue) => {
          onChange(Vector3.create(Number(newValue), value.y, value.z))
        }}
        value={`${value.x}`}
      />
      <Label value="Y" />
      <Input
        uiTransform={{ margin: 10, height: 20, width: 50 }}
        uiBackground={{ color: Color4.White() }}
        color={Color4.Black()}
        onChange={(newValue) => {
          onChange(Vector3.create(value.x, Number(newValue), value.z))
        }}
        value={`${value.y}`}
      />
      <Label value="Z" />
      <Input
        uiTransform={{ margin: 10, height: 20, width: 50 }}
        uiBackground={{ color: Color4.White() }}
        color={Color4.Black()}
        onChange={(newValue) => {
          onChange(Vector3.create(value.x, value.y, Number(newValue)))
        }}
        value={`${value.z}`}
      />
    </UiEntity>
  )
}

export function QuaternionUi(props: {
  value: Quaternion
  onChange: (value: Quaternion) => void
}): JSX.Element {
  return (
    <UiEntity>
      <Label value="X" uiTransform={{ width: 'auto' }} />
      <Input
        uiTransform={{ margin: 10, height: 20, width: 50 }}
        uiBackground={{ color: Color4.White() }}
        color={Color4.Black()}
        onChange={(newValue) => {
          props.onChange(
            Quaternion.create(
              Number(newValue),
              props.value.y,
              props.value.z,
              props.value.w
            )
          )
        }}
        value={`${props.value.x}`}
      />
      <Label value="Y" />
      <Input
        uiTransform={{ margin: 10, height: 20, width: 50 }}
        uiBackground={{ color: Color4.White() }}
        color={Color4.Black()}
        onChange={(newValue) => {
          props.onChange(
            Quaternion.create(
              props.value.x,
              Number(newValue),
              props.value.z,
              props.value.w
            )
          )
        }}
        value={`${props.value.y}`}
      />
      <Label value="Z" uiTransform={{ width: 'auto' }} />
      <Input
        uiTransform={{ margin: 10, height: 20, width: 50 }}
        uiBackground={{ color: Color4.White() }}
        color={Color4.Black()}
        onChange={(newValue) => {
          props.onChange(
            Quaternion.create(
              props.value.x,
              props.value.y,
              Number(newValue),
              props.value.w
            )
          )
        }}
        value={`${props.value.z}`}
      />
      <Label value="W" uiTransform={{ width: 'auto' }} />
      <Input
        uiTransform={{ margin: 10, height: 20, width: 50 }}
        uiBackground={{ color: Color4.White() }}
        color={Color4.Black()}
        onChange={(newValue) => {
          props.onChange(
            Quaternion.create(
              props.value.x,
              props.value.y,
              props.value.z,
              Number(newValue)
            )
          )
        }}
        value={`${props.value.w}`}
      />
    </UiEntity>
  )
}

type TweenModeExtra = {
  $case?: 'move' | 'rotate' | 'scale'
  rotate?: Rotate
  scale?: Scale
  move?: Move
}

export function PbTweenUiMode(props: PbTweenUiModeProps): JSX.Element {
  const { mode, onChange } = props
  const modeCopy: TweenModeExtra = { ...mode } as any
  const currentModeId = mode !== undefined ? mode.$case : 'move'

  return (
    <UiEntity
      uiTransform={{ flexDirection: 'column' }}
      uiBackground={{ color: Color4.create(1.0, 1.0, 1.0, 0.1) }}
    >
      <UiEntity>
        <Label value="Mode" uiTransform={{ height: 16, width: 'auto' }} />
        <Dropdown
          uiTransform={{ margin: 10, height: 20, width: '80%' }}
          uiBackground={{ color: Color4.White() }}
          color={Color4.Black()}
          onChange={(newValue) => {
            modeCopy.$case = TweenMode[newValue] as any
            onChange?.(mode)
          }}
          options={TweenMode}
          selectedIndex={TweenMode.indexOf(currentModeId)}
        />
      </UiEntity>
      <UiEntity>
        {currentModeId === 'move' && (
          <UiEntity
            uiBackground={{ color: Color4.create(1.0, 1.0, 1.0, 0.1) }}
            uiTransform={{ flexDirection: 'column' }}
          >
            <UiEntity>
              <Label
                value="Start"
                uiTransform={{ height: 16, width: 'auto' }}
              />
              <Vector3Ui
                value={
                  modeCopy.move !== undefined
                    ? modeCopy.move.start ?? Vector3.Zero()
                    : Vector3.Zero()
                }
                onChange={(newValue) => {
                  if (modeCopy.move === undefined) {
                    modeCopy.move = { start: newValue, end: Vector3.Zero() }
                  } else {
                    modeCopy.move.start = newValue
                  }
                  onChange?.(modeCopy as PBTween['mode'])
                }}
              />
            </UiEntity>

            <UiEntity>
              <Label value="End" uiTransform={{ height: 16, width: 'auto' }} />
              <Vector3Ui
                value={
                  modeCopy.move !== undefined
                    ? modeCopy.move.end ?? Vector3.Zero()
                    : Vector3.Zero()
                }
                onChange={(newValue) => {
                  if (modeCopy.move === undefined) {
                    modeCopy.move = { end: newValue, start: Vector3.Zero() }
                  } else {
                    modeCopy.move.end = newValue
                  }
                  onChange?.(modeCopy as PBTween['mode'])
                }}
              />
            </UiEntity>
            <UiEntity>
              <Label
                value="FaceDirection"
                uiTransform={{ height: 16, width: 'auto' }}
              />
              <Dropdown
                uiTransform={{ margin: 10, height: 20 }}
                uiBackground={{ color: Color4.White() }}
                color={Color4.Black()}
                onChange={(newValue) => {
                  if (modeCopy.move === undefined) {
                    modeCopy.move = {
                      faceDirection: newValue === 1,
                      end: Vector3.One(),
                      start: Vector3.Zero()
                    }
                  } else {
                    modeCopy.move.faceDirection = newValue === 1
                  }
                  onChange?.(modeCopy as PBTween['mode'])
                }}
                options={['NO', 'YES']}
                selectedIndex={
                  modeCopy.move !== undefined
                    ? modeCopy.move.faceDirection === true
                      ? 1
                      : 0
                    : 0
                }
              />
            </UiEntity>
          </UiEntity>
        )}
      </UiEntity>
    </UiEntity>
  )
}
