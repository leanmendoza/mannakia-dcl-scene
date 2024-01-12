import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { MainSceneUi, setChangeScene } from './ui'
import { InputAction, engine, executeTask, inputSystem } from '@dcl/sdk/ecs'

async function setMainSceneUi(): Promise<void> {
  ReactEcsRenderer.setUiRenderer(MainSceneUi)
}

executeTask(setMainSceneUi)

engine.addSystem(() => {
  // console.log(inputSystem.isPressed(InputAction.IA_PRIMARY), inputSystem.isPressed(InputAction.IA_SECONDARY))
  if (
    inputSystem.isPressed(InputAction.IA_PRIMARY) &&
    inputSystem.isPressed(InputAction.IA_SECONDARY)
  ) {
    ReactEcsRenderer.setUiRenderer(MainSceneUi)
  }
})

export function main(): void {
  setChangeScene(3)
}
