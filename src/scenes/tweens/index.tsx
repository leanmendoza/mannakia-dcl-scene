import {
  EasingFunction,
  MeshRenderer,
  Tween,
  TweenLoop,
  TweenSequence,
  type Entity,
  type PBTween,
  type PBTweenSequence
} from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import ReactEcs, {
  UiEntity,
  type JSX,
  Label,
  Dropdown,
  Button
} from '@dcl/sdk/react-ecs'
import { sceneSystems } from '../../utils/system'
import { UiBox } from '../../utils/ui/box'

import { sceneEntities } from '../../utils/entity'
import { PbTweenUi } from './PbTweenUi'
import { WhiteAlphaBackgroundColor } from './utils'

type State = {
  tween: PBTween
  tweenSequence: PBTweenSequence
  tweenEntity?: Entity
  dirty: boolean
  editingTweenIndex: number
}

const state: State = {
  dirty: true,
  tween: {
    mode: Tween.Mode.Move({
      start: Vector3.create(4, 2, 4),
      end: Vector3.create(4, 2, 12),
      faceDirection: true
    }),
    duration: 2000,
    easingFunction: EasingFunction.EF_LINEAR
  },
  tweenSequence: {
    sequence: [],
    loop: TweenLoop.TL_YOYO
  },

  editingTweenIndex: 0
}

export function main(): void {
  sceneSystems.addSystemWithInverval(
    (_dt) => {
      if (!state.dirty) return

      state.dirty = false
      if (state.tweenEntity !== undefined) {
        sceneEntities.removeEntity(state.tweenEntity)
      }

      const tweenEntity = sceneEntities.addEntity()
      state.tweenEntity = tweenEntity
      MeshRenderer.setBox(tweenEntity)
      Tween.create(tweenEntity, state.tween)
      TweenSequence.create(tweenEntity, state.tweenSequence)
    },
    0.1,
    'tween-system'
  )
}

export function MainSceneUi(): JSX.Element {
  const currentTween =
    state.editingTweenIndex > 0
      ? state.tweenSequence.sequence[state.editingTweenIndex - 1]
      : state.tween
  const tweenOptions = [
    'Tween',
    ...state.tweenSequence.sequence.map((_, index) => `Seq ${index}`)
  ]

  return (
    <UiBox width={500} height={400} uiTransform={{ padding: 10 }}>
      <UiEntity>
        <Label value="Select tween" />
        <Dropdown
          uiTransform={{ margin: 10, height: 20 }}
          uiBackground={{ color: Color4.White() }}
          color={Color4.Black()}
          onChange={(newValue) => {
            state.editingTweenIndex = Number(newValue)
          }}
          options={tweenOptions}
          selectedIndex={state.editingTweenIndex}
        />
        <Label value="Loop Mode" />
        <Dropdown
          uiTransform={{ margin: 10, height: 20 }}
          uiBackground={{ color: Color4.White() }}
          color={Color4.Black()}
          onChange={(newValue) => {
            state.tweenSequence.loop = Number(newValue)
            state.dirty = true
          }}
          options={['TL_RESTART', 'TL_YOYO']}
          selectedIndex={state.tweenSequence.loop}
        />
        <Button
          value="Add Tween"
          uiTransform={{ minHeight: 20, minWidth: 60 }}
          onMouseDown={() => {
            state.tweenSequence.sequence.push({
              mode: Tween.Mode.Move({
                start: Vector3.create(4, 2, 4),
                end: Vector3.create(4, 2, 12),
                faceDirection: true
              }),
              duration: 2000,
              easingFunction: EasingFunction.EF_LINEAR
            })
            state.dirty = true
            console.log('Adding tween', state.tweenSequence.sequence.length)
          }}
        />
        <Button
          value="Remove current tween"
          uiTransform={{ minHeight: 20, minWidth: 100 }}
          disabled={state.editingTweenIndex === 0}
          onMouseDown={() => {
            if (state.editingTweenIndex > 0) {
              state.tweenSequence.sequence.splice(
                state.editingTweenIndex - 1,
                1
              )
              state.editingTweenIndex = 0
              state.dirty = true
            }
          }}
        />
      </UiEntity>

      <UiEntity
        uiTransform={{ flexDirection: 'column' }}
        uiBackground={{ color: WhiteAlphaBackgroundColor }}
      >
        <PbTweenUi
          tween={currentTween as any}
          onChange={(newValue) => {
            state.tween = newValue
            state.dirty = true
          }}
        />
      </UiEntity>
    </UiBox>
  )
}

