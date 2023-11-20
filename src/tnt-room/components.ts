import { Schemas, engine } from '@dcl/sdk/ecs'

export const DyingCube = engine.defineComponent('dying-cube', {
  t: Schemas.Number
})

export const RoomSchema = Schemas.Map({
  version: Schemas.Number,
  topLeftCorner: Schemas.Vector3,
  levelHeight: Schemas.Number,
  levelAmount: Schemas.Number,
  cubeSize: Schemas.Number,
  cubeAmount: Schemas.Number,
  cubeStartEntity: Schemas.Number,

  loaded: Schemas.Boolean,
  tempX: Schemas.Number,
  tempZ: Schemas.Number,
  tempLevel: Schemas.Number
})

export const Room = engine.defineComponent('room-cube', {
  room: RoomSchema
})
