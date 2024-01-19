import { UiCanvasInformation, engine, type PBUiCanvasInformation } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Dropdown, Label, UiEntity, type JSX } from '@dcl/sdk/react-ecs'
import { sceneSystems } from '../../utils/system'
import {
  CurrentStateEnum,
  getUiTestState,
  setUiTestStateCanvasInfo,
  setUiTestStateCurrent,
  type UiTestStateType
} from './state'

export function main(): void {
  sceneSystems.addSystemWithInverval(
    () => {
      console.log('checking')
      const maybeNewCanvasInfo = UiCanvasInformation.get(engine.RootEntity)
      const currentCanvasInfo = getUiTestState().canvasInfo
      if (JSON.stringify(maybeNewCanvasInfo) !== JSON.stringify(currentCanvasInfo)) {
        setUiTestStateCanvasInfo({ ...maybeNewCanvasInfo })
      }
    },
    1,
    'ui-test-canvas-info'
  )
}

export function UI(): JSX.Element[] {
  return [<UiSelector state={getUiTestState()} />, <UiTest state={getUiTestState()} />]
}

function UiSelector(props: { state: UiTestStateType }): JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        position: { left: 0, top: 0 },
        positionType: 'absolute',
        height: '100%',
        width: '100%'
      }}
    >
      <Label value="Select UI" fontSize={32} textAlign="middle-center" uiTransform={{ width: '100%', height: 40 }} />
      <Dropdown
        options={Object.values(CurrentStateEnum)}
        selectedIndex={Object.values(CurrentStateEnum).findIndex((value) => value === props.state.current) ?? 0}
        onChange={(value: number) => {
          setUiTestStateCurrent(Object.values(CurrentStateEnum)[value])
        }}
        uiTransform={{ width: '100%', height: 40 }}
      />
    </UiEntity>
  )
}

function UiTest(props: { state: UiTestStateType }): JSX.Element {
  const uiStateUi = {
    [CurrentStateEnum.CSE_INITIAL]: () => <InitialUi canvasInfo={getUiTestState().canvasInfo} />,
    [CurrentStateEnum.CSE_POPUP]: () => <PopUpUiTest canvasInfo={getUiTestState().canvasInfo} />,
    [CurrentStateEnum.CSE_BASIC]: () => <BasicPositioning />
  }
  if (uiStateUi[props.state.current] !== undefined) {
    return uiStateUi[props.state.current]()
  }

  return <UiEntity></UiEntity>
}

function InitialUi(props: { canvasInfo: PBUiCanvasInformation }): JSX.Element {
  const { canvasInfo } = props
  return (
    <UiEntity
      uiTransform={{
        position: { left: 0, top: 0 },
        positionType: 'absolute',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      uiBackground={{ color: Color4.create(1, 1, 1, 0.1) }}
    >
      <Label
        value={`UiCanvasInformation`}
        fontSize={56}
        textAlign="middle-center"
        uiTransform={{ width: '100%', height: 40 }}
      />
      <Label
        value={`size: ${canvasInfo.width} x ${canvasInfo.height} x ${canvasInfo.devicePixelRatio}`}
        fontSize={32}
        textAlign="middle-center"
        uiTransform={{ width: '100%', height: 40 }}
      />
      <Label
        value={`interactable: ${canvasInfo.interactableArea?.top}  ${canvasInfo.interactableArea?.left}  ${canvasInfo.interactableArea?.bottom}  ${canvasInfo.interactableArea?.right} `}
        fontSize={32}
        textAlign="middle-center"
        uiTransform={{ width: '100%', height: 40 }}
      />
    </UiEntity>
  )
}

function PopUpUiTest(props: { canvasInfo: PBUiCanvasInformation }): JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        position: { left: 0, top: 0 },
        positionType: 'absolute',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      uiBackground={{ color: Color4.create(1, 1, 1, 0.1) }}
    >
      <UiEntity
        uiBackground={{
          color: Color4.Purple()
        }}
        uiTransform={{ width: 400, height: 300, flexDirection: 'column' }}
      >
        <Label uiTransform={{ height: '15%', justifyContent: 'flex-end' }} fontSize={36} value="Title popup" />
        <Label
          fontSize={16}
          uiTransform={{ width: '100%', height: '65%' }}
          value={wrapText(
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget ultricies ultrices, nunc nisl ultricies nunc, quis ultricies nisl nisl eget nisl. Donec auctor, nisl eget ultricies ultrices, nunc nisl ultricies nunc, quis ultricies nisl nisl eget nisl.',
            40
          )}
        />
        <UiEntity uiTransform={{ height: '20%', justifyContent: 'center', alignItems: 'flex-start' }}>
          <Button
            uiTransform={{ width: '40%' }}
            value="Accept"
            uiBackground={{ color: Color4.Red() }}
            color={Color4.White()}
          />
          <UiEntity uiTransform={{ width: 20 }} />
          <Button
            uiTransform={{ width: '40%' }}
            value="Close"
            uiBackground={{ color: Color4.Red() }}
            color={Color4.White()}
          />
        </UiEntity>
      </UiEntity>
    </UiEntity>
  )
}

