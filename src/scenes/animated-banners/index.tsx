import {
  Animator,
  engine,
  Entity,
  GltfContainer,
  GltfNodeModifiers,
  Material,
  MeshCollider,
  MeshRenderer,
  pointerEventsSystem,
  InputAction,
  Transform,
  TransformType,
  VisibilityComponent,
  TextShape,
  Billboard,
  BillboardMode
} from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import ReactEcs, { Label, type JSX } from '@dcl/sdk/react-ecs'
import { UiBox } from '../../utils/ui/box'
import { sceneEntities } from '../../utils/entity'

// Sample textures for demo purposes
const sampleTextures = [
  'https://decentraland.org/images/logo.png',
  'https://peer.decentraland.org/content/contents/bafkreihqgrxrcpxpjc6clfa3v4ed46xpcswn4bpwcvbqkgcuq6shi7xpai',
  'https://peer.decentraland.org/content/contents/bafkreid3oqyeomxvmkhgdcvsgdxldsdbcafs6mctqg5xf3mx5cnc6qfwmy'
]

// State for UI
const state = {
  animationPlaying: true,
  currentTextureIndex: 0,
  bannerVisible: true,
  currentBannerIndex: 0
}

// Node names for the animated banner model (each side has different nodes)
const nodeNames = [
  'AnimatedBanner/AnimatedBanner02/AnimatedBanner02_1',
  'AnimatedBanner/AnimatedBanner03/AnimatedBanner03_1',
  'AnimatedBanner/AnimatedBanner04/AnimatedBanner04_1',
  'AnimatedBanner/AnimatedBanner05/AnimatedBanner05_1',
  'AnimatedBanner/AnimatedBanner06/AnimatedBanner06_1',
  'AnimatedBanner/AnimatedBanner07/AnimatedBanner07_1',
  'AnimatedBanner/AnimatedBanner08/AnimatedBanner08_1',
  'AnimatedBanner/AnimatedBanner02',
  'AnimatedBanner/AnimatedBanner03',
  'AnimatedBanner/AnimatedBanner04',
  'AnimatedBanner/AnimatedBanner05',
  'AnimatedBanner/AnimatedBanner06',
  'AnimatedBanner/AnimatedBanner07',
  'AnimatedBanner/AnimatedBanner08',
  'AnimatedBanner/AnimatedBanner02/AnimatedBanner02_2',
  'AnimatedBanner/AnimatedBanner03/AnimatedBanner03_2',
  'AnimatedBanner/AnimatedBanner04/AnimatedBanner04_2',
  'AnimatedBanner/AnimatedBanner05/AnimatedBanner05_2',
  'AnimatedBanner/AnimatedBanner06/AnimatedBanner06_2',
  'AnimatedBanner/AnimatedBanner07/AnimatedBanner07_2',
  'AnimatedBanner/AnimatedBanner08/AnimatedBanner08_2'
]

// Node groups for different sides of the banner
const nodeGroups = [
  { name: 'A', s: 0, e: 7 },
  { name: 'B', s: 7, e: 14 },
  { name: 'C', s: 14, e: 21 }
]

class AnimatedBanners {
  bannerEntities: Entity[] = []
  parentEntity: Entity

  bannerPositions = [
    { position: Vector3.create(8, 0, 8) },
    { position: Vector3.create(12, 0, 8) },
    { position: Vector3.create(16, 0, 8) }
  ]

  constructor(transform: TransformType) {
    this.parentEntity = sceneEntities.addEntity()
    Transform.create(this.parentEntity, transform)

    for (const trans of this.bannerPositions) {
      const entity = sceneEntities.addEntity()
      this.bannerEntities.push(entity)

      Transform.create(entity, {
        parent: this.parentEntity,
        scale: Vector3.create(1.3, 1.3, 1.3),
        rotation: { x: 0, y: 1, z: 0, w: 0 }, // 180 degrees to face forward
        ...trans
      })

      VisibilityComponent.create(entity, { visible: true })

      GltfContainer.create(entity, {
        src: 'assets/models/AnimatedBanner.glb'
      })

      // Initialize animation
      Animator.create(entity, {
        states: [
          {
            clip: 'Animation',
            playing: true,
            shouldReset: true,
            loop: true
          }
        ]
      })
    }

    // Apply initial texture
    this.applyTextureToAllBanners(sampleTextures[0])
  }

