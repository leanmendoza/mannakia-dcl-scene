import {
  Animator,
  ColliderLayer,
  engine,
  Entity,
  GltfContainer,
  GltfNodeModifiers,
  InputAction,
  Material,
  MeshCollider,
  MeshRenderer,
  pointerEventsSystem,
  TextShape,
  Transform
} from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { sceneEntities } from '../../utils/entity'
import { getRandomHexColor, GODOT_ALL_COLORS, GODOT_ALL_COLORS_KEYS } from '../../utils/color'

const SHARK_MODEL = 'assets/shark/shark.glb'
const GRID_SIZE = 3 // 3x3 grid = 9 sharks
const SPACING = 3.5

// Scene bounds: 0-48 in X and Z (3x3 parcels)
// Layout:
// - Shark Grid: centered around (12, 24)
// - Shark Controls: Z = 14
// - Multi-Model Section: centered around (32, 24)
// - Multi-Model Controls: Z = 10

// Modifier types that will rotate on click
enum ModifierType {
  NONE,
  RANDOM_COLOR_ALL,
  EMISSIVE_GLOW,
  UNLIT_MATERIAL,
  DISABLE_SHADOWS,
  MULTI_NODE_COLORS,
  TRANSPARENT
}

const MODIFIER_NAMES = [
  'No Modifier',
  'Random Color (All)',
  'Emissive Glow',
  'Unlit Material',
  'Shadows Disabled',
  'Multi-Node Colors',
  'Transparent'
]

interface SharkInstance {
  entity: Entity
  currentModifier: ModifierType
  labelEntity: Entity
}

const sharks: SharkInstance[] = []

export function main(): void {
  createSharkGrid()
  createControlPanel()
  createMultiModelSection()
}

function createSharkGrid(): void {
  // Center the grid around (12, 28)
  const centerX = 12
  const centerZ = 28
  const startX = centerX - ((GRID_SIZE - 1) * SPACING) / 2
  const startZ = centerZ - ((GRID_SIZE - 1) * SPACING) / 2

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const index = row * GRID_SIZE + col
      const x = startX + col * SPACING
      const z = startZ + row * SPACING

      const shark = createSharkWithLabel(x, z, index)
      sharks.push(shark)
    }
  }
}

function createSharkWithLabel(x: number, z: number, index: number): SharkInstance {
  // Create shark entity
  const sharkEntity = sceneEntities.addEntity()
  Transform.create(sharkEntity, {
    position: Vector3.create(x, 1.5, z),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    scale: Vector3.create(0.8, 0.8, 0.8)
  })
  GltfContainer.create(sharkEntity, {
    src: SHARK_MODEL,
    visibleMeshesCollisionMask: ColliderLayer.CL_POINTER,
    invisibleMeshesCollisionMask: undefined
  })
  Animator.create(sharkEntity, {
    states: [
      {
        clip: 'swim',
        playing: true,
        loop: true,
        weight: 1
      }
    ]
  })

  // Create label above shark
  const labelEntity = sceneEntities.addEntity()
  Transform.create(labelEntity, {
    position: Vector3.create(x, 3.2, z)
  })
  TextShape.create(labelEntity, {
    text: `#${index + 1}\n${MODIFIER_NAMES[0]}`,
    fontSize: 2,
    textColor: Color4.White()
  })

  // Add click handler to shark
  pointerEventsSystem.onPointerDown(
    {
      entity: sharkEntity,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: 'Cycle Modifier'
      }
    },
    () => {
      cycleModifier(index)
    }
  )

  return {
    entity: sharkEntity,
    currentModifier: ModifierType.NONE,
    labelEntity
  }
}

function cycleModifier(index: number): void {
  const shark = sharks[index]
  const nextModifier = (shark.currentModifier + 1) % Object.keys(ModifierType).filter(k => isNaN(Number(k))).length
  shark.currentModifier = nextModifier
  applyModifier(shark, nextModifier)
  updateLabel(shark, index, nextModifier)
}

