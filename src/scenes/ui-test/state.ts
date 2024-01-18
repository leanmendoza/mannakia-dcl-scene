import {
  type Entity,
  EntityState,
  Schemas,
  engine,
  UiCanvasInformation,
  type PBUiCanvasInformation
} from '@dcl/sdk/ecs'
import { sceneEntities } from '../../utils/entity'

let stateEntity: Entity | undefined

export enum CurrentStateEnum {
  CSE_INITIAL = 'CSE_INITIAL',
  CSE_POPUP = 'CSE_POPUP'
}

const UiTestStateSchema = {
  current: Schemas.EnumString<CurrentStateEnum>(CurrentStateEnum, CurrentStateEnum.CSE_INITIAL),
  canvasInfo: UiCanvasInformation.schema
}

const UiTestState = engine.defineComponent('uiTestState', UiTestStateSchema)
export type UiTestStateType = ReturnType<typeof UiTestState.create>

function getStateEntity(): Entity {
  if (stateEntity === undefined || engine.getEntityState(stateEntity) !== EntityState.UsedEntity) {
    stateEntity = sceneEntities.addEntity()
    UiTestState.create(stateEntity)
  }
  return stateEntity
}

export function getUiTestState(): UiTestStateType {
  return UiTestState.get(getStateEntity())
}

export function setUiTestStateCurrent(value: CurrentStateEnum): void {
  const state = getUiTestState()
  state.current = value
  UiTestState.createOrReplace(getStateEntity(), { ...state })
}

export function setUiTestStateCanvasInfo(value: PBUiCanvasInformation): void {
  const newState = { ...getUiTestState() }
  console.log('setting new canvas info', value, newState, getStateEntity())
  newState.canvasInfo = value
  UiTestState.createOrReplace(getStateEntity(), newState)
}