  playAnimation(play: boolean): void {
    for (const entity of this.bannerEntities) {
      const animator = Animator.getMutable(entity)
      if (animator.states && animator.states.length > 0) {
        animator.states[0].playing = play
      }
    }
    state.animationPlaying = play
  }

  toggleVisibility(): void {
    state.bannerVisible = !state.bannerVisible
    for (const entity of this.bannerEntities) {
      VisibilityComponent.getMutable(entity).visible = state.bannerVisible
    }
  }

  applyTextureToAllBanners(textureUrl: string): void {
    for (const entity of this.bannerEntities) {
      this.applyTextureToBanner(entity, textureUrl)
    }
  }

  applyTextureToBanner(entity: Entity, textureUrl: string): void {
    const texture = Material.Texture.Common({ src: textureUrl })

    GltfNodeModifiers.createOrReplace(entity, {
      modifiers: nodeNames.map((nodeName) => ({
        path: nodeName,
        material: {
          material: {
            $case: 'unlit' as const,
            unlit: {
              texture: texture
            }
          }
        }
      }))
    })
  }

  applyTextureToSide(sideIndex: number, textureUrl: string): void {
    const group = nodeGroups[sideIndex]
    if (!group) return

    const texture = Material.Texture.Common({ src: textureUrl })

    for (const entity of this.bannerEntities) {
      const currentModifiers = GltfNodeModifiers.getOrNull(entity)?.modifiers || []
      const newModifiers = [...currentModifiers]

      nodeNames.slice(group.s, group.e).forEach((nodeName) => {
        const existingIndex = newModifiers.findIndex((m) => m.path === nodeName)
        const modifier = {
          path: nodeName,
          material: {
            material: {
              $case: 'unlit' as const,
              unlit: {
                texture: texture
              }
            }
          }
        }

        if (existingIndex >= 0) {
          newModifiers[existingIndex] = modifier
        } else {
          newModifiers.push(modifier)
        }
      })

      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: newModifiers
      })
    }
  }

  nextTexture(): void {
    state.currentTextureIndex = (state.currentTextureIndex + 1) % sampleTextures.length
    this.applyTextureToAllBanners(sampleTextures[state.currentTextureIndex])
  }

  previousTexture(): void {
    state.currentTextureIndex =
      (state.currentTextureIndex - 1 + sampleTextures.length) % sampleTextures.length
    this.applyTextureToAllBanners(sampleTextures[state.currentTextureIndex])
  }
}

// Singleton instance
let bannerInstance: AnimatedBanners | null = null

function createControlCube(
  position: Vector3,
  color: Color4,
  hoverText: string,
  labelText: string,
  onClick: () => void
): void {
  const cube = sceneEntities.addEntity()

  Transform.create(cube, {
    position: position,
    scale: Vector3.create(0.5, 0.5, 0.5)
  })

  MeshRenderer.setBox(cube)
  MeshCollider.setBox(cube)

  Material.setPbrMaterial(cube, {
    albedoColor: color,
    metallic: 0.2,
    roughness: 0.5
  })

  pointerEventsSystem.onPointerDown(
    {
      entity: cube,
      opts: {
        button: InputAction.IA_PRIMARY,
        hoverText: hoverText,
        maxDistance: 10,
        showFeedback: true
      }
    },
    onClick
  )

  // Add label above cube
  const label = sceneEntities.addEntity()
  Transform.create(label, {
    position: Vector3.create(position.x, position.y + 0.5, position.z),
    scale: Vector3.create(0.5, 0.5, 0.5)
  })

  TextShape.create(label, {
    text: labelText,
    fontSize: 2,
    textColor: Color4.White()
  })

  Billboard.create(label, {
    billboardMode: BillboardMode.BM_Y
  })
}

