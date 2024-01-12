import {
  MeshCollider,
  MeshRenderer,
  Transform,
  type Entity
} from '@dcl/sdk/ecs'
import { type Vector3 } from '@dcl/sdk/math'
import { sceneEntities } from '../../utils/entity'
import { DyingCube, Room } from './components'

// Cube factory
export function createCube(
  x: number,
  y: number,
  z: number,
  spawner = true
): Entity {
  const entity = sceneEntities.addEntity()
  DyingCube.create(entity, {
    t: 3 + 10 * Math.random()
  })
  Transform.create(entity, { position: { x, y, z } })
  MeshRenderer.setBox(entity)
  MeshCollider.setBox(entity)
  return entity
}

export function createRoom(
  startPosition: Vector3,
  cubeSize: number,
  cubeAmount: number,
  levelHeight: number,
  levelAmount: number
): void {
  const roomEntity = sceneEntities.addEntity()
  Room.create(roomEntity, {
    room: {
      version: 0,
      topLeftCorner: startPosition,
      levelHeight,
      levelAmount,
      cubeSize,
      cubeAmount,
      cubeStartEntity: sceneEntities.addEntity(),
      tempX: 0,
      tempZ: 0,
      tempLevel: 0,
      loaded: false
    }
  })
}