function applyModifier(shark: SharkInstance, modifierType: ModifierType): void {
  const entity = shark.entity

  switch (modifierType) {
    case ModifierType.NONE:
      GltfNodeModifiers.deleteFrom(entity)
      break

    case ModifierType.RANDOM_COLOR_ALL:
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          {
            path: '',
            material: {
              material: {
                $case: 'pbr',
                pbr: {
                  albedoColor: Color4.fromHexString(getRandomHexColor())
                }
              }
            }
          }
        ]
      })
      break

    case ModifierType.EMISSIVE_GLOW:
      const emissiveColor = GODOT_ALL_COLORS[GODOT_ALL_COLORS_KEYS[Math.floor(Math.random() * GODOT_ALL_COLORS_KEYS.length)]]
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          {
            path: '',
            material: {
              material: {
                $case: 'pbr',
                pbr: {
                  albedoColor: Color4.White(),
                  emissiveIntensity: 50,
                  emissiveColor
                }
              }
            }
          }
        ]
      })
      break

    case ModifierType.UNLIT_MATERIAL:
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          {
            path: '',
            material: {
              material: {
                $case: 'unlit',
                unlit: {
                  diffuseColor: Color4.fromHexString(getRandomHexColor())
                }
              }
            }
          }
        ]
      })
      break

    case ModifierType.DISABLE_SHADOWS:
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          {
            path: '',
            castShadows: false
          }
        ]
      })
      break

    case ModifierType.MULTI_NODE_COLORS:
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          {
            path: 'Scene_root/shark_skeleton/Sphere/Sphere.001',
            material: {
              material: {
                $case: 'pbr',
                pbr: {
                  albedoColor: Color4.fromHexString(getRandomHexColor())
                }
              }
            }
          },
          {
            path: 'Scene_root/shark_skeleton/Sphere/Sphere.001/Sphere_1',
            material: {
              material: {
                $case: 'pbr',
                pbr: {
                  albedoColor: Color4.fromHexString(getRandomHexColor())
                }
              }
            }
          },
          {
            path: 'Scene_root/shark_skeleton/Sphere/Sphere.001/Sphere_2',
            material: {
              material: {
                $case: 'pbr',
                pbr: {
                  albedoColor: Color4.fromHexString(getRandomHexColor())
                }
              }
            }
          },
          {
            path: 'Scene_root/shark_skeleton/Sphere/Sphere.001/Sphere_3',
            material: {
              material: {
                $case: 'pbr',
                pbr: {
                  albedoColor: Color4.fromHexString(getRandomHexColor())
                }
              }
            }
          }
        ]
      })
      break

    case ModifierType.TRANSPARENT:
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          {
            path: '',
            material: {
              material: {
                $case: 'pbr',
                pbr: {
                  albedoColor: Color4.create(
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    0.5
                  )
                }
              }
            }
          }
        ]
      })
      break
  }
}

function updateLabel(shark: SharkInstance, index: number, modifierType: ModifierType): void {
  TextShape.createOrReplace(shark.labelEntity, {
    text: `#${index + 1}\n${MODIFIER_NAMES[modifierType]}`,
    fontSize: 2,
    textColor: Color4.White()
  })
}

