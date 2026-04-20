import {
  ColliderLayer,
  engine,
  inputSystem,
  InputAction,
  MainCamera,
  Material,
  MeshCollider,
  MeshRenderer,
  PointerEvents,
  PointerEventType,
  pointerEventsSystem,
  TextShape,
  Transform,
  VirtualCamera,
  type Entity
} from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { sceneSystems } from '../../utils/system'

type Scenario = {
  name: string
  vcamEntity: Entity | null
  setup: () => void
}

let currentScenario = -1
const scenarios: Scenario[] = []
let statusEntity: Entity | null = null

function createLabel(
  position: Vector3,
  text: string,
  fontSize: number = 2,
  color: Color4 = Color4.White(),
  parent?: Entity
): Entity {
  const entity = engine.addEntity()
  const transform: { position: Vector3; parent?: Entity } = { position }
  if (parent !== undefined) transform.parent = parent
  Transform.create(entity, transform)
  TextShape.create(entity, { text, fontSize, textColor: color })
  return entity
}

function createSphereMarker(position: Vector3, color: Color4, size: number = 0.3, parent?: Entity): Entity {
  const entity = engine.addEntity()
  const transform: { position: Vector3; scale: Vector3; parent?: Entity } = {
    position,
    scale: Vector3.create(size, size, size)
  }
  if (parent !== undefined) transform.parent = parent
  Transform.create(entity, transform)
  MeshRenderer.setSphere(entity)
  Material.setPbrMaterial(entity, {
    albedoColor: color,
    emissiveColor: color,
    emissiveIntensity: 2
  })
  return entity
}

function createButton(position: Vector3, hoverText: string, color: Color4, onClick: () => void): Entity {
  const entity = engine.addEntity()
  Transform.create(entity, { position })
  MeshRenderer.setBox(entity)
  MeshCollider.setBox(entity, ColliderLayer.CL_POINTER)
  Material.setPbrMaterial(entity, { albedoColor: color })
  PointerEvents.create(entity, {
    pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          button: InputAction.IA_POINTER,
          hoverText,
          maxDistance: 20,
          showFeedback: true
        }
      },
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          button: InputAction.IA_PRIMARY,
          hoverText,
          maxDistance: 20,
          showFeedback: true
        }
      }
    ]
  })
  pointerEventsSystem.onPointerDown({ entity, opts: { button: InputAction.IA_POINTER, hoverText } }, onClick)
  pointerEventsSystem.onPointerDown({ entity, opts: { button: InputAction.IA_PRIMARY, hoverText } }, onClick)
  return entity
}

function setActiveVirtualCamera(vcam: Entity | undefined): void {
  if (!MainCamera.has(engine.CameraEntity)) return
  const mainCam = MainCamera.getMutable(engine.CameraEntity)
  mainCam.virtualCameraEntity = vcam
}

function updateStatusLabel(): void {
  if (statusEntity === null) return
  const label =
    currentScenario >= 0 && currentScenario < scenarios.length
      ? `[${currentScenario + 1}] ${scenarios[currentScenario].name}`
      : 'Player Camera'
  TextShape.getMutable(statusEntity).text = `Active: ${label}`
}

// Scenario #1 (vcam-t1): Reparent 2s — vcam child cycles through 5 parent points
function scenario1Reparent(): Scenario {
  const positions = [
    Vector3.create(4, 1, 8),
    Vector3.create(12, 2, 8),
    Vector3.create(12, 1, 14),
    Vector3.create(4, 3, 14),
    Vector3.create(8, 1.5, 11)
  ]
  const colors = [Color4.Red(), Color4.Green(), Color4.Blue(), Color4.Yellow(), Color4.create(1, 0, 1, 1)]
  const parents: Entity[] = []
  for (let i = 0; i < positions.length; i++) {
    parents.push(createSphereMarker(positions[i], colors[i], 0.5))
    createLabel(Vector3.add(positions[i], Vector3.Up()), `P${i + 1}`)
  }
  const vcam = engine.addEntity()
  Transform.create(vcam, {
    position: Vector3.create(0, 2, -3),
    rotation: Quaternion.fromEulerDegrees(30, 0, 0),
    parent: parents[0]
  })
  VirtualCamera.create(vcam, {})

  let idx = 0
  let t = 0
  sceneSystems.addSystem(
    (dt) => {
      if (currentScenario !== 0) return
      t += dt
      if (t >= 2) {
        t = 0
        idx = (idx + 1) % parents.length
        Transform.getMutable(vcam).parent = parents[idx]
        console.log(`[T1] Reparent -> P${idx + 1}`)
      }
    },
    undefined,
    'vcam-t1'
  )

  return {
    name: 'Reparent 2s',
    vcamEntity: vcam,
    setup: () => {
      t = 0
      idx = 0
      Transform.getMutable(vcam).parent = parents[0]
    }
  }
}