//       <UiEntity
//         uiTransform={{
//           alignItems: 'stretch'

//         }}
//       >
//         <Label value="Text" />
//         <Input
//           uiTransform={{ width: '80%', margin: 10, height: 20 }}
//           uiBackground={{ color: Color4.White() }}
//           color={Color4.Black()}
//           onChange={(newValue) => {
//             state.textShape.text = newValue
//           }}
//         />
//       </UiEntity>

//       <UiEntity>
//         <Label value="Font" />
//         <Input
//           uiTransform={{ margin: 10, height: 20 }}
//           uiBackground={{ color: Color4.White() }}
//           color={Color4.Black()}
//           onChange={(newValue) => {
//             state.textShape.fontSize = Number(newValue)
//           }}
//           value={`${state.textShape.fontSize}`}
//         />
//         <Dropdown
//           uiTransform={{ margin: 10, height: 20 }}
//           uiBackground={{ color: Color4.White() }}
//           onChange={(newValue) => {
//             state.textShape.font = newValue
//           }}
//           options={['F_SANS_SERIF', 'F_SERIF', 'F_MONOSPACE']}
//           selectedIndex={state.textShape.font ?? 0}
//         />
//       </UiEntity>
//       <UiEntity>
//         <Label value="Align" />
//         <Dropdown
//           uiTransform={{ margin: 10, height: 20 }}
//           uiBackground={{ color: Color4.White() }}
//           onChange={(newValue) => {
//             state.textShape.textAlign = newValue
//           }}
//           options={[
//             'TAM_TOP_LEFT',
//             'TAM_TOP_CENTER',
//             'TAM_TOP_RIGHT',
//             'TAM_MIDDLE_LEFT',
//             'TAM_MIDDLE_CENTER',
//             'TAM_MIDDLE_RIGHT',
//             'TAM_BOTTOM_LEFT',
//             'TAM_BOTTOM_CENTER',
//             'TAM_BOTTOM_RIGHT'
//           ]}
//           selectedIndex={state.textShape.font ?? 0}
//         />
//       </UiEntity>
//       <UiEntity>
//         <Label value="Size" />
//         <Input
//           uiTransform={{ margin: 10, height: 20 }}
//           uiBackground={{ color: Color4.White() }}
//           color={Color4.Black()}
//           onChange={(newValue) => {
//             state.textShape.width = Number(newValue)
//           }}
//           value={`${state.textShape.width}`}
//         />
//         <Input
//           uiTransform={{ margin: 10, height: 20 }}
//           uiBackground={{ color: Color4.White() }}
//           color={Color4.Black()}
//           onChange={(newValue) => {
//             state.textShape.height = Number(newValue)
//           }}
//           value={`${state.textShape.height}`}
//         />
//       </UiEntity>
//       <UiEntity>
//         <Label value="Padding (top,left,bottom,right)" />
//         <Input
//           uiTransform={{ margin: 10, height: 20 }}
//           uiBackground={{ color: Color4.White() }}
//           color={Color4.Black()}
//           onChange={(newValue) => {
//             state.textShape.paddingTop = Number(newValue)
//           }}
//           value={`${state.textShape.paddingTop}`}
//         />
//         <Input
//           uiTransform={{ margin: 10, height: 20 }}
//           uiBackground={{ color: Color4.White() }}
//           color={Color4.Black()}
//           onChange={(newValue) => {
//             state.textShape.paddingLeft = Number(newValue)
//           }}
//           value={`${state.textShape.paddingLeft}`}
//         />
//         <Input
//           uiTransform={{ margin: 10, height: 20 }}
//           uiBackground={{ color: Color4.White() }}
//           color={Color4.Black()}
//           onChange={(newValue) => {
//             state.textShape.paddingBottom = Number(newValue)
//           }}
//           value={`${state.textShape.paddingBottom}`}
//         />
//         <Input
//           uiTransform={{ margin: 10, height: 20 }}
//           uiBackground={{ color: Color4.White() }}
//           color={Color4.Black()}
//           onChange={(newValue) => {
//             state.textShape.paddingRight = Number(newValue)
//           }}
//           value={`${state.textShape.paddingRight}`}
//         />
//       </UiEntity>
//       <UiEntity>
//         <Label value="Text Color" />
//         <Dropdown
//           uiTransform={{ margin: 10, height: 20 }}
//           uiBackground={{ color: Color4.White() }}
//           color={Color4.Black()}
//           onChange={(newValue) => {
//             state.textColorIndex = Number(newValue)
//             state.textShape.textColor =
//               GODOT_ALL_COLORS[GODOT_ALL_COLORS_KEYS[state.textColorIndex]]
//             console.log({
//               colorIndex: state.textColorIndex,
//               color: state.textShape.textColor
//             })
//           }}
//           options={GODOT_ALL_COLORS_KEYS}
//           selectedIndex={state.textColorIndex}
//         />
//         <Label value="Wrapping" />
//         <Dropdown
//           uiTransform={{ margin: 10, height: 20 }}
//           uiBackground={{ color: Color4.White() }}
//           color={Color4.Black()}
//           onChange={(newValue) => {
//             state.textShape.textWrapping = Number(newValue) === 1
//           }}
//           options={['NO', 'YES']}
//           selectedIndex={state.textShape.textWrapping === true ? 1 : 0}
//         />
//       </UiEntity>