function createControlPanel(): void {
  // Title - positioned near shark grid
  const titleEntity = sceneEntities.addEntity()
  Transform.create(titleEntity, {
    position: Vector3.create(12, 5, 36)
  })
  TextShape.create(titleEntity, {
    text: 'Shark Grid Test\nClick sharks to cycle\nClick cubes for batch',
    fontSize: 2,
    textColor: Color4.Yellow()
  })

  // Control cubes - positioned below shark grid (Z = 20)
  const controlZ = 20
  const controlStartX = 4

  createControlCube(Vector3.create(controlStartX, 1, controlZ), 'Random\nColor', Color4.Green(), () => {
    sharks.forEach((shark, i) => {
      shark.currentModifier = ModifierType.RANDOM_COLOR_ALL
      applyModifier(shark, ModifierType.RANDOM_COLOR_ALL)
      updateLabel(shark, i, ModifierType.RANDOM_COLOR_ALL)
    })
  })

  createControlCube(Vector3.create(controlStartX + 3, 1, controlZ), 'Emissive\nGlow', Color4.Magenta(), () => {
    sharks.forEach((shark, i) => {
      shark.currentModifier = ModifierType.EMISSIVE_GLOW
      applyModifier(shark, ModifierType.EMISSIVE_GLOW)
      updateLabel(shark, i, ModifierType.EMISSIVE_GLOW)
    })
  })

  createControlCube(Vector3.create(controlStartX + 6, 1, controlZ), 'Multi\nNode', GODOT_ALL_COLORS.CYAN, () => {
    sharks.forEach((shark, i) => {
      shark.currentModifier = ModifierType.MULTI_NODE_COLORS
      applyModifier(shark, ModifierType.MULTI_NODE_COLORS)
      updateLabel(shark, i, ModifierType.MULTI_NODE_COLORS)
    })
  })

  createControlCube(Vector3.create(controlStartX + 9, 1, controlZ), 'Randomize\nAll', Color4.Red(), () => {
    sharks.forEach((shark, i) => {
      const randomModifier = Math.floor(Math.random() * MODIFIER_NAMES.length)
      shark.currentModifier = randomModifier
      applyModifier(shark, randomModifier)
      updateLabel(shark, i, randomModifier)
    })
  })

  createControlCube(Vector3.create(controlStartX + 12, 1, controlZ), 'Clear\nAll', Color4.Gray(), () => {
    sharks.forEach((shark, i) => {
      shark.currentModifier = ModifierType.NONE
      applyModifier(shark, ModifierType.NONE)
      updateLabel(shark, i, ModifierType.NONE)
    })
  })

  createControlCube(Vector3.create(controlStartX + 15, 1, controlZ), 'Rapid\nFire', GODOT_ALL_COLORS.ORANGE, () => {
    rapidFireTest()
  })
}

function createControlCube(
  position: Vector3,
  label: string,
  color: Color4,
  callback: () => void
): void {
  const cube = sceneEntities.addEntity()
  Transform.create(cube, { position })
  MeshRenderer.setBox(cube)
  MeshCollider.setBox(cube)
  Material.setPbrMaterial(cube, { albedoColor: color })

  pointerEventsSystem.onPointerDown(
    {
      entity: cube,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: label.replace('\n', ' ')
      }
    },
    callback
  )

  // Label above cube
  const labelEntity = sceneEntities.addEntity()
  Transform.create(labelEntity, {
    position: Vector3.create(position.x, position.y + 1.2, position.z)
  })
  TextShape.create(labelEntity, {
    text: label,
    fontSize: 1.5,
    textColor: Color4.White()
  })
}

// Stress test: rapidly change modifiers on all sharks
let rapidFireCount = 0
let rapidFireActive = false
const RAPID_FIRE_MAX = 20

function rapidFireSystem(): void {
  if (!rapidFireActive) return

  if (rapidFireCount >= RAPID_FIRE_MAX) {
    rapidFireActive = false
    rapidFireCount = 0
    return
  }

  sharks.forEach((shark, i) => {
    const randomModifier = Math.floor(Math.random() * MODIFIER_NAMES.length)
    shark.currentModifier = randomModifier
    applyModifier(shark, randomModifier)
    updateLabel(shark, i, randomModifier)
  })

  rapidFireCount++
}

engine.addSystem(rapidFireSystem)

function rapidFireTest(): void {
  rapidFireCount = 0
  rapidFireActive = true
}

// ============================================================
// MULTI-MODEL SECTION - Different GLTFs with various modifiers
// Using specific node paths discovered via inspect-gltf.js
// ============================================================

interface MultiModelInstance {
  entity: Entity
  modelType: string
  modifierIndex: number
  labelEntity: Entity
}

const multiModelInstances: MultiModelInstance[] = []

