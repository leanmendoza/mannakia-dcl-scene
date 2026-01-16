import {
  type Entity,
  Material,
  MeshRenderer,
  MeshCollider,
  Transform,
  TextShape,
  engine,
  PlayerIdentityData,
  Billboard,
  BillboardMode,
  pointerEventsSystem,
  InputAction
} from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import ReactEcs, { Label, UiEntity, type JSX, Input, Button } from '@dcl/sdk/react-ecs'
import { sceneEntities } from '../../utils/entity'
import { UiItem } from '../../utils/ui/item'

// Label helper: creates text with black plane background and Y-axis billboard
function createLabel(
  position: { x: number; y: number; z: number },
  text: string,
  fontSize: number = 2,
  width: number = 3
): Entity {
  const labelEntity = sceneEntities.addEntity()

  Transform.create(labelEntity, {
    position: Vector3.create(position.x, position.y, position.z)
  })

  Billboard.create(labelEntity, {
    billboardMode: BillboardMode.BM_Y
  })

  // Create background plane (child)
  const backgroundEntity = sceneEntities.addEntity()
  Transform.create(backgroundEntity, {
    parent: labelEntity,
    position: Vector3.create(0, 0, 0.01),
    scale: Vector3.create(width, width * 0.5, 1)
  })
  MeshRenderer.setPlane(backgroundEntity)
  Material.setBasicMaterial(backgroundEntity, {
    diffuseColor: Color4.Black()
  })

  // Create text (child, slightly in front)
  const textEntity = sceneEntities.addEntity()
  Transform.create(textEntity, {
    parent: labelEntity,
    position: Vector3.create(0, 0, 0)
  })
  TextShape.create(textEntity, {
    text,
    fontSize,
    width,
    textWrapping: true
  })

  return labelEntity
}

// Texture options for testing
type TextureOption =
  | { type: 'avatar'; userId: string; label: string }
  | { type: 'local'; src: string; label: string }
  | { type: 'none'; label: string }

const TEXTURE_OPTIONS: TextureOption[] = [
  { type: 'avatar', userId: '0x481bed8645804714Efd1dE3f25467f78E7Ba07d6', label: 'User 1' },
  { type: 'avatar', userId: '0x07752012ea7475da9efd46371dbc2220b9f13b54', label: 'User 2' },
  { type: 'avatar', userId: '0xc0ffee254729296a45a3885639AC7E10F9d54979', label: 'User 3' },
  { type: 'none', label: 'No Texture' },
  { type: 'avatar', userId: 'invalid-profile-id', label: 'Invalid Profile' },
  { type: 'local', src: 'assets/teleporter/Button_Color.png', label: 'Local Texture' }
]

// Keep TEST_USER_IDS for static UI avatars
const TEST_USER_IDS = [
  '0x481bed8645804714Efd1dE3f25467f78E7Ba07d6',
  '0x07752012ea7475da9efd46371dbc2220b9f13b54',
  '0xc0ffee254729296a45a3885639AC7E10F9d54979'
]

let currentOptionIndex = 0
let customUserId = ''
let isExpanded = true

// Create entities for the 3D scene
let materialPlaneEntity: Entity | null = null
let materialCubeEntity: Entity | null = null
let materialDynamicEntity: Entity | null = null

// Get current player address
function getCurrentPlayerAddress(): string | undefined {
  const playerIdentity = PlayerIdentityData.getOrNull(engine.PlayerEntity)
  return playerIdentity?.address
}

