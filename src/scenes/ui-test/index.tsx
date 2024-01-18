import ReactEcs, { Label, type JSX, UiEntity, Dropdown } from '@dcl/sdk/react-ecs'
import {
  type UiTestStateType,
  getUiTestState,
  CurrentStateEnum,
  setUiTestStateCanvasInfo,
  setUiTestStateCurrent
} from './state'
import { Color4 } from '@dcl/sdk/math'
import { sceneSystems } from '../../utils/system'
import { type PBUiCanvasInformation, UiCanvasInformation, engine } from '@dcl/sdk/ecs'

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
          setUiTestStateCurrent(Object.values(CurrentStateEnum)[0])
        }}
        uiTransform={{ width: '100%', height: 40 }}
      />
    </UiEntity>
  )
}

function UiTest(props: { state: UiTestStateType }): JSX.Element {
  if (props.state.current === CurrentStateEnum.CSE_INITIAL) {
    return <InitialUi canvasInfo={getUiTestState().canvasInfo} />
  }
  if (props.state.current === CurrentStateEnum.CSE_POPUP) {
    return <PopUpUiTest canvasInfo={getUiTestState().canvasInfo} />
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
