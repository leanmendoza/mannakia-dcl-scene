import {
  Transform,
  MeshRenderer,
  MeshCollider,
  Material,
  TextShape,
  TextAlignMode,
  InputModifier,
  engine,
  pointerEventsSystem,
  inputSystem,
  InputAction,
  PointerEventType
} from '@dcl/sdk/ecs'
import { Color4, Vector3, Quaternion } from '@dcl/sdk/math'
import ReactEcs, { Label, type JSX } from '@dcl/sdk/react-ecs'
import { movePlayerTo } from '~system/RestrictedActions'
import { sceneEntities } from '../../utils/entity'
import { sceneSystems } from '../../utils/system'
import { UiBox } from '../../utils/ui/box'

// The scene is 7×7 parcels (base 0,0, range -3..3). Scene-local coords span
// roughly (-48..64) on x/z. We use that extent so glides actually need the
// whole scene to cross between zones.

// Drop altitudes (m). 100 m sits near the hard height cap for this 49-parcel
// scene; lower heights let you test double-jump without triggering glide.
const HEIGHTS: number[] = [10, 30, 60, 100]

const PAD_COLORS: Color4[] = [
  Color4.create(0.3, 0.7, 0.9, 1), //  10 m — cyan
  Color4.create(0.95, 0.85, 0.25, 1), //  30 m — yellow
  Color4.create(0.95, 0.5, 0.2, 1), //  60 m — orange
  Color4.create(0.9, 0.25, 0.25, 1) // 100 m — red
]

// One zone = a horizontal rectangle at ground level that overrides the
// player's InputModifier while they stand (or fall) inside it. Zones are
// spread far apart so a glider launched from the pads can drift between
// them mid-flight and exercise the scene-transition logic.
type ZoneFlags = {
  disableAll?: boolean
  disableJump?: boolean
  disableDoubleJump?: boolean
  disableGliding?: boolean
}

type Zone = {
  id: string
  name: string
  description: string
  center: Vector3
  halfExtents: Vector3
  color: Color4
  flags: ZoneFlags
}

// Zones arrayed along the X axis at z=8, spanning the scene. Each zone is
// 14m × 14m × 20m vertical so drops landing inside count as "in zone".
const ZONE_HALF: Vector3 = Vector3.create(7, 10, 7)
const ZONE_Z = 8
const ZONES: Zone[] = [
  {
    id: 'disable_all',
    name: 'DISABLE ALL',
    description: 'All input off. No move, no jump, no glide.',
    center: Vector3.create(-36, 0, ZONE_Z),
    halfExtents: ZONE_HALF,
    color: Color4.create(0.15, 0.15, 0.15, 1),
    flags: { disableAll: true }
  },
  {
    id: 'disable_jump',
    name: 'NO JUMP',
    description:
      'disable_jump: no ground jump, no double jump, no glide (jump press is the gateway).',
    center: Vector3.create(-18, 0, ZONE_Z),
    halfExtents: ZONE_HALF,
    color: Color4.create(0.45, 0.1, 0.55, 1),
    flags: { disableJump: true }
  },
  {
    id: 'disable_double_jump',
    name: 'NO DOUBLE JUMP',
    description:
      'disable_double_jump: ground jump works, air jump does not. Joypad icon → SINGLE_JUMP.',
    center: Vector3.create(0, 0, ZONE_Z),
    halfExtents: ZONE_HALF,
    color: Color4.create(0.15, 0.45, 0.9, 1),
    flags: { disableDoubleJump: true }
  },
  {
    id: 'disable_gliding',
    name: 'NO GLIDE',
    description:
      'disable_gliding: double jump works, glider never opens. Mid-glide entry force-closes.',
    center: Vector3.create(18, 0, ZONE_Z),
    halfExtents: ZONE_HALF,
    color: Color4.create(0.9, 0.25, 0.25, 1),
    flags: { disableGliding: true }
  },
  {
    id: 'default',
    name: 'DEFAULT',
    description: 'All actions enabled. Joypad icon → DOUBLE_JUMP.',
    center: Vector3.create(36, 0, ZONE_Z),
    halfExtents: ZONE_HALF,
    color: Color4.create(0.25, 0.75, 0.35, 1),
    flags: {}
  }
]

