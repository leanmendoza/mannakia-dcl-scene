import { InputAction, pointerEventsSystem } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { movePlayerTo } from '~system/RestrictedActions'
import { createCube, createRoom } from './factory'
import { dyingCubeSystem, roomSystem } from './systems'
import { sceneSystems } from '../system'

sceneSystems.addSystem(dyingCubeSystem)
sceneSystems.addSystem(roomSystem)

export function main(): void {
  const parcelSizeX = 6
  const parcelSizeZ = 6
  const levelAmount = 4
  const levelHeight = 15
  const startPosition = Vector3.create(
    -(parcelSizeX / 2) * 16 + 1,
    5,
    -(parcelSizeZ / 2) * 16 + 1
  )

  const startCube = createCube(startPosition.x + 1, 0, startPosition.z + 1)
  createRoom(startPosition, 2, 40, levelHeight, levelAmount)

  pointerEventsSystem.onPointerDown(
    {
      entity: startCube,
      opts: {
        button: InputAction.IA_PRIMARY,
        hoverText: 'Start',
        maxDistance: 10,
        showFeedback: true
      }
    },
    () => {
      movePlayerTo({
        newRelativePosition: Vector3.create(
          startPosition.x + 5,
          startPosition.y + (levelAmount + 2) * levelHeight,
          startPosition.z + 5
        )
      })
        .then()
        .catch(console.error)
    }
  )
}