export function main(): void {
  // Create a plane with avatar texture material
  materialPlaneEntity = sceneEntities.addEntity()
  Transform.create(materialPlaneEntity, {
    position: Vector3.create(8, 2, 8),
    scale: Vector3.create(2, 2, 1)
  })
  MeshRenderer.setPlane(materialPlaneEntity)

  // Apply initial texture to the plane
  const initialOption = TEXTURE_OPTIONS[currentOptionIndex]
  if (initialOption.type === 'avatar') {
    Material.setPbrMaterial(materialPlaneEntity, {
      texture: Material.Texture.Avatar({
        userId: initialOption.userId
      })
    })
  }

  // Create a label above the plane
  createLabel({ x: 8, y: 3.5, z: 8 }, 'Avatar Texture on Plane (PBR Material)')

  // Create a cube with avatar texture material
  materialCubeEntity = sceneEntities.addEntity()
  Transform.create(materialCubeEntity, {
    position: Vector3.create(12, 2, 8),
    scale: Vector3.create(1.5, 1.5, 1.5)
  })
  MeshRenderer.setBox(materialCubeEntity)

  // Apply avatar texture to the cube with unlit material
  if (initialOption.type === 'avatar') {
    Material.setBasicMaterial(materialCubeEntity, {
      texture: Material.Texture.Avatar({
        userId: initialOption.userId
      })
    })
  }

  // Create a label above the cube
  createLabel({ x: 12, y: 3.5, z: 8 }, 'Avatar Texture on Cube (Basic Material)')

  // Create a second plane to test different user
  const secondPlaneEntity = sceneEntities.addEntity()
  Transform.create(secondPlaneEntity, {
    position: Vector3.create(4, 2, 8),
    scale: Vector3.create(2, 2, 1)
  })
  MeshRenderer.setPlane(secondPlaneEntity)

  Material.setPbrMaterial(secondPlaneEntity, {
    texture: Material.Texture.Avatar({
      userId: TEST_USER_IDS[1]
    })
  })

  // Create a label for second plane
  createLabel({ x: 4, y: 3.5, z: 8 }, 'Different User Avatar')

  // Create a dynamic material plane (updates with Material.createOrReplace)
  materialDynamicEntity = sceneEntities.addEntity()
  Transform.create(materialDynamicEntity, {
    position: Vector3.create(16, 2, 8),
    scale: Vector3.create(2, 2, 1)
  })
  MeshRenderer.setPlane(materialDynamicEntity)

  if (initialOption.type === 'avatar') {
    Material.createOrReplace(materialDynamicEntity, {
      material: {
        $case: 'pbr',
        pbr: {
          texture: {
            tex: {
              $case: 'avatarTexture',
              avatarTexture: {
                userId: initialOption.userId
              }
            }
          }
        }
      }
    })
  }

  // Create a label for dynamic material plane
  createLabel({ x: 16, y: 3.5, z: 8 }, 'Material.createOrReplace')

  // Create a clickable 3D button to cycle users
  const clickerEntity = sceneEntities.addEntity()
  Transform.create(clickerEntity, {
    position: Vector3.create(10, 1, 6),
    scale: Vector3.create(1, 0.5, 0.3)
  })
  MeshRenderer.setBox(clickerEntity)
  MeshCollider.setBox(clickerEntity)
  Material.setBasicMaterial(clickerEntity, {
    diffuseColor: Color4.Blue()
  })

  pointerEventsSystem.onPointerDown(
    {
      entity: clickerEntity,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: 'Next Option'
      }
    },
    () => {
      nextOption()
    }
  )

  // Create a label for the clicker
  createLabel({ x: 10, y: 1.5, z: 6 }, 'Next Option', 1.5, 2)
}

function getCurrentOption(): TextureOption {
  if (customUserId.length > 0) {
    return { type: 'avatar', userId: customUserId, label: 'Custom' }
  }
  return TEXTURE_OPTIONS[currentOptionIndex]
}

function applyTextureToEntity(entity: Entity, option: TextureOption, usePbr: boolean): void {
  if (option.type === 'none') {
    Material.deleteFrom(entity)
    return
  }

  if (option.type === 'local') {
    if (usePbr) {
      Material.setPbrMaterial(entity, {
        texture: Material.Texture.Common({ src: option.src })
      })
    } else {
      Material.setBasicMaterial(entity, {
        texture: Material.Texture.Common({ src: option.src })
      })
    }
    return
  }

  // Avatar texture
  if (usePbr) {
    Material.setPbrMaterial(entity, {
      texture: Material.Texture.Avatar({ userId: option.userId })
    })
  } else {
    Material.setBasicMaterial(entity, {
      texture: Material.Texture.Avatar({ userId: option.userId })
    })
  }
}