// Scenario #2 (vcam-t2): Orbit — vcam orbits a central marker
function scenario2Orbit(): Scenario {
  const center = Vector3.create(8, 0, 11)
  const radius = 4
  const height = 3
  createSphereMarker(center, Color4.White(), 0.4)

  const vcam = engine.addEntity()
  Transform.create(vcam, {
    position: Vector3.create(center.x + radius, height, center.z)
  })
  VirtualCamera.create(vcam, {})

  let angle = 0
  sceneSystems.addSystem(
    (dt) => {
      if (currentScenario !== 1) return
      angle += dt * 0.5
      const x = center.x + Math.cos(angle) * radius
      const z = center.z + Math.sin(angle) * radius
      const t = Transform.getMutable(vcam)
      t.position = Vector3.create(x, height, z)
      const dir = Vector3.subtract(center, Vector3.create(x, height, z))
      const yaw = Math.atan2(dir.x, dir.z) * (180 / Math.PI)
      t.rotation = Quaternion.fromEulerDegrees(25, yaw, 0)
    },
    undefined,
    'vcam-t2'
  )

  return {
    name: 'Orbit',
    vcamEntity: vcam,
    setup: () => {
      angle = 0
    }
  }
}

// Scenario #3 (vcam-t3): Look-at — fixed vcam with lookAtEntity on a moving target
function scenario3LookAt(): Scenario {
  const vcam = engine.addEntity()
  Transform.create(vcam, { position: Vector3.create(8, 5, 6) })

  const target = engine.addEntity()
  Transform.create(target, { position: Vector3.create(8, 1, 11) })
  MeshRenderer.setSphere(target)
  Material.setPbrMaterial(target, {
    albedoColor: Color4.create(1, 0.5, 0, 1),
    emissiveColor: Color4.create(1, 0.5, 0, 1),
    emissiveIntensity: 3
  })
  VirtualCamera.create(vcam, { lookAtEntity: target })

  let t = 0
  sceneSystems.addSystem(
    (dt) => {
      if (currentScenario !== 2) return
      t += dt * 0.8
      Transform.getMutable(target).position = Vector3.create(
        8 + Math.sin(t) * 4,
        1 + Math.abs(Math.sin(t * 1.5)) * 2,
        11 + Math.sin(t * 2) * 3
      )
    },
    undefined,
    'vcam-t3'
  )

  return {
    name: 'Look-at',
    vcamEntity: vcam,
    setup: () => {
      t = 0
    }
  }
}

// Scenario #4 (vcam-t4): Toggle 0.5s — toggles MainCamera.virtualCameraEntity
function scenario4Toggle(): Scenario {
  const vcam = engine.addEntity()
  Transform.create(vcam, {
    position: Vector3.create(8, 6, 6),
    rotation: Quaternion.fromEulerDegrees(40, 0, 0)
  })
  VirtualCamera.create(vcam, {})

  let t = 0
  let active = false
  sceneSystems.addSystem(
    (dt) => {
      if (currentScenario !== 3) return
      t += dt
      if (t >= 0.5) {
        t = 0
        active = !active
        setActiveVirtualCamera(active ? vcam : undefined)
      }
    },
    undefined,
    'vcam-t4'
  )

  return {
    name: 'Toggle 0.5s',
    vcamEntity: vcam,
    setup: () => {
      t = 0
      active = false
    }
  }
}

