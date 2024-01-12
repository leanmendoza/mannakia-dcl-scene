import { Color4 } from '@dcl/sdk/math'
import ReactEcs, {
  type JSX,
  UiEntity,
  type EntityPropTypes
} from '@dcl/sdk/react-ecs'

type UiBoxProps = EntityPropTypes & {
  width: number
  height: number
}

export function UiBox(props: UiBoxProps): JSX.Element {
  const { width, height, uiBackground, uiTransform, ...otherProps } = props
  return (
    <UiEntity
      uiTransform={{
        height: '100%',
        width: '100%'
      }}
    >
      <UiEntity
        uiBackground={{ color: Color4.Blue(), ...uiBackground }}
        uiTransform={{
          width,
          height,
          flexDirection: 'column',
          positionType: 'absolute',
          position: { bottom: '5%', right: '5%' },
          ...uiTransform
        }}
        {...otherProps}
      ></UiEntity>
    </UiEntity>
  )
}
