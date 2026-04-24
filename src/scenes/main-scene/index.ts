import { engine, UiCanvasInformation } from '@dcl/sdk/ecs'
import { scenesOptions } from './scenes'
import { setChangeScene, setupUi } from './ui'

export function main(): void {
  setupUi(undefined)
  let sceneIndex = scenesOptions.findIndex((scene) => scene.default === true)
  if (sceneIndex === -1) {
    sceneIndex = 0
  }
  setChangeScene(sceneIndex)

  startCanvasInfoLogger()
}

function startCanvasInfoLogger(): void {
  let last = ''
  let acc = 0
  engine.addSystem((dt: number) => {
    acc += dt
    if (acc < 0.5) return
    acc = 0
    const info = UiCanvasInformation.getOrNull(engine.RootEntity)
    if (info === null) return
    const ia = info.interactableArea
    const key = [
      info.width,
      info.height,
      info.devicePixelRatio,
      ia?.top,
      ia?.right,
      ia?.bottom,
      ia?.left
    ].join('|')
    if (key === last) return
    last = key
    console.log(
      `[UiCanvasInfo] ${info.width}x${info.height} @dpr=${info.devicePixelRatio}` +
        ` physical=${Math.round(info.width * info.devicePixelRatio)}x${Math.round(info.height * info.devicePixelRatio)}` +
        ` interactable={t:${ia?.top ?? 0},r:${ia?.right ?? 0},b:${ia?.bottom ?? 0},l:${ia?.left ?? 0}}`
    )
  }, Infinity)
}