// Scenario #5 (vcam-t5): Remove 3s — removes the vcam entity after 3s
function scenario5Remove(): Scenario {
  let vcam: Entity | null = null
  let t = 0
  let removed = false

  function spawn(): Entity {
    const e = engine.addEntity()
    Transform.create(e, {
      position: Vector3.create(8, 4, 8),
      rotation: Quaternion.fromEulerDegrees(20, 0, 0)
    })
    VirtualCamera.create(e, {})
    return e
  }

  vcam = spawn()
  sceneSystems.addSystem(
    (dt) => {
      if (currentScenario !== 4 || removed) return
      t += dt
      if (t >= 3 && vcam !== null) {
        console.log('[T5] Removing entity!')
        engine.removeEntity(vcam)
        removed = true
      }
    },
    undefined,
    'vcam-t5'
  )

  return {
    name: 'Remove 3s',
    vcamEntity: vcam,
    setup: () => {
      t = 0
      removed = false
      if (vcam !== null && !Transform.has(vcam)) {
        vcam = spawn()
        scenarios[4].vcamEntity = vcam
      }
    }
  }
}

// Scenario #6 (vcam-t6): Reparent+LookAt — cycles parent while tracking a moving sphere
function scenario6ReparentLookAt(): Scenario {
  const positions = [
    Vector3.create(3, 2, 7),
    Vector3.create(13, 2, 7),
    Vector3.create(13, 2, 14),
    Vector3.create(3, 2, 14)
  ]
  const colors = [Color4.Red(), Color4.Green(), Color4.Blue(), Color4.Yellow()]
  const parents: Entity[] = []
  for (let i = 0; i < positions.length; i++) {
    parents.push(createSphereMarker(positions[i], colors[i], 0.5))
  }

  const target = engine.addEntity()
  Transform.create(target, { position: Vector3.create(8, 1, 10) })
  MeshRenderer.setSphere(target)
  Material.setPbrMaterial(target, {
    albedoColor: Color4.create(0, 1, 1, 1),
    emissiveColor: Color4.create(0, 1, 1, 1),
    emissiveIntensity: 3
  })

  const vcam = engine.addEntity()
  Transform.create(vcam, {
    position: Vector3.create(0, 3, 0),
    parent: parents[0]
  })
  VirtualCamera.create(vcam, { lookAtEntity: target })

  let idx = 0
  let reparentT = 0
  let targetT = 0
  sceneSystems.addSystem(
    (dt) => {
      if (currentScenario !== 5) return
      reparentT += dt
      if (reparentT >= 2) {
        reparentT = 0
        idx = (idx + 1) % parents.length
        Transform.getMutable(vcam).parent = parents[idx]
        console.log(`[T6] Reparent+LookAt -> ${idx + 1}`)
      }
      targetT += dt * 1.2
      Transform.getMutable(target).position = Vector3.create(
        8 + Math.cos(targetT) * 3,
        1 + Math.abs(Math.sin(targetT)) * 2,
        10 + Math.sin(targetT) * 3
      )
    },
    undefined,
    'vcam-t6'
  )

  return {
    name: 'Reparent+LookAt',
    vcamEntity: vcam,
    setup: () => {
      idx = 0
      reparentT = 0
      targetT = 0
      Transform.getMutable(vcam).parent = parents[0]
    }
  }
}

// Scenario #7 (no system): Transition 3s — vcam with timed defaultTransition
function scenario7Transition(): Scenario {
  const vcam = engine.addEntity()
  Transform.create(vcam, {
    position: Vector3.create(2, 5, 14),
    rotation: Quaternion.fromEulerDegrees(45, 45, 0)
  })
  VirtualCamera.create(vcam, {
    defaultTransition: { transitionMode: { $case: 'time', time: 3 } }
  })
  return { name: 'Transition 3s', vcamEntity: vcam, setup: () => {} }
}

// Scenario #8 (vcam-t8): Multi-VCam — switches activeVCam between 3 cameras every 2s
function scenario8MultiVCam(): Scenario {
  const presets = [
    {
      pos: Vector3.create(2, 3, 8),
      rot: Quaternion.fromEulerDegrees(15, 90, 0),
      color: Color4.Red()
    },
    {
      pos: Vector3.create(14, 6, 14),
      rot: Quaternion.fromEulerDegrees(35, -135, 0),
      color: Color4.Green()
    },
    {
      pos: Vector3.create(8, 2, 14),
      rot: Quaternion.fromEulerDegrees(0, 0, 0),
      color: Color4.Blue()
    }
  ]
  const vcams: Entity[] = []
  for (const p of presets) {
    const e = engine.addEntity()
    Transform.create(e, { position: p.pos, rotation: p.rot })
    VirtualCamera.create(e, {})
    createSphereMarker(p.pos, p.color, 0.4)
    vcams.push(e)
  }

  let idx = 0
  let t = 0
  sceneSystems.addSystem(
    (dt) => {
      if (currentScenario !== 7) return
      t += dt
      if (t >= 2) {
        t = 0
        idx = (idx + 1) % vcams.length
        setActiveVirtualCamera(vcams[idx])
        console.log(`[T8] Switch to VCam ${idx + 1}`)
      }
    },
    undefined,
    'vcam-t8'
  )

  return {
    name: 'Multi-VCam',
    vcamEntity: vcams[0],
    setup: () => {
      idx = 0
      t = 0
      setActiveVirtualCamera(vcams[0])
    }
  }
}