export function main(): void {
  // Create the animated banners (raised 3.5m)
  bannerInstance = new AnimatedBanners({
    position: Vector3.create(0, 3.5, 0),
    rotation: { x: 0, y: 0, z: 0, w: 1 },
    scale: Vector3.One()
  })

  // Create control cubes (in front of banners - banners are at z=8, cubes at z=5)
  const controlsBasePos = Vector3.create(8, 1, 5)

  // Play/Stop Animation - Green cube
  createControlCube(
    Vector3.create(controlsBasePos.x, controlsBasePos.y, controlsBasePos.z),
    Color4.Green(),
    'Toggle Animation',
    'Play/Stop',
    () => {
      if (bannerInstance) {
        bannerInstance.playAnimation(!state.animationPlaying)
      }
    }
  )

  // Next Texture - Blue cube
  createControlCube(
    Vector3.create(controlsBasePos.x + 1.5, controlsBasePos.y, controlsBasePos.z),
    Color4.Blue(),
    'Next Texture',
    'Next Tex',
    () => {
      if (bannerInstance) {
        bannerInstance.nextTexture()
      }
    }
  )

  // Previous Texture - Yellow cube
  createControlCube(
    Vector3.create(controlsBasePos.x + 3, controlsBasePos.y, controlsBasePos.z),
    Color4.Yellow(),
    'Previous Texture',
    'Prev Tex',
    () => {
      if (bannerInstance) {
        bannerInstance.previousTexture()
      }
    }
  )

  // Toggle Visibility - Red cube
  createControlCube(
    Vector3.create(controlsBasePos.x + 4.5, controlsBasePos.y, controlsBasePos.z),
    Color4.Red(),
    'Toggle Visibility',
    'Show/Hide',
    () => {
      if (bannerInstance) {
        bannerInstance.toggleVisibility()
      }
    }
  )

  // Side A Texture - Magenta cube
  createControlCube(
    Vector3.create(controlsBasePos.x + 6, controlsBasePos.y, controlsBasePos.z),
    Color4.create(1, 0, 1, 1),
    'Change Side A',
    'Side A',
    () => {
      if (bannerInstance) {
        const nextIdx = (state.currentTextureIndex + 1) % sampleTextures.length
        bannerInstance.applyTextureToSide(0, sampleTextures[nextIdx])
      }
    }
  )

  // Side B Texture - Cyan cube
  createControlCube(
    Vector3.create(controlsBasePos.x + 7.5, controlsBasePos.y, controlsBasePos.z),
    Color4.create(0, 1, 1, 1),
    'Change Side B',
    'Side B',
    () => {
      if (bannerInstance) {
        const nextIdx = (state.currentTextureIndex + 1) % sampleTextures.length
        bannerInstance.applyTextureToSide(1, sampleTextures[nextIdx])
      }
    }
  )

  // Side C Texture - Orange cube
  createControlCube(
    Vector3.create(controlsBasePos.x + 9, controlsBasePos.y, controlsBasePos.z),
    Color4.create(1, 0.5, 0, 1),
    'Change Side C',
    'Side C',
    () => {
      if (bannerInstance) {
        const nextIdx = (state.currentTextureIndex + 1) % sampleTextures.length
        bannerInstance.applyTextureToSide(2, sampleTextures[nextIdx])
      }
    }
  )
}

export function UI(): JSX.Element {
  return (
    <UiBox width={350} height={180} uiTransform={{ padding: 10 }}>
      <Label value="Animated Banners Demo" uiTransform={{ height: 30 }} />
      <Label
        value={`Animation: ${state.animationPlaying ? 'Playing' : 'Stopped'}`}
        uiTransform={{ height: 25 }}
      />
      <Label
        value={`Current Texture: ${state.currentTextureIndex + 1}/${sampleTextures.length}`}
        uiTransform={{ height: 25 }}
      />
      <Label
        value={`Banners Visible: ${state.bannerVisible ? 'Yes' : 'No'}`}
        uiTransform={{ height: 25 }}
      />
      <Label
        value="Use cube buttons to control banners"
        uiTransform={{ height: 25 }}
      />
    </UiBox>
  )
}
