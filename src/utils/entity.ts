import type { Entity } from '@dcl/sdk/ecs'
import { engine } from '@dcl/sdk/ecs'

function createEntityManagerFunction(): {
  addEntity: () => Entity
  removeEntity: (entity: Entity) => void
  clean: () => void
  isEmpty: () => boolean
  entities: () => Entity[]
} {
  let arr: Entity[] = []

  return {
    addEntity() {
      const newEntity = engine.addEntity()
      arr.push(newEntity)
      return newEntity
    },
    removeEntity(entity: Entity) {
      engine.removeEntity(entity)
      arr = arr.filter((e) => e !== entity)
    },
    clean() {
      for (const entity of arr) {
        engine.removeEntity(entity)
      }
      arr = []
    },
    isEmpty() {
      return arr.length === 0
    },
    entities() {
      return arr
    }
  }
}

export const sceneEntities = createEntityManagerFunction()