// Scenario #9 (no system): Player child — vcam parented to PlayerEntity
function scenario9PlayerChild(): Scenario {
  const vcam = engine.addEntity()
  Transform.create(vcam, {
    position: Vector3.create(0, 10, -8),
    rotation: Quaternion.fromEulerDegrees(50, 0, 0),
    parent: engine.PlayerEntity
  })
  VirtualCamera.create(vcam, {})
  return { name: 'Player child', vcamEntity: vcam, setup: () => {} }
}

// Scenario #10 (vcam-t10): Scale parent — parent box scales while vcam is child
function scenario10ScaleParent(): Scenario {
  const parent = engine.addEntity()
  Transform.create(parent, { position: Vector3.create(8, 1, 10) })
  MeshRenderer.setBox(parent)
  Material.setPbrMaterial(parent, {
    albedoColor: Color4.create(0.8, 0.4, 0, 1)
  })

  const vcam = engine.addEntity()
  Transform.create(vcam, {
    position: Vector3.create(0, 4, -3),
    rotation: Quaternion.fromEulerDegrees(35, 0, 0),
    parent
  })
  VirtualCamera.create(vcam, {})

  let t = 0
  sceneSystems.addSystem(
    (dt) => {
      if (currentScenario !== 9) return
      t += dt
      const s = 1 + Math.sin(t) * 0.5
      Transform.getMutable(parent).scale = Vector3.create(s, s, s)
    },
    undefined,
    'vcam-t10'
  )

  return {
    name: 'Scale parent',
    vcamEntity: vcam,
    setup: () => {
      t = 0
      Transform.getMutable(parent).scale = Vector3.One()
    }
  }
}

// Scenario #11 (vcam-t11): Deep nest — 4-level chain with animated root, vcam is leaf
function scenario11DeepNest(): Scenario {
  const root = engine.addEntity()
  Transform.create(root, { position: Vector3.create(8, 0, 10) })
  MeshRenderer.setBox(root)
  Material.setPbrMaterial(root, { albedoColor: Color4.Red() })

  const child1 = engine.addEntity()
  Transform.create(child1, { position: Vector3.create(0, 1, 0), parent: root })
  MeshRenderer.setSphere(child1)
  Material.setPbrMaterial(child1, { albedoColor: Color4.Green() })

  const child2 = engine.addEntity()
  Transform.create(child2, {
    position: Vector3.create(1, 1, 0),
    parent: child1
  })
  MeshRenderer.setSphere(child2)
  Material.setPbrMaterial(child2, { albedoColor: Color4.Blue() })

  const child3 = engine.addEntity()
  Transform.create(child3, {
    position: Vector3.create(0, 1, 1),
    parent: child2
  })
  MeshRenderer.setSphere(child3)
  Material.setPbrMaterial(child3, { albedoColor: Color4.Yellow() })

  const vcam = engine.addEntity()
  Transform.create(vcam, {
    position: Vector3.create(0, 2, -2),
    rotation: Quaternion.fromEulerDegrees(30, 0, 0),
    parent: child3
  })
  VirtualCamera.create(vcam, {})

  let t = 0
  sceneSystems.addSystem(
    (dt) => {
      if (currentScenario !== 10) return
      t += dt * 0.4
      Transform.getMutable(root).position = Vector3.create(8 + Math.sin(t) * 3, 0, 10 + Math.sin(t * 2) * 2)
      Transform.getMutable(child1).rotation = Quaternion.fromEulerDegrees(0, t * 30, 0)
    },
    undefined,
    'vcam-t11'
  )

  return {
    name: 'Deep nest',
    vcamEntity: vcam,
    setup: () => {
      t = 0
      Transform.getMutable(root).position = Vector3.create(8, 0, 10)
      Transform.getMutable(child1).rotation = Quaternion.Identity()
    }
  }
}