function updateMaterialTextures(): void {
  const option = getCurrentOption()

  if (materialPlaneEntity !== null) {
    applyTextureToEntity(materialPlaneEntity, option, true)
  }

  if (materialCubeEntity !== null) {
    applyTextureToEntity(materialCubeEntity, option, false)
  }

  if (materialDynamicEntity !== null) {
    if (option.type === 'none') {
      Material.deleteFrom(materialDynamicEntity)
    } else if (option.type === 'local') {
      Material.createOrReplace(materialDynamicEntity, {
        material: {
          $case: 'pbr',
          pbr: {
            texture: {
              tex: {
                $case: 'texture',
                texture: { src: option.src }
              }
            }
          }
        }
      })
    } else {
      Material.createOrReplace(materialDynamicEntity, {
        material: {
          $case: 'pbr',
          pbr: {
            texture: {
              tex: {
                $case: 'avatarTexture',
                avatarTexture: { userId: option.userId }
              }
            }
          }
        }
      })
    }
  }
}

function nextOption(): void {
  currentOptionIndex = (currentOptionIndex + 1) % TEXTURE_OPTIONS.length
  customUserId = ''
  updateMaterialTextures()
}

function getCurrentLabel(): string {
  return getCurrentOption().label
}

function toggleExpanded(): void {
  isExpanded = !isExpanded
}

