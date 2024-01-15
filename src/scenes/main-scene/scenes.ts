import { type JSX } from '@dcl/sdk/react-ecs'
import { main as TntRoomMain } from '../tnt-room'
import {
  main as PlayerApiTestMain,
  MainSceneUi as PlayersApiUi
} from '../players-api'
import {
  main as EthereumApiTestMain,
  MainSceneUi as EthereumApiUi
} from '../ethereum-api'
import {
  main as TextShapeApiTestMain,
  MainSceneUi as TextShapeApiUi
} from '../text-shape'
import { MainSceneUi as TweenSceneUi, main as TweenMain } from '../tweens'

export type SceneItem = {
  name: string
  mainFn?: () => void
  ui?: () => JSX.Element
}

export const scenesOptions: SceneItem[] = [
  {
    name: 'Empty',
    mainFn: undefined,
    ui: undefined
  },
  {
    name: 'TNT-Room',
    mainFn: TntRoomMain,
    ui: undefined
  },
  {
    name: 'Players API test',
    mainFn: PlayerApiTestMain,
    ui: PlayersApiUi
  },
  {
    name: 'Ethereum API test',
    mainFn: EthereumApiTestMain,
    ui: EthereumApiUi
  },
  {
    name: 'Text Shape test',
    mainFn: TextShapeApiTestMain,
    ui: TextShapeApiUi
  },
  {
    name: 'Tween test',
    mainFn: TweenMain,
    ui: TweenSceneUi
  }
]