function wrapText(text: string, maxLineLength: number): string {
  const words = text.split(' ')
  let currentLineLength = 0
  let currentLine = ''
  let result = ''
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    if (currentLineLength + word.length > maxLineLength) {
      result += currentLine + '\n'
      currentLine = ''
      currentLineLength = 0
    }
    currentLine += word + ' '
    currentLineLength += word.length + 1
  }
  result += currentLine
  return result
}

function MainCanvas(props: any): JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        position: { left: 0, top: 0 },
        positionType: 'absolute',
        height: '100%',
        width: '100%'
      }}
      uiBackground={{ color: Color4.create(1, 1, 1, 0.1) }}
    >
      {props.children}
    </UiEntity>
  )
}

// Function to demonstrate basic positioning
function BasicPositioning(): JSX.Element {
  return (
    <MainCanvas>
      <UiEntity uiTransform={{ position: { top: 20, left: 20 } }} uiBackground={{ color: Color4.Gray() }}>
        <Label value="Basic Positioning" />
      </UiEntity>
    </MainCanvas>
  )
}

// // Function to demonstrate flex container with flexDirection
// function FlexColumnCenter(): JSX.Element {
//   return (
//     <UiEntity uiTransform={{ flexDirection: 'column', alignItems: 'center' }} uiBackground={{ color: Color4.Blue() }}>
//       <Label value="Flex Column Center" />
//     </UiEntity>
//   )
// }

// // Function to demonstrate background color
// function BackgroundColor(): JSX.Element {
//   return (
//     <UiEntity uiTransform={{ width: 200, height: 100 }} uiBackground={{ color: Color4.Green() }}>
//       <Label value="Background Color" />
//     </UiEntity>
//   )
// }

// // Function to demonstrate flex container with justifyContent
// function FlexRowSpaceBetween(): JSX.Element {
//   return (
//     <UiEntity
//       uiTransform={{ flexDirection: 'row', justifyContent: 'space-between' }}
//       uiBackground={{ color: Color4.Yellow() }}
//     >
//       <Button value="Button 1" />
//       <Button value="Button 2" />
//     </UiEntity>
//   )
// }

// // Function to demonstrate combined properties
// function AbsolutePositioning(): JSX.Element {
//   return (
//     <UiEntity
//       uiTransform={{
//         positionType: 'absolute',
//         top: 50,
//         left: 50,
//         width: '50%',
//         height: 150,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-around'
//       }}
//       uiBackground={{ color: Color4.Red() }}
//     >
//       <Label value="Absolute Positioning" />
//       <Button value="Submit" />
//     </UiEntity>
//   )
// }

// // Usage of the functions
// function UiTransformVariantsTest(): JSX.Element {
//   return (
//     <div>
//       {BasicPositioning()}
//       {FlexColumnCenter()}
//       {BackgroundColor()}
//       {FlexRowSpaceBetween()}
//       {AbsolutePositioning()}
//     </div>
//   )
// }
