import {
  Entity,
  MeshCollider,
  MeshRenderer,
  Transform,
  engine,
} from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { DyingCube, Room } from './components'

// Cube factory
export function createCube(x: number, y: number, z: number, spawner = true): Entity {
  const entity = engine.addEntity()
  DyingCube.create(entity, {
    t: 3 + 10 * Math.random()
  })
  Transform.create(entity, { position: { x, y, z } })
  MeshRenderer.setBox(entity)
  MeshCollider.setBox(entity)
  return entity
}


export function createRoom(startPosition: Vector3, cubeSize: number, cubeAmount: number, levelHeight: number, levelAmount: number) {
  
  const roomEntity = engine.addEntity()
  const room = Room.create(roomEntity, {
    room: {
      version: 0,
      topLeftCorner: startPosition,
      levelHeight: levelHeight,
      levelAmount: levelAmount,
      cubeSize: cubeSize,
      cubeAmount: cubeAmount,
      cubeStartEntity: engine.addEntity(),
      tempX: 0,
      tempZ: 0,
      tempLevel: 0,
      loaded: false
    }
  })

} 