// Model definitions with their specific node paths
const MODELS = [
  {
    src: 'assets/teleporter/teleporter.glb',
    name: 'Teleporter',
    scale: 0.5,
    // Specific paths from inspect-gltf.js
    paths: {
      all: '',
      structure: 'TeleporterStructure',
      button: 'ButtonBase.003',
      frameA: 'TeleporterArmature/FrameA',
      frameB: 'TeleporterArmature/FrameB',
      glassA: 'TeleporterArmature/glass.002',
      glassB: 'TeleporterArmature/glass.003',
      pipes: 'BezierCurve.001'
    }
  },
  {
    src: 'assets/wolf/wolf (1).gltf',
    name: 'Wolf',
    scale: 0.008,
    // Specific paths from inspect-gltf.js
    paths: {
      all: '',
      body: 'Armature_0/Wolf1_Material__wolf_col_tga_0',
      fur: 'Armature_0/Wolf2_fur__fella3_jpg_001_0',
      claws: 'Armature_0/Wolf3_claws_0',
      eyes: 'Armature_0/Wolf3_eyes_0',
      teeth: 'Armature_0/Wolf3_teeth'
    }
  },
  {
    src: 'assets/shark/shark.glb',
    name: 'Shark',
    scale: 0.5,
    // Specific paths from inspect-gltf.js
    paths: {
      all: '',
      mesh: 'Scene_root/shark_skeleton/Sphere/Sphere.001'
    }
  }
]

// Helper to get random color
function randomColor(alpha = 1): Color4 {
  return Color4.create(Math.random(), Math.random(), Math.random(), alpha)
}

function randomGodotColor(): Color4 {
  return GODOT_ALL_COLORS[GODOT_ALL_COLORS_KEYS[Math.floor(Math.random() * GODOT_ALL_COLORS_KEYS.length)]]
}

// Model-specific modifier presets
type ModelPreset = {
  name: string
  apply: (entity: Entity, modelType: string) => void
}

