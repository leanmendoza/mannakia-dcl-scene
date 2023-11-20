import { Color4 } from '@dcl/sdk/math'
import ReactEcs, {
  Label,
  UiEntity,
  type JSX,
  Dropdown,
  ReactEcsRenderer
} from '@dcl/sdk/react-ecs'
import { sceneEntities } from '../entity'
import { sceneSystems } from '../system'
import { main as TntRoomMain } from '../tnt-room'
import { main as PlayerApiTestMain } from '../players-api'

type SceneItem = {
  name: string
  mainFn?: () => void
  ui?: () => JSX.Element
}

const scenesOptions: SceneItem[] = [
  {
    name: 'Empty',
    mainFn: undefined,
    ui: undefined
  },
  {
    name: 'TNT-Room',
    mainFn: TntRoomMain,
    ui: undefined
  },
  {
    name: 'Players API test',
    mainFn: PlayerApiTestMain,
    ui: undefined
  }
]

function nullUi(): JSX.Element {
  return <UiEntity></UiEntity>
}

let sceneIndex = 0
function setChangeScene(newSceneIndex: number): void {
  if (newSceneIndex === sceneIndex) return
  sceneIndex = newSceneIndex

  sceneEntities.clean()
  sceneSystems.clean()
  ReactEcsRenderer.setUiRenderer(nullUi)
  const newScene = scenesOptions[sceneIndex]

  if (newScene.mainFn !== undefined) {
    newScene.mainFn()
  }

  if (newScene.ui !== undefined) {
    ReactEcsRenderer.setUiRenderer(newScene.ui)
  }
}

export function MainSceneUi(): JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        height: '100%',
        width: '100%'
      }}
    >
      <UiEntity
        uiBackground={{ color: Color4.Blue() }}
        uiTransform={{
          flexDirection: 'column',
          height: 160,
          width: 350,
          position: { left: 100, top: 100 }
        }}
      >
        <Label
          textAlign="middle-center"
          value="Main Scene"
          fontSize={24}
          uiTransform={{ margin: 10, width: '100%', height: 36 }}
        />

        <UiEntity uiTransform={{ flexDirection: 'column', height: 50 }}>
          <Label
            textAlign="middle-center"
            value="Choose the scene"
            fontSize={16}
            uiTransform={{ margin: 10, width: '100%', height: 36 }}
          />

          <Dropdown
            options={scenesOptions.map((item) => item.name)}
            color={Color4.Red()}
            font="sans-serif"
            fontSize={14}
            selectedIndex={sceneIndex}
            onChange={setChangeScene}
            uiTransform={{
              width: '100%',
              height: 48,
              padding: 5
            }}
            uiBackground={{ color: Color4.Gray() }}
          />
        </UiEntity>

        <Label
          textAlign="middle-center"
          value="Press E+F+1 to force this UI"
          fontSize={16}
          uiTransform={{ margin: 10, width: '100%', height: 36 }}
        />
      </UiEntity>
    </UiEntity>
  )
}
