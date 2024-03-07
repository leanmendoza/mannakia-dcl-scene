import { scenesOptions } from './scenes'
import { setChangeScene, setupUi } from './ui'

export function main(): void {
  setupUi(undefined)
  let sceneIndex = scenesOptions.findIndex((scene) => scene.default === true)
  if (sceneIndex === -1) {
    sceneIndex = 0
  }
  setChangeScene(sceneIndex)
}