const MODEL_SPECIFIC_PRESETS: ModelPreset[] = [
  {
    name: 'Original',
    apply: (entity: Entity) => {
      GltfNodeModifiers.deleteFrom(entity)
    }
  },
  {
    name: 'Global Random',
    apply: (entity: Entity) => {
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [{
          path: '',
          material: {
            material: {
              $case: 'pbr' as const,
              pbr: { albedoColor: randomColor() }
            }
          }
        }]
      })
    }
  },
  {
    name: 'Global Emissive',
    apply: (entity: Entity) => {
      const color = randomGodotColor()
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [{
          path: '',
          material: {
            material: {
              $case: 'pbr' as const,
              pbr: {
                emissiveColor: color,
                emissiveIntensity: 30 + Math.random() * 50
              }
            }
          }
        }]
      })
    }
  },
  {
    name: 'Global Unlit',
    apply: (entity: Entity) => {
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [{
          path: '',
          material: {
            material: {
              $case: 'unlit' as const,
              unlit: { diffuseColor: randomColor() }
            }
          }
        }]
      })
    }
  },
  {
    name: 'Global Metallic',
    apply: (entity: Entity) => {
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [{
          path: '',
          material: {
            material: {
              $case: 'pbr' as const,
              pbr: {
                albedoColor: randomColor(),
                metallic: 0.8 + Math.random() * 0.2,
                roughness: Math.random() * 0.3
              }
            }
          }
        }]
      })
    }
  },
  {
    name: 'Global Ghost',
    apply: (entity: Entity) => {
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [{
          path: '',
          material: {
            material: {
              $case: 'pbr' as const,
              pbr: { albedoColor: randomColor(0.3 + Math.random() * 0.3) }
            }
          }
        }]
      })
    }
  },
  {
    name: 'No Shadows',
    apply: (entity: Entity) => {
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [{ path: '', castShadows: false }]
      })
    }
  },
  // --- TELEPORTER SPECIFIC ---
  {
    name: 'Tele: Frames',
    apply: (entity: Entity, modelType: string) => {
      if (modelType !== 'Teleporter') {
        // Fallback for other models
        GltfNodeModifiers.createOrReplace(entity, {
          modifiers: [{ path: '', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor() } } } }]
        })
        return
      }
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          {
            path: 'TeleporterArmature/FrameA',
            material: { material: { $case: 'pbr' as const, pbr: { albedoColor: GODOT_ALL_COLORS.RED, emissiveColor: GODOT_ALL_COLORS.RED, emissiveIntensity: 20 } } }
          },
          {
            path: 'TeleporterArmature/FrameB',
            material: { material: { $case: 'pbr' as const, pbr: { albedoColor: GODOT_ALL_COLORS.BLUE, emissiveColor: GODOT_ALL_COLORS.BLUE, emissiveIntensity: 20 } } }
          }
        ]
      })
    }
  },
  {
    name: 'Tele: Glass Neon',
    apply: (entity: Entity, modelType: string) => {
      if (modelType !== 'Teleporter') {
        GltfNodeModifiers.createOrReplace(entity, {
          modifiers: [{ path: '', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor(0.5) } } } }]
        })
        return
      }
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          {
            path: 'TeleporterArmature/glass.002',
            material: { material: { $case: 'pbr' as const, pbr: { albedoColor: Color4.create(0, 1, 0.5, 0.6), emissiveColor: GODOT_ALL_COLORS.SPRINGGREEN, emissiveIntensity: 50 } } }
          },
          {
            path: 'TeleporterArmature/glass.003',
            material: { material: { $case: 'pbr' as const, pbr: { albedoColor: Color4.create(1, 0, 0.5, 0.6), emissiveColor: GODOT_ALL_COLORS.HOTPINK, emissiveIntensity: 50 } } }
          }
        ]
      })
    }
  },
  {
    name: 'Tele: All Parts',
    apply: (entity: Entity, modelType: string) => {
      if (modelType !== 'Teleporter') {
        GltfNodeModifiers.createOrReplace(entity, {
          modifiers: [{ path: '', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor() } } } }]
        })
        return
      }
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          { path: 'TeleporterStructure', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor() } } } },
          { path: 'ButtonBase.003', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor(), emissiveColor: randomGodotColor(), emissiveIntensity: 30 } } } },
          { path: 'TeleporterArmature/FrameA', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor() } } } },
          { path: 'TeleporterArmature/FrameB', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor() } } } },
          { path: 'TeleporterArmature/glass.002', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor(0.5) } } } },
          { path: 'TeleporterArmature/glass.003', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor(0.5) } } } },
          { path: 'BezierCurve.001', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor() } } } }
        ]
      })
    }
  },
  // --- WOLF SPECIFIC ---
  {
    name: 'Wolf: Eyes Glow',
    apply: (entity: Entity, modelType: string) => {
      if (modelType !== 'Wolf') {
        GltfNodeModifiers.createOrReplace(entity, {
          modifiers: [{ path: '', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor() } } } }]
        })
        return
      }
      const eyeColor = [GODOT_ALL_COLORS.RED, GODOT_ALL_COLORS.YELLOW, GODOT_ALL_COLORS.CYAN, GODOT_ALL_COLORS.LIME][Math.floor(Math.random() * 4)]
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          {
            path: 'Armature_0/Wolf3_eyes_0',
            material: { material: { $case: 'pbr' as const, pbr: { albedoColor: eyeColor, emissiveColor: eyeColor, emissiveIntensity: 80 } } }
          }
        ]
      })
    }
  },
  {
    name: 'Wolf: Body+Fur',
    apply: (entity: Entity, modelType: string) => {
      if (modelType !== 'Wolf') {
        GltfNodeModifiers.createOrReplace(entity, {
          modifiers: [{ path: '', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor() } } } }]
        })
        return
      }
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          { path: 'Armature_0/Wolf1_Material__wolf_col_tga_0', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor() } } } },
          { path: 'Armature_0/Wolf2_fur__fella3_jpg_001_0', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor(0.8) } } } }
        ]
      })
    }
  },
  {
    name: 'Wolf: All Parts',
    apply: (entity: Entity, modelType: string) => {
      if (modelType !== 'Wolf') {
        GltfNodeModifiers.createOrReplace(entity, {
          modifiers: [{ path: '', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor() } } } }]
        })
        return
      }
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          { path: 'Armature_0/Wolf1_Material__wolf_col_tga_0', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor() } } } },
          { path: 'Armature_0/Wolf2_fur__fella3_jpg_001_0', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor(0.7) } } } },
          { path: 'Armature_0/Wolf3_claws_0', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor(), metallic: 0.9 } } } },
          { path: 'Armature_0/Wolf3_eyes_0', material: { material: { $case: 'pbr' as const, pbr: { emissiveColor: randomGodotColor(), emissiveIntensity: 50 } } } },
          { path: 'Armature_0/Wolf3_teeth', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor() } } } }
        ]
      })
    }
  },
  {
    name: 'Wolf: Demon',
    apply: (entity: Entity, modelType: string) => {
      if (modelType !== 'Wolf') {
        GltfNodeModifiers.createOrReplace(entity, {
          modifiers: [{ path: '', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: GODOT_ALL_COLORS.DARKRED } } } }]
        })
        return
      }
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          { path: 'Armature_0/Wolf1_Material__wolf_col_tga_0', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: GODOT_ALL_COLORS.BLACK } } } },
          { path: 'Armature_0/Wolf2_fur__fella3_jpg_001_0', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: Color4.create(0.1, 0, 0, 0.9) } } } },
          { path: 'Armature_0/Wolf3_claws_0', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: GODOT_ALL_COLORS.DARKRED, metallic: 1 } } } },
          { path: 'Armature_0/Wolf3_eyes_0', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: GODOT_ALL_COLORS.RED, emissiveColor: GODOT_ALL_COLORS.RED, emissiveIntensity: 100 } } } },
          { path: 'Armature_0/Wolf3_teeth', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: GODOT_ALL_COLORS.CRIMSON } } } }
        ]
      })
    }
  },
  // --- SHARK SPECIFIC ---
  {
    name: 'Shark: Mesh',
    apply: (entity: Entity, modelType: string) => {
      if (modelType !== 'Shark') {
        GltfNodeModifiers.createOrReplace(entity, {
          modifiers: [{ path: '', material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor() } } } }]
        })
        return
      }
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          {
            path: 'Scene_root/shark_skeleton/Sphere/Sphere.001',
            material: { material: { $case: 'pbr' as const, pbr: { albedoColor: randomColor() } } }
          }
        ]
      })
    }
  },
  {
    name: 'Shark: Neon',
    apply: (entity: Entity, modelType: string) => {
      if (modelType !== 'Shark') {
        GltfNodeModifiers.createOrReplace(entity, {
          modifiers: [{ path: '', material: { material: { $case: 'pbr' as const, pbr: { emissiveColor: randomGodotColor(), emissiveIntensity: 50 } } } }]
        })
        return
      }
      const neonColor = randomGodotColor()
      GltfNodeModifiers.createOrReplace(entity, {
        modifiers: [
          {
            path: 'Scene_root/shark_skeleton/Sphere/Sphere.001',
            material: { material: { $case: 'pbr' as const, pbr: { albedoColor: neonColor, emissiveColor: neonColor, emissiveIntensity: 60 } } }
          }
        ]
      })
    }
  }
]

