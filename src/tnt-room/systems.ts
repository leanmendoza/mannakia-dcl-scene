import {
  type Entity,
  MeshCollider,
  MeshRenderer,
  Transform,
  engine
} from '@dcl/sdk/ecs'
import { DyingCube, Room } from './components'
import { Vector3 } from '@dcl/sdk/math'

export function dyingCubeSystem(dt: number): void {
  for (const [entity] of engine.getEntitiesWith(DyingCube)) {
    const dyingCube = DyingCube.getMutable(entity)
    dyingCube.t -= dt
    if (dyingCube.t <= 0) {
      engine.removeEntity(entity)
    }
  }
}

export function roomSystem(): void {
  const playerPosition = Transform.get(engine.PlayerEntity).position
  for (const [entity, roomWrapper] of engine.getEntitiesWith(Room)) {
    if (!roomWrapper.room.loaded) {
      const room = Room.getMutable(entity).room
      const scale = Vector3.scale(Vector3.One(), room.cubeSize * 0.9)
      scale.y *= 0.2

      for (let it = 0; it < 50; it++) {
        const position = Vector3.add(
          room.topLeftCorner,
          Vector3.create(
            room.tempX * room.cubeSize,
            room.tempLevel * room.levelHeight,
            room.tempZ * room.cubeSize
          )
        )
        const cubeIndex =
          room.tempX +
          room.tempZ * roomWrapper.room.cubeAmount +
          roomWrapper.room.cubeAmount *
            roomWrapper.room.cubeAmount *
            room.tempLevel
        const cubeEntity = (roomWrapper.room.cubeStartEntity +
          cubeIndex +
          1) as Entity

        Transform.createOrReplace(cubeEntity, { position, scale })
        MeshRenderer.setBox(cubeEntity)
        MeshCollider.setBox(cubeEntity)

        room.tempX += 1
        if (room.tempX >= room.cubeAmount) {
          room.tempX = 0
          room.tempZ += 1
          if (room.tempZ >= room.cubeAmount) {
            room.tempZ = 0
            room.tempLevel += 1
            if (room.tempLevel >= room.levelAmount) {
              room.loaded = true
              break
            }
          }
        }
      }
      continue
    }

    const topLeftCornerCenter = Vector3.add(
      roomWrapper.room.topLeftCorner,
      Vector3.create(
        -roomWrapper.room.cubeSize / 2,
        0,
        -roomWrapper.room.cubeSize / 2
      )
    )
    const playerCubePosition = Vector3.scale(
      Vector3.subtract(playerPosition, topLeftCornerCenter),
      1 / roomWrapper.room.cubeSize
    )

    if (
      playerCubePosition.x < 0 ||
      playerCubePosition.z < 0 ||
      playerCubePosition.x >= roomWrapper.room.cubeAmount ||
      playerCubePosition.z >= roomWrapper.room.cubeAmount
    ) {
      continue
    }

    const xCube = Math.floor(playerCubePosition.x)
    const zCube = Math.floor(playerCubePosition.z)
    const level = Math.floor(playerPosition.y / roomWrapper.room.levelHeight)

    console.log({ xCube, zCube, level })
    const cubeIndex =
      xCube +
      zCube * roomWrapper.room.cubeAmount +
      roomWrapper.room.cubeAmount * roomWrapper.room.cubeAmount * level
    const cubeEntity = (roomWrapper.room.cubeStartEntity +
      cubeIndex +
      1) as Entity

    if (DyingCube.has(cubeEntity)) {
      continue
    }

    DyingCube.create(cubeEntity, {
      t: 0.5
    })
  }
}
