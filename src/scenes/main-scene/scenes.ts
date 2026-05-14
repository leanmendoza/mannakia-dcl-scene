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
import { main as GltfTest } from '../gltf-test'
import { UI as UiTestUi, main as UiTestMain } from '../ui-test'
import { UI as AvatarTestUi, main as AvatarTestMain } from '../avatar-test'
import {
  UI as AvatarTextureTestUi,
  main as AvatarTextureTestMain
} from '../avatar-texture-test'
import { UI as SyncSceneUi, main as SyncSceneMain } from '../sync-scene'
import {
  MainSceneUi as AnimatorSceneUi,
  main as AnimatorSceneMain
} from '../animator'
import { main as GltfNodeModifierStressMain } from '../gltf-node-modifier-stress'
import {
  UI as AnimatedBannersUi,
  main as AnimatedBannersMain
} from '../animated-banners'
import {
  UI as AvatarShapeTestUi,
  main as AvatarShapeTestMain
} from '../avatar-shape-test'
import {
  UI as AvatarStressTestUi,
  main as AvatarStressTestMain
} from '../avatar-stress-test'
import { main as VirtualCameraTestMain } from '../virtual-camera-test'
import { main as VideoScreenTestMain } from '../video-screen-test'
import {
  UI as LocomotionTestUi,
  main as LocomotionTestMain
} from '../locomotion-test'
import { main as MaterialPlaneTestMain } from '../material-plane-test'
import {
  UI as PlayerCameraUi,
  main as PlayerCameraMain
} from '../player-camera-ui'
import {
  UI as AvatarModifierAreaTestUi,
  main as AvatarModifierAreaTestMain
} from '../avatar-modifier-area-test'
import { UI as GlideTestUi, main as GlideTestMain } from '../glide-test'
import {
  UI as PlayersTrackerTestUi,
  main as PlayersTrackerTestMain
} from '../players-tracker-test'
import {
  UI as AudioSourceTestUi,
  main as AudioSourceTestMain
} from '../audio-source-test'
import {
  UI as UiBorderTestUi,
  main as UiBorderTestMain
} from '../ui-border-test'
import {
  UI as UiScrollTestUi,
  main as UiScrollTestMain
} from '../ui-scroll-test'
import {
  UI as UiZIndexTestUi,
  main as UiZIndexTestMain
} from '../ui-zindex-test'

export type SceneItem = {
  name: string
  mainFn?: () => void
  ui?: () => JSX.Element
  extended?: boolean
  default?: boolean
}

// Order: newest scenes at the top, oldest at the bottom. Add new scenes above.
export const scenesOptions: SceneItem[] = [
  {
    name: 'UI Border Test (eibriel)',
    mainFn: UiBorderTestMain,
    ui: UiBorderTestUi
  },
  {
    name: 'UI Scroll Test (eibriel)',
    mainFn: UiScrollTestMain,
    ui: UiScrollTestUi
  },
  {
    name: 'UI zIndex Test (eibriel)',
    mainFn: UiZIndexTestMain,
    ui: UiZIndexTestUi
  },
  {
    name: 'AudioSource Test (issue #1761)',
    mainFn: AudioSourceTestMain,
    ui: AudioSourceTestUi,
    default: true
  },
  {
    name: 'Players Tracker (issue #1818)',
    mainFn: PlayersTrackerTestMain,
    ui: PlayersTrackerTestUi
  },
  {
    name: 'Glide Test',
    mainFn: GlideTestMain,
    ui: GlideTestUi
  },
  {
    name: 'AvatarModifierArea Test',
    mainFn: AvatarModifierAreaTestMain,
    ui: AvatarModifierAreaTestUi
  },
  {
    name: 'Player & Camera UI',
    mainFn: PlayerCameraMain,
    ui: PlayerCameraUi
  },
  {
    name: 'Video Screen Test',
    mainFn: VideoScreenTestMain,
    ui: undefined
  },
  {
    name: 'Virtual Camera Test',
    mainFn: VirtualCameraTestMain,
    ui: undefined
  },
  {
    name: 'Material Plane Test',
    mainFn: MaterialPlaneTestMain,
    ui: undefined
  },
  {
    name: 'Locomotion Test',
    mainFn: LocomotionTestMain,
    ui: LocomotionTestUi
  },
  {
    name: 'AvatarShape Test',
    mainFn: AvatarShapeTestMain,
    ui: AvatarShapeTestUi
  },
  {
    name: 'Avatar Stress Test',
    mainFn: AvatarStressTestMain,
    ui: AvatarStressTestUi
  },
  {
    name: 'Animated Banners',
    mainFn: AnimatedBannersMain,
    ui: AnimatedBannersUi
  },
  {
    name: 'Avatar Texture Test',
    mainFn: AvatarTextureTestMain,
    ui: AvatarTextureTestUi
  },
  {
    name: 'GltfNodeModifier Stress Test',
    mainFn: GltfNodeModifierStressMain,
    ui: undefined,
    extended: true
  },
  {
    name: 'Animator Scene Test',
    mainFn: AnimatorSceneMain,
    ui: AnimatorSceneUi
  },
  {
    name: 'Sync Scene Test',
    mainFn: SyncSceneMain,
    ui: SyncSceneUi
  },
  {
    name: 'Avatar Test',
    mainFn: AvatarTestMain,
    ui: AvatarTestUi
  },
  {
    name: 'Ui test',
    mainFn: UiTestMain,
    ui: UiTestUi,
    extended: true
  },
  {
    name: 'Gltf test',
    mainFn: GltfTest,
    ui: undefined
  },
  {
    name: 'Tween test',
    mainFn: TweenMain,
    ui: TweenSceneUi
  },
  {
    name: 'Text Shape test',
    mainFn: TextShapeApiTestMain,
    ui: TextShapeApiUi
  },
  {
    name: 'Ethereum API test',
    mainFn: EthereumApiTestMain,
    ui: EthereumApiUi
  },
  {
    name: 'Players API test',
    mainFn: PlayerApiTestMain,
    ui: PlayersApiUi
  },
  {
    name: 'TNT-Room',
    mainFn: TntRoomMain,
    ui: undefined
  },
  {
    name: 'Empty',
    mainFn: undefined,
    ui: undefined
  }
]