function createMultiModelSection(): void {
  // Section title - right side of scene
  const sectionTitle = sceneEntities.addEntity()
  Transform.create(sectionTitle, {
    position: Vector3.create(34, 5, 36)
  })
  TextShape.create(sectionTitle, {
    text: 'Multi-Model Test\n16 presets per model\nClick to cycle',
    fontSize: 2,
    textColor: Color4.Yellow()
  })

  // Create rows of each model type
  // Right half of scene: X from 24 to 44, Z from 20 to 35
  const startZ = 34
  const rowSpacing = 5
  const colSpacing = 4
  const instancesPerModel = 4

  MODELS.forEach((model, modelIndex) => {
    const rowZ = startZ - modelIndex * rowSpacing // Go down from top

    // Row label
    const rowLabel = sceneEntities.addEntity()
    Transform.create(rowLabel, {
      position: Vector3.create(25, 3, rowZ)
    })
    TextShape.create(rowLabel, {
      text: model.name,
      fontSize: 2,
      textColor: GODOT_ALL_COLORS.LIGHTYELLOW
    })

    // Create instances: X from 28 to 28 + 3*4 = 40
    for (let i = 0; i < instancesPerModel; i++) {
      const x = 28 + i * colSpacing
      const modifierIndex = i % MODEL_SPECIFIC_PRESETS.length

      const instance = createMultiModelInstance(
        x, rowZ,
        model,
        modifierIndex,
        multiModelInstances.length
      )
      multiModelInstances.push(instance)
    }
  })

  // Control panel for multi-model section
  createMultiModelControls()
}