export function UI(): JSX.Element {
  const currentOption = getCurrentOption()

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {/* Main Panel - Top Centered */}
      <UiEntity
        uiBackground={{ color: Color4.create(0.1, 0.1, 0.1, 0.95) }}
        uiTransform={{
          margin: { top: 10 },
          width: 600,
          padding: 10,
          flexDirection: 'column'
        }}
      >
        {/* Header with toggle */}
        <UiEntity
          uiTransform={{
            flexDirection: 'row',
            height: 40,
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Label
            value="Avatar Texture Test"
            fontSize={20}
            uiTransform={{ height: 30 }}
          />
          <Button
            value={isExpanded ? 'Collapse' : 'Expand'}
            fontSize={12}
            uiTransform={{ width: 80, height: 30 }}
            uiBackground={{ color: Color4.Gray() }}
            onMouseDown={toggleExpanded}
          />
        </UiEntity>

        {/* Expandable Content */}
        {isExpanded && (
          <UiEntity
            uiTransform={{
              flexDirection: 'column',
              width: '100%'
            }}
          >
            {/* Current Player Info */}
            <UiEntity
              uiTransform={{
                flexDirection: 'row',
                height: 30,
                width: '100%',
                margin: { top: 10 },
                alignItems: 'center'
              }}
            >
              <Label
                value="Your address:"
                fontSize={12}
                uiTransform={{ width: 90, height: 25 }}
              />
              <Label
                value={getCurrentPlayerAddress() ?? 'Loading...'}
                fontSize={11}
                color={Color4.Green()}
                uiTransform={{ width: 350, height: 25 }}
              />
              <Button
                value="Use Mine"
                fontSize={11}
                uiTransform={{ width: 80, height: 25, margin: { left: 10 } }}
                uiBackground={{ color: Color4.create(0.2, 0.6, 0.2, 1) }}
                onMouseDown={() => {
                  const myAddress = getCurrentPlayerAddress()
                  if (myAddress) {
                    customUserId = myAddress
                    updateMaterialTextures()
                  }
                }}
              />
            </UiEntity>

            {/* Controls Row */}
            <UiEntity
              uiTransform={{
                flexDirection: 'row',
                height: 40,
                width: '100%',
                margin: { top: 5 },
                alignItems: 'center'
              }}
            >
              <Label
                value="Option:"
                fontSize={14}
                uiTransform={{ width: 60, height: 30 }}
              />
              <Label
                value={currentOption.label}
                fontSize={12}
                color={Color4.Yellow()}
                uiTransform={{ width: 170, height: 30 }}
              />
              <Button
                value="Next"
                fontSize={12}
                uiTransform={{ width: 80, height: 30, margin: { left: 10 } }}
                uiBackground={{ color: Color4.Blue() }}
                onMouseDown={nextOption}
              />
              <Input
                placeholder="Custom ID (0x...)"
                fontSize={11}
                placeholderColor={Color4.Gray()}
                uiTransform={{ width: 200, height: 30, margin: { left: 10 } }}
                onChange={(value) => {
                  customUserId = value
                  updateMaterialTextures()
                }}
                uiBackground={{ color: Color4.create(0.2, 0.2, 0.2, 1) }}
                color={Color4.White()}
              />
            </UiEntity>

            {/* Avatar Textures Row */}
            <Label
              value="UI Background with Avatar Texture:"
              fontSize={14}
              uiTransform={{ height: 25, margin: { top: 15 } }}
            />
            <UiEntity
              uiTransform={{
                flexDirection: 'row',
                height: 160,
                width: '100%',
                justifyContent: 'center'
              }}
            >
              {/* First avatar */}
              <UiEntity
                uiTransform={{
                  width: 140,
                  height: 160,
                  margin: 5,
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <UiItem
                  avatarTexture={{ userId: TEST_USER_IDS[0] }}
                  width={120}
                  height={120}
                />
                <Label value="User 1" fontSize={11} uiTransform={{ height: 20 }} />
              </UiEntity>

              {/* Second avatar */}
              <UiEntity
                uiTransform={{
                  width: 140,
                  height: 160,
                  margin: 5,
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <UiItem
                  avatarTexture={{ userId: TEST_USER_IDS[1] }}
                  width={120}
                  height={120}
                />
                <Label value="User 2" fontSize={11} uiTransform={{ height: 20 }} />
              </UiEntity>

              {/* Third avatar */}
              <UiEntity
                uiTransform={{
                  width: 140,
                  height: 160,
                  margin: 5,
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <UiItem
                  avatarTexture={{ userId: TEST_USER_IDS[2] }}
                  width={120}
                  height={120}
                />
                <Label value="User 3" fontSize={11} uiTransform={{ height: 20 }} />
              </UiEntity>

              {/* Dynamic texture */}
              <UiEntity
                uiTransform={{
                  width: 140,
                  height: 160,
                  margin: 5,
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <UiItem
                  avatarTexture={currentOption.type === 'avatar' ? { userId: currentOption.userId } : undefined}
                  texture={currentOption.type === 'local' ? { src: currentOption.src } : undefined}
                  width={120}
                  height={120}
                />
                <Label value={currentOption.label} fontSize={11} color={Color4.Yellow()} uiTransform={{ height: 20 }} />
              </UiEntity>

              {/* Current player avatar */}
              {getCurrentPlayerAddress() && (
                <UiEntity
                  uiTransform={{
                    width: 140,
                    height: 160,
                    margin: 5,
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <UiItem
                    avatarTexture={{ userId: getCurrentPlayerAddress()! }}
                    width={120}
                    height={120}
                  />
                  <Label value="You" fontSize={11} color={Color4.Green()} uiTransform={{ height: 20 }} />
                </UiEntity>
              )}
            </UiEntity>

            {/* Stretch mode test */}
            <Label
              value="Stretch mode:"
              fontSize={14}
              uiTransform={{ height: 25, margin: { top: 10 } }}
            />
            <UiItem
              avatarTexture={currentOption.type === 'avatar' ? { userId: currentOption.userId } : undefined}
              texture={currentOption.type === 'local' ? { src: currentOption.src } : undefined}
              textureMode="stretch"
              width={'100%'}
              height={80}
            />
          </UiEntity>
        )}
      </UiEntity>
    </UiEntity>
  )
}
