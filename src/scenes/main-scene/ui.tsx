import { Color4 } from '@dcl/sdk/math'
import ReactEcs, {
  Label,
  UiEntity,
  type JSX,
  ReactEcsRenderer
} from '@dcl/sdk/react-ecs'
import { sceneEntities } from '../../utils/entity'
import { sceneSystems } from '../../utils/system'
import { scenesOptions } from './scenes'

function nullUi(): JSX.Element {
  return <UiEntity></UiEntity>
}

export function setupUi(element?: () => JSX.Element, extended?: boolean): void {
  if (element !== undefined) {
    const uiComponent =
      extended === true
        ? (): any => [MainSceneUi(), ...(element as any)()]
        : (): any => [MainSceneUi(), element()]
    ReactEcsRenderer.setUiRenderer(uiComponent)
  } else {
    ReactEcsRenderer.setUiRenderer(MainSceneUi)
  }
}

const ITEMS_PER_PAGE = 12
const FIRST_ROW_MARGIN_TOP = 40

let sceneIndex = -1
let isOpen = false
let pageIndex = 0

export function setChangeScene(newSceneIndex: number): void {
  console.log('setChangeScene to scene', newSceneIndex)
  if (newSceneIndex === sceneIndex) return
  sceneIndex = newSceneIndex

  sceneEntities.clean()
  sceneSystems.clean()
  ReactEcsRenderer.setUiRenderer(nullUi)
  const newScene = scenesOptions[sceneIndex]

  if (newScene.mainFn !== undefined) {
    newScene.mainFn()
  }

  setupUi(newScene.ui, newScene.extended)
}

function toggleSelector(): void {
  isOpen = !isOpen
}

function pickScene(i: number): void {
  isOpen = false
  setChangeScene(i)
}

function totalPages(): number {
  return Math.max(1, Math.ceil(scenesOptions.length / ITEMS_PER_PAGE))
}

function nextPage(): void {
  if (pageIndex < totalPages() - 1) pageIndex++
}

function prevPage(): void {
  if (pageIndex > 0) pageIndex--
}

export function MainSceneUi(): JSX.Element {
  const pageItems = scenesOptions.slice(
    pageIndex * ITEMS_PER_PAGE,
    pageIndex * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  )

  return (
    <UiEntity
      uiTransform={{
        position: { left: 0, top: 0 },
        positionType: 'absolute',
        height: '100%',
        width: '100%'
      }}
    >
      {isOpen && (
        <UiEntity
          uiTransform={{
            positionType: 'absolute',
            position: { top: 88, left: 0, right: 0, bottom: 0 }
          }}
          uiBackground={{ color: Color4.create(0, 0, 0, 0.9) }}
        >
          <UiEntity
            uiTransform={{
              positionType: 'absolute',
              position: { left: 12, top: 16, bottom: 16 },
              width: 72,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            uiBackground={{
              color:
                pageIndex > 0
                  ? Color4.Blue()
                  : Color4.create(0.25, 0.25, 0.25, 1)
            }}
            uiText={{
              value: '<',
              fontSize: 48,
              color: Color4.White(),
              textAlign: 'middle-center'
            }}
            onMouseDown={prevPage}
          />

          <UiEntity
            uiTransform={{
              positionType: 'absolute',
              position: { right: 12, top: 16, bottom: 16 },
              width: 72,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            uiBackground={{
              color:
                pageIndex < totalPages() - 1
                  ? Color4.Blue()
                  : Color4.create(0.25, 0.25, 0.25, 1)
            }}
            uiText={{
              value: '>',
              fontSize: 48,
              color: Color4.White(),
              textAlign: 'middle-center'
            }}
            onMouseDown={nextPage}
          />

          <UiEntity
            uiTransform={{
              positionType: 'absolute',
              position: { left: 96, right: 96, top: 16, bottom: 48 },
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              justifyContent: 'center'
            }}
          >
            {pageItems.map((item, offset) => {
              const absoluteIndex = pageIndex * ITEMS_PER_PAGE + offset
              const inFirstRow = offset < 2
              return (
                <UiEntity
                  key={item.name}
                  uiTransform={{
                    width: '48%',
                    height: 72,
                    margin: {
                      top: inFirstRow ? FIRST_ROW_MARGIN_TOP : 0,
                      bottom: 10,
                      left: '1%',
                      right: '1%'
                    },
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: { left: 8, right: 8 }
                  }}
                  uiBackground={{
                    color:
                      absoluteIndex === sceneIndex
                        ? Color4.Red()
                        : Color4.Gray()
                  }}
                  uiText={{
                    value: `${absoluteIndex + 1}. ${item.name}`,
                    fontSize: 22,
                    color: Color4.White(),
                    textAlign: 'middle-center'
                  }}
                  onMouseDown={() => {
                    pickScene(absoluteIndex)
                  }}
                />
              )
            })}
          </UiEntity>

          <Label
            value={`Page ${pageIndex + 1} / ${totalPages()}`}
            fontSize={22}
            color={Color4.White()}
            textAlign="middle-center"
            uiTransform={{
              positionType: 'absolute',
              position: { left: 96, right: 96, bottom: 12 },
              height: 32
            }}
          />
        </UiEntity>
      )}

      <UiEntity
        uiTransform={{
          positionType: 'absolute',
          position: { top: 16, left: '50%' },
          margin: { left: -160 },
          width: 320,
          height: 64,
          alignItems: 'center',
          justifyContent: 'center'
        }}
        uiBackground={{ color: Color4.Blue() }}
        uiText={{
          value: 'Select a scene here',
          fontSize: 22,
          color: Color4.White(),
          textAlign: 'middle-center'
        }}
        onMouseDown={toggleSelector}
      />
    </UiEntity>
  )
}