function createTeleportPad(
  padPos: Vector3,
  height: number,
  color: Color4
): void {
  // Base plinth
  const pad = sceneEntities.addEntity()
  Transform.create(pad, {
    position: padPos,
    scale: Vector3.create(2.6, 0.3, 2.6)
  })
  MeshRenderer.setBox(pad)
  MeshCollider.setBox(pad)
  Material.setPbrMaterial(pad, {
    albedoColor: color,
    emissiveColor: color,
    emissiveIntensity: 0.6
  })

  // Click target teleports the player to (padPos.x, height, padPos.z). Landing
  // back down hits the same pad, so repeat drops are one click each.
  pointerEventsSystem.onPointerDown(
    {
      entity: pad,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: `Teleport to ${height} m`,
        maxDistance: 20,
        showFeedback: true
      }
    },
    () => {
      movePlayerTo({
        newRelativePosition: Vector3.create(padPos.x, height, padPos.z)
      })
        .then()
        .catch(console.error)
    }
  )

  const label = sceneEntities.addEntity()
  Transform.create(label, {
    position: Vector3.create(padPos.x, padPos.y + 2.2, padPos.z),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(label, {
    text: `${height} m`,
    fontSize: 5,
    textColor: Color4.White(),
    outlineWidth: 0.1,
    outlineColor: Color4.Black()
  })

  // Floating disc at the drop altitude — line-of-sight cue for where you'll
  // appear when you click.
  const marker = sceneEntities.addEntity()
  Transform.create(marker, {
    position: Vector3.create(padPos.x, height, padPos.z),
    scale: Vector3.create(1.8, 0.15, 1.8)
  })
  MeshRenderer.setCylinder(marker)
  Material.setPbrMaterial(marker, {
    albedoColor: color,
    emissiveColor: color,
    emissiveIntensity: 0.9
  })
}

function createZone(zone: Zone): void {
  const size = Vector3.create(
    zone.halfExtents.x * 2,
    0.2,
    zone.halfExtents.z * 2
  )

  // Floor tile
  const tile = sceneEntities.addEntity()
  Transform.create(tile, {
    position: Vector3.create(zone.center.x, 0.1, zone.center.z),
    scale: size
  })
  MeshRenderer.setBox(tile)
  MeshCollider.setBox(tile)
  Material.setPbrMaterial(tile, {
    albedoColor: zone.color,
    emissiveColor: zone.color,
    emissiveIntensity: 0.35
  })

  // Name floating above. Faces -Z so it reads when approaching from the
  // launch area (which sits at higher z).
  const nameLabel = sceneEntities.addEntity()
  Transform.create(nameLabel, {
    position: Vector3.create(zone.center.x, 4.0, zone.center.z),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(nameLabel, {
    text: zone.name,
    fontSize: 4.5,
    textAlign: TextAlignMode.TAM_MIDDLE_CENTER,
    textColor: Color4.White(),
    outlineColor: Color4.Black(),
    outlineWidth: 0.2
  })

  const descLabel = sceneEntities.addEntity()
  Transform.create(descLabel, {
    position: Vector3.create(zone.center.x, 2.6, zone.center.z),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(descLabel, {
    text: zone.description,
    fontSize: 1.6,
    textAlign: TextAlignMode.TAM_MIDDLE_CENTER,
    textColor: Color4.White(),
    outlineColor: Color4.Black(),
    outlineWidth: 0.15
  })
}

// Rescue target sits on the launch ground, clear of every zone. Useful when
// DISABLE ALL locks your locomotion and you need a way out.
const RESCUE_POSITION: Vector3 = Vector3.create(0, 1, 32)

// disable_all only blocks walk/jog/run/jump/emote — scene-level input actions
// still fire, so IA_PRIMARY (E) is a safe escape hatch from any trap zone.
function rescueSystem(): void {
  if (
    inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)
  ) {
    movePlayerTo({ newRelativePosition: RESCUE_POSITION })
      .then()
      .catch(console.error)
  }
}

function playerInZone(pos: Vector3, zone: Zone): boolean {
  const dx = pos.x - zone.center.x
  const dz = pos.z - zone.center.z
  return (
    Math.abs(dx) <= zone.halfExtents.x && Math.abs(dz) <= zone.halfExtents.z
  )
}

// Current zone id is exposed via this variable so the UI can render it. The
// system below writes it on every tick.
let _currentZoneId: string = 'none'
let _currentZoneName: string = 'Outside zones'
let _currentFlagsLabel: string = 'All actions enabled (no InputModifier set)'

function applyZoneFlags(flags: ZoneFlags): void {
  // Any defined flag (including false) would mark the component dirty; we
  // only pass truthy flags so the component encodes minimally and the Rust
  // side reads `unwrap_or(false)` for the rest.
  const standard: ZoneFlags = {}
  if (flags.disableAll === true) standard.disableAll = true
  if (flags.disableJump === true) standard.disableJump = true
  if (flags.disableDoubleJump === true) standard.disableDoubleJump = true
  if (flags.disableGliding === true) standard.disableGliding = true

  InputModifier.createOrReplace(engine.PlayerEntity, {
    mode: { $case: 'standard', standard }
  })
}

function clearInputModifier(): void {
  if (InputModifier.has(engine.PlayerEntity)) {
    InputModifier.deleteFrom(engine.PlayerEntity)
  }
}

function zoneSystem(): void {
  const t = Transform.getOrNull(engine.PlayerEntity)
  if (t === null) return
  const pos = t.position

  let matched: Zone | undefined
  for (const zone of ZONES) {
    if (playerInZone(pos, zone)) {
      matched = zone
      break
    }
  }

  if (matched === undefined) {
    if (_currentZoneId !== 'none') {
      _currentZoneId = 'none'
      _currentZoneName = 'Outside zones'
      _currentFlagsLabel = 'All actions enabled (no InputModifier set)'
      clearInputModifier()
    }
    return
  }

  if (matched.id === _currentZoneId) return

  _currentZoneId = matched.id
  _currentZoneName = matched.name
  _currentFlagsLabel = formatFlags(matched.flags)
  if (matched.id === 'default') {
    clearInputModifier()
  } else {
    applyZoneFlags(matched.flags)
  }
}

function formatFlags(flags: ZoneFlags): string {
  const parts: string[] = []
  if (flags.disableAll === true) parts.push('disable_all')
  if (flags.disableJump === true) parts.push('disable_jump')
  if (flags.disableDoubleJump === true) parts.push('disable_double_jump')
  if (flags.disableGliding === true) parts.push('disable_gliding')
  if (parts.length === 0) return 'none'
  return parts.join(', ')
}

export function main(): void {
  console.log('[glide-test] scene loaded')

  // Wide ground plate under the zones so the player can walk between them
  // without falling. Covers the full X range of the zones with margin.
  const ground = sceneEntities.addEntity()
  Transform.create(ground, {
    position: Vector3.create(0, 0, ZONE_Z),
    scale: Vector3.create(96, 0.05, 18)
  })
  MeshRenderer.setBox(ground)
  MeshCollider.setBox(ground)
  Material.setPbrMaterial(ground, {
    albedoColor: Color4.create(0.18, 0.18, 0.2, 1)
  })

  // Launch area sits north of the zones, so when you drop from a pad you
  // face the zone row and land in whichever one you glide toward.
  const launchGround = sceneEntities.addEntity()
  Transform.create(launchGround, {
    position: Vector3.create(0, 0, 32),
    scale: Vector3.create(30, 0.1, 18)
  })
  MeshRenderer.setBox(launchGround)
  MeshCollider.setBox(launchGround)
  Material.setPbrMaterial(launchGround, {
    albedoColor: Color4.create(0.22, 0.25, 0.22, 1)
  })

  const title = sceneEntities.addEntity()
  Transform.create(title, {
    position: Vector3.create(0, 6, 38),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  TextShape.create(title, {
    text:
      'GLIDE / INPUT-MODIFIER TEST\n' +
      '\n' +
      'Click a pad to teleport up, then glide south (-Z) across the zones.\n' +
      'Each zone toggles a different scene-level input disable.\n' +
      'Watch the joypad jump icon and observe mid-glide force-close.\n' +
      'Press E (IA_PRIMARY) to teleport back to the launch area.',
    fontSize: 2.5,
    textAlign: TextAlignMode.TAM_MIDDLE_CENTER,
    textColor: Color4.White(),
    outlineWidth: 0.1,
    outlineColor: Color4.Black()
  })

  // Teleport pads centered on X=0, spaced along X so you can pick altitude
  // from either side without walking over the zones.
  const padSpacing = 4
  const startX = -((HEIGHTS.length - 1) * padSpacing) / 2
  const padZ = 30

  HEIGHTS.forEach((height, i) => {
    const padPos = Vector3.create(startX + i * padSpacing, 0.3, padZ)
    createTeleportPad(padPos, height, PAD_COLORS[i])
  })

  // Ground zones (the actual subjects under test).
  for (const zone of ZONES) {
    createZone(zone)
  }

  // Reset the modifier on scene entry — re-entering from another test
  // shouldn't inherit a previous scene's disable state.
  clearInputModifier()
  _currentZoneId = 'none'
  _currentZoneName = 'Outside zones'
  _currentFlagsLabel = 'All actions enabled (no InputModifier set)'

  sceneSystems.addSystem(zoneSystem, undefined, 'glide-test/zone-system')
  sceneSystems.addSystem(rescueSystem, undefined, 'glide-test/rescue-system')
}

export function UI(): JSX.Element {
  return (
    <UiBox width={420} height={180} uiTransform={{ padding: 10 }}>
      <Label
        value="Input-Modifier / Glide Test"
        fontSize={18}
        color={Color4.Yellow()}
        uiTransform={{ height: 28 }}
      />
      <Label
        value={`Current zone: ${_currentZoneName}`}
        fontSize={14}
        uiTransform={{ height: 22 }}
      />
      <Label
        value={`Flags: ${_currentFlagsLabel}`}
        fontSize={12}
        uiTransform={{ height: 20 }}
      />
      <Label
        value="Pads: teleport up. Glide south across zones."
        fontSize={12}
        color={Color4.Gray()}
        uiTransform={{ height: 20 }}
      />
      <Label
        value="Stuck? Press E to teleport back to launch."
        fontSize={12}
        color={Color4.Yellow()}
        uiTransform={{ height: 20 }}
      />
      <Label
        value="Expected icon in each zone:"
        fontSize={12}
        uiTransform={{ height: 20, margin: { top: 4 } }}
      />
      <Label
        value="NO DOUBLE JUMP → SINGLE_JUMP; NO GLIDE → DOUBLE_JUMP; DEFAULT → DOUBLE_JUMP"
        fontSize={11}
        color={Color4.create(0.7, 0.9, 1, 1)}
        uiTransform={{ height: 18 }}
      />
    </UiBox>
  )
}