// Scenario #12 (vcam-t12): Zero dist — vcam pinned to CameraEntity each frame
function scenario12ZeroDist(): Scenario {
  const vcam = engine.addEntity()
  Transform.create(vcam, { position: Vector3.create(8, 1.6, 8) })
  VirtualCamera.create(vcam, {})

  sceneSystems.addSystem(
    (_dt) => {
      if (currentScenario !== 11) return
      const cam = Transform.getOrNull(engine.CameraEntity)
      if (cam !== null) {
        const mut = Transform.getMutable(vcam)
        mut.position = { ...cam.position }
        mut.rotation = { ...cam.rotation }
      }
    },
    undefined,
    'vcam-t12'
  )

  return {
    name: 'Zero dist',
    vcamEntity: vcam,
    setup: () => {
      const cam = Transform.getOrNull(engine.CameraEntity)
      if (cam !== null) {
        const mut = Transform.getMutable(vcam)
        mut.position = { ...cam.position }
        mut.rotation = { ...cam.rotation }
      }
    }
  }
}

function activateScenario(index: number): void {
  currentScenario = index
  if (index >= 0 && index < scenarios.length) {
    const s = scenarios[index]
    s.setup()
    // scenario index 7 manages MainCamera itself (Multi-VCam)
    if (index !== 7) setActiveVirtualCamera(s.vcamEntity ?? undefined)
    console.log(`[VCamTest] Activated ${index + 1}: ${s.name}`)
  } else {
    setActiveVirtualCamera(undefined)
    console.log('[VCamTest] Reset to player camera')
  }
  updateStatusLabel()
}

export function main(): void {
  console.log('Virtual Camera Test scene loaded')

  scenarios.push(scenario1Reparent())
  scenarios.push(scenario2Orbit())
  scenarios.push(scenario3LookAt())
  scenarios.push(scenario4Toggle())
  scenarios.push(scenario5Remove())
  scenarios.push(scenario6ReparentLookAt())
  scenarios.push(scenario7Transition())
  scenarios.push(scenario8MultiVCam())
  scenarios.push(scenario9PlayerChild())
  scenarios.push(scenario10ScaleParent())
  scenarios.push(scenario11DeepNest())
  scenarios.push(scenario12ZeroDist())

  const rowAZ = 2
  const rowBZ = 4.5
  const baseX = 1.5
  const stepX = 2.2
  const palette = [
    Color4.Red(),
    Color4.Green(),
    Color4.Blue(),
    Color4.Yellow(),
    Color4.create(1, 0, 1, 1),
    Color4.create(0, 1, 1, 1)
  ]

  for (let i = 0; i < scenarios.length; i++) {
    const row = i < 6 ? 0 : 1
    const col = i < 6 ? i : i - 6
    const z = row === 0 ? rowAZ : rowBZ
    const x = baseX + col * stepX
    const scenario = scenarios[i]
    const color = palette[i % palette.length]
    createButton(Vector3.create(x, 0.5, z), `${i + 1}: ${scenario.name}`, color, () => activateScenario(i))
    createLabel(Vector3.create(x, 1.6, z), `${i + 1}\n${scenario.name}`, 1.5, color)
  }

  createButton(
    Vector3.create(baseX + 6 * stepX, 0.5, rowBZ),
    'RESET to Player Camera',
    Color4.create(0.5, 0.5, 0.5, 1),
    () => activateScenario(-1)
  )
  createLabel(Vector3.create(baseX + 6 * stepX, 1.6, rowBZ), 'RESET', 2, Color4.create(0.8, 0.8, 0.8, 1))

  sceneSystems.addSystem(
    () => {
      if (inputSystem.isTriggered(InputAction.IA_SECONDARY, PointerEventType.PET_DOWN)) {
        activateScenario(-1)
      }
    },
    undefined,
    'vcam-global-reset'
  )

  statusEntity = createLabel(Vector3.create(8, 3.5, 0.5), 'Active: Player Camera', 3, Color4.Yellow())
}