// export function main() {
//   {
//     const box = engine.addEntity()
//     Transform.create(box, {
//       position: Vector3.create(4, 2, 4),
//       scale: Vector3.create(1, 1, 1)
//     })
//     MeshRenderer.setBox(box)
//     MeshCollider.setBox(box)

//     Tween.create(box, {
//       mode: Tween.Mode.Move({
//         start: Vector3.create(4, 2, 4),
//         end: Vector3.create(4, 2, 12),
//         faceDirection: true
//       }),
//       duration: 2000,
//       easingFunction: EasingFunction.EF_LINEAR
//     })

//     TweenSequence.create(box, {
//       sequence: [],
//       loop: TweenLoop.TL_YOYO
//     })
//   }
//   {
//     const box = engine.addEntity()
//     Transform.create(box, {
//       position: Vector3.create(8, 2, 8),
//       scale: Vector3.create(1, 1, 1)
//     })
//     MeshRenderer.setBox(box)
//     MeshCollider.setBox(box)

//     Tween.create(box, {
//       mode: Tween.Mode.Rotate({
//         start: Quaternion.fromEulerDegrees(0.0, 0.0, 0.0),
//         end: Quaternion.fromEulerDegrees(0.0, 180.0, 0.0)
//       }),
//       duration: 2000,
//       easingFunction: EasingFunction.EF_LINEAR
//     })

//     TweenSequence.create(box, {
//       sequence: [],
//       loop: TweenLoop.TL_RESTART
//     })
//   }

//   {
//     const box = engine.addEntity()
//     Transform.create(box, {
//       position: Vector3.create(12, 2, 8),
//       scale: Vector3.create(1, 1, 1)
//     })
//     MeshRenderer.setBox(box)
//     MeshCollider.setBox(box)

//   }
// }