function createMultiModelInstance(
  x: number,
  z: number,
  model: { src: string; name: string; scale: number },
  initialModifierIndex: number,
  globalIndex: number
): MultiModelInstance {
  const entity = sceneEntities.addEntity()
  Transform.create(entity, {
    position: Vector3.create(x, 1, z),
    scale: Vector3.create(model.scale, model.scale, model.scale)
  })
  GltfContainer.create(entity, {
    src: model.src,
    visibleMeshesCollisionMask: ColliderLayer.CL_POINTER
  })

  // Apply initial modifier with model type
  MODEL_SPECIFIC_PRESETS[initialModifierIndex].apply(entity, model.name)

  // Label
  const labelEntity = sceneEntities.addEntity()
  Transform.create(labelEntity, {
    position: Vector3.create(x, 3.5, z)
  })
  TextShape.create(labelEntity, {
    text: MODEL_SPECIFIC_PRESETS[initialModifierIndex].name,
    fontSize: 1.2,
    textColor: Color4.White()
  })

  // Click to cycle modifier
  pointerEventsSystem.onPointerDown(
    {
      entity,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: `Cycle ${model.name} Modifier`
      }
    },
    () => {
      cycleMultiModelModifier(globalIndex)
    }
  )

  return {
    entity,
    modelType: model.name,
    modifierIndex: initialModifierIndex,
    labelEntity
  }
}

function cycleMultiModelModifier(index: number): void {
  const instance = multiModelInstances[index]
  instance.modifierIndex = (instance.modifierIndex + 1) % MODEL_SPECIFIC_PRESETS.length
  MODEL_SPECIFIC_PRESETS[instance.modifierIndex].apply(instance.entity, instance.modelType)

  TextShape.createOrReplace(instance.labelEntity, {
    text: MODEL_SPECIFIC_PRESETS[instance.modifierIndex].name,
    fontSize: 1.2,
    textColor: Color4.White()
  })
}

function createMultiModelControls(): void {
  // Controls positioned below the multi-model rows
  // Z = 18, X from 26 to 42
  const controlZ = 18
  const controlStartX = 26

  createControlCube(
    Vector3.create(controlStartX, 1, controlZ),
    'Random\nAll',
    GODOT_ALL_COLORS.PURPLE,
    () => {
      multiModelInstances.forEach((instance) => {
        instance.modifierIndex = Math.floor(Math.random() * MODEL_SPECIFIC_PRESETS.length)
        MODEL_SPECIFIC_PRESETS[instance.modifierIndex].apply(instance.entity, instance.modelType)
        TextShape.createOrReplace(instance.labelEntity, {
          text: MODEL_SPECIFIC_PRESETS[instance.modifierIndex].name,
          fontSize: 1.2,
          textColor: Color4.White()
        })
      })
    }
  )

  createControlCube(
    Vector3.create(controlStartX + 3, 1, controlZ),
    'Emissive\nAll',
    GODOT_ALL_COLORS.GREEN,
    () => {
      const emissiveIndex = 2
      multiModelInstances.forEach((instance) => {
        instance.modifierIndex = emissiveIndex
        MODEL_SPECIFIC_PRESETS[emissiveIndex].apply(instance.entity, instance.modelType)
        TextShape.createOrReplace(instance.labelEntity, {
          text: MODEL_SPECIFIC_PRESETS[emissiveIndex].name,
          fontSize: 1.2,
          textColor: Color4.White()
        })
      })
    }
  )

  createControlCube(
    Vector3.create(controlStartX + 6, 1, controlZ),
    'Model\nSpecific',
    GODOT_ALL_COLORS.CYAN,
    () => {
      multiModelInstances.forEach((instance) => {
        let presetIndex = 0
        if (instance.modelType === 'Teleporter') {
          presetIndex = 9
        } else if (instance.modelType === 'Wolf') {
          presetIndex = 12
        } else if (instance.modelType === 'Shark') {
          presetIndex = 15
        }
        instance.modifierIndex = presetIndex
        MODEL_SPECIFIC_PRESETS[presetIndex].apply(instance.entity, instance.modelType)
        TextShape.createOrReplace(instance.labelEntity, {
          text: MODEL_SPECIFIC_PRESETS[presetIndex].name,
          fontSize: 1.2,
          textColor: Color4.White()
        })
      })
    }
  )

  createControlCube(
    Vector3.create(controlStartX + 9, 1, controlZ),
    'Clear\nAll',
    GODOT_ALL_COLORS.GRAY,
    () => {
      multiModelInstances.forEach((instance) => {
        instance.modifierIndex = 0
        MODEL_SPECIFIC_PRESETS[0].apply(instance.entity, instance.modelType)
        TextShape.createOrReplace(instance.labelEntity, {
          text: MODEL_SPECIFIC_PRESETS[0].name,
          fontSize: 1.2,
          textColor: Color4.White()
        })
      })
    }
  )

  createControlCube(
    Vector3.create(controlStartX + 12, 1, controlZ),
    'Rapid\nFire',
    GODOT_ALL_COLORS.ORANGERED,
    () => {
      rapidFireMultiModel()
    }
  )

  createControlCube(
    Vector3.create(controlStartX + 15, 1, controlZ),
    'Demon\nNeon',
    GODOT_ALL_COLORS.DARKRED,
    () => {
      multiModelInstances.forEach((instance) => {
        let presetIndex = 0
        if (instance.modelType === 'Teleporter') {
          presetIndex = 8
        } else if (instance.modelType === 'Wolf') {
          presetIndex = 13
        } else if (instance.modelType === 'Shark') {
          presetIndex = 15
        }
        instance.modifierIndex = presetIndex
        MODEL_SPECIFIC_PRESETS[presetIndex].apply(instance.entity, instance.modelType)
        TextShape.createOrReplace(instance.labelEntity, {
          text: MODEL_SPECIFIC_PRESETS[presetIndex].name,
          fontSize: 1.2,
          textColor: Color4.White()
        })
      })
    }
  )
}

// Rapid fire for multi-model section
let multiModelRapidFireCount = 0
let multiModelRapidFireActive = false
const MULTI_MODEL_RAPID_FIRE_MAX = 40

function multiModelRapidFireSystem(): void {
  if (!multiModelRapidFireActive) return

  if (multiModelRapidFireCount >= MULTI_MODEL_RAPID_FIRE_MAX) {
    multiModelRapidFireActive = false
    multiModelRapidFireCount = 0
    return
  }

  multiModelInstances.forEach((instance) => {
    instance.modifierIndex = Math.floor(Math.random() * MODEL_SPECIFIC_PRESETS.length)
    MODEL_SPECIFIC_PRESETS[instance.modifierIndex].apply(instance.entity, instance.modelType)
    TextShape.createOrReplace(instance.labelEntity, {
      text: MODEL_SPECIFIC_PRESETS[instance.modifierIndex].name,
      fontSize: 1.2,
      textColor: Color4.White()
    })
  })

  multiModelRapidFireCount++
}

engine.addSystem(multiModelRapidFireSystem)

function rapidFireMultiModel(): void {
  multiModelRapidFireCount = 0
  multiModelRapidFireActive = true
}
